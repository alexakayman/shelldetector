// src/lib/collectors/gleif.ts
import { BaseCompanyData, GLEIFEntity, GLEIFRelationship } from "./types";
import { pathcat } from "pathcat";

// GLEIF Fuzzy Search Response Types
export interface GLEIFFuzzyResponse {
  data: GLEIFFuzzyCompletion[];
}

export interface GLEIFFuzzyCompletion {
  type: "fuzzycompletions";
  attributes: {
    value: string;
  };
  relationships: {
    "lei-records": {
      data: {
        type: "lei-records";
        id: string; // This is the LEI
      };
      links: {
        related: string;
      };
    };
  };
}

export class GLEIFCollector {
  private readonly baseUrl = "https://api.gleif.org/api/v1";
  // private readonly apiKey: string;

  // constructor(apiKey: string) {
  //   this.apiKey = apiKey;
  // }

  // initial base run for all further queries. ex, fuzzy match calls this first -> fuzzy match logic.
  private async fetchWithAuth<T>(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        // Authorization: `Bearer ${this.apiKey}`, // no api key needed, public api
        Accept: "application/vnd.api+json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("GLEIF API rate limit exceeded");
      }

      console.log(await response.text());

      throw new Error(`GLEIF API error: ${response.statusText}`);
    }

    return response.json() as T;
  }

  private formatAddress(
    address: GLEIFEntity["entity"]["legalAddress"]
  ): string {
    return [
      ...address.addressLines,
      address.city,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  async getCompanyByLEI(lei: string): Promise<BaseCompanyData> {
    try {
      const { data } = await this.fetchWithAuth<{ data: any }>(
        `/lei-records/${lei}`
      ); // TODO: type this
      const entity: GLEIFEntity = data.attributes;

      return {
        name: entity.entity.legalName[0].name,
        registeredAddress: this.formatAddress(entity.entity.legalAddress),
        incorporationDate: new Date(
          entity.registration.initialRegistrationDate
        ),
        status: entity.entity.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
        lei: entity.lei,
        lastUpdated: new Date(entity.registration.lastUpdateDate),
      };
    } catch (error) {
      console.error(`Error fetching company with LEI ${lei}:`, error);
      throw error;
    }
  }

  async getRelatedCompanies(
    lei: string
  ): Promise<Map<string, BaseCompanyData>> {
    try {
      const relatedCompanies = new Map<string, BaseCompanyData>();

      // Fetch direct and ultimate parent relationships
      const relationships = await this.fetchWithAuth<{ data: any[] }>(
        `/lei-records/${lei}/direct-parents`
      );

      for (const relationship of relationships.data) {
        const relatedLEI = relationship.relationships.parent.data.id;
        if (!relatedCompanies.has(relatedLEI)) {
          const companyData = await this.getCompanyByLEI(relatedLEI);
          relatedCompanies.set(relatedLEI, companyData);
        }
      }

      return relatedCompanies;
    } catch (error) {
      console.error(`Error fetching related companies for LEI ${lei}:`, error);
      throw error;
    }
  }

  // fuzzy search to generate an initial list of companies post input. This can either return company names (fuzzy matched) or check a keyword against the entirety of a GLEIF incorporation article.
  async fuzzySearch(
    query: string,
    options: {
      field?: "fulltext" | "entity.legalName" | "previousLegalName"; // append field
    } = {}
  ) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        field: options.field || "fulltext",
      });

      const { data } = await this.fetchWithAuth<GLEIFFuzzyResponse>(
        `/fuzzycompletions?${searchParams.toString()}`
      );

      const promises = data.map(async (result) => {
        const fullRecord = await this.fetchWithAuth<{
          data: unknown; // TODO: Actually type this
        }>(
          pathcat("/lei-records/:id", {
            id: result.relationships["lei-records"].data.id,
          })
        );

        return fullRecord.data;
      });

      return Promise.all(promises);
    } catch (error) {
      console.error(`Error performing fuzzy search for query ${query}:`, error);
      throw error;
    }
  }

  // for specific company search against exact legal incorporation
  async searchCompanies(
    query: string,
    options: { page: number; limit: number }
  ): Promise<BaseCompanyData[]> {
    try {
      const searchParams = new URLSearchParams({
        "filter[fulltext]": query,
        "page[size]": options.limit.toString(),
        "page[number]": options.page.toString(),
      });

      const { data } = await this.fetchWithAuth<{ data: any[] }>(
        `/lei-records?${searchParams.toString()}`
      );

      return await Promise.all(
        data.map(async (item: { attributes: { lei: string } }) => {
          return this.getCompanyByLEI(item.attributes.lei);
        })
      );
    } catch (error) {
      console.error(`Error searching companies with query ${query}:`, error);
      throw error;
    }
  }
}
