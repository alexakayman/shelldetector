// src/lib/collectors/gleif.ts
import { createCache } from "./cache";
import {
  BaseCompanyData,
  GLEIFEntity,
  GLEIFRelationship,
  Links,
  Relationships,
} from "./types";
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

export interface GLEIFLEIRecordCompletion {
  type: "lei-records";
  id: string;
  attributes: GLEIFEntity;
  relationships: Relationships;
  links: Links;
}

const cache = new Map<string, any>();

export class GLEIFCollector {
  private readonly baseUrl = "https://api.gleif.org/api/v1";

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

  private leiRecordCompletionCache = createCache({
    revalidate: async (id: string) => {
      const url = pathcat("/lei-records/:id", { id });

      const result = await this.fetchWithAuth<{
        data: GLEIFLEIRecordCompletion;
      }>(url);

      return result.data;
    },
    set: async (key, value) => {
      cache.set(key, value);
    },
    get: async (key) => {
      return cache.get(key) ?? null;
    },
  });

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

  // 01 CALL - FUZZY SEARCH
  // fuzzy search to generate an initial list of companies post input. This can either return company names (fuzzy matched) or check a keyword against the entirety of a GLEIF incorporation article.
  async fuzzySearch(
    query: string,
    options: {
      field?: "fulltext" | "entity.legalName" | "previousLegalName"; // append field
    } = {}
  ) {
    const searchParams = new URLSearchParams({
      q: query,
      field: options.field || "fulltext",
    });

    const { data } = await this.fetchWithAuth<GLEIFFuzzyResponse>(
      `/fuzzycompletions?${searchParams.toString()}`
    );

    const promises = data.map(async (result) =>
      this.leiRecordCompletionCache(result.relationships["lei-records"].data.id)
    );

    return Promise.all(promises);
  }

  // 02 CALL - GET SINGLE COMPANY FROM LIST
  // async getGLEIFCompany(lei: string) {
  //   try {
  //     const searchParams = new URLSearchParams({
  //       lei: lei,
  //     });

  //     const { data } = await this.fetchWithAuth<GLEIFEntity>(
  //       `/lei-records/${searchParams.toString()}`
  //     );

  //     const promises = data.map(async (result) => ) {
  //       //
  //     }
  //   } catch (error) {}
  // }

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
