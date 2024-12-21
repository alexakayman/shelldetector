// src/lib/collectors/gleif.ts
import { BaseCompanyData, GLEIFEntity, GLEIFRelationship } from "./types";

interface FuzzySearchResult {
  lei: string;
  legalName: string;
  matchScore: number;
  status: string;
  legalAddress: string;
  registrationAuthority: string;
}

interface GLEIFFuzzyResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      lei: string;
      entity: {
        legalName: Array<{
          name: string;
          language: string;
        }>;
        legalAddress: {
          addressLines: string[];
          city: string;
          country: string;
          postalCode: string;
        };
        status: string;
        registrationAuthority: {
          registrationAuthorityID: string;
          registrationAuthorityEntityID: string;
        };
      };
      score: number;
    };
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export class GLEIFCollector {
  private readonly baseUrl = "https://api.gleif.org/api/v1";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithAuth(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("GLEIF API rate limit exceeded");
      }
      throw new Error(`GLEIF API error: ${response.statusText}`);
    }

    return response.json();
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
      const { data } = await this.fetchWithAuth(`/lei-records/${lei}`);
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
      const relationships = await this.fetchWithAuth(
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

  async fuzzySearch(
    query: string,
    options: {
      page?: number;
      pageSize?: number;
      field?: "fulltext" | "legalName" | "previousLegalName";
    } = {}
  ): Promise<FuzzySearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        field: options.field || "fulltext",
        page: (options.page || 1).toString(),
        page_size: (options.pageSize || 10).toString(),
      });

      const response = await this.fetchWithAuth(
        `/fuzzycompletions?${searchParams.toString()}`
      );

      const data = response as GLEIFFuzzyResponse;

      return data.data.map((item) => ({
        lei: item.attributes.lei,
        legalName: item.attributes.entity.legalName[0]?.name || "",
        matchScore: item.attributes.score,
        status: item.attributes.entity.status,
        legalAddress: this.formatAddress(item.attributes.entity.legalAddress),
        registrationAuthority:
          item.attributes.entity.registrationAuthority.registrationAuthorityID,
      }));
    } catch (error) {
      console.error(`Error performing fuzzy search for query ${query}:`, error);
      throw error;
    }
  }

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

      const { data } = await this.fetchWithAuth(
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
