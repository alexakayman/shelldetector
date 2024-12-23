// @ts-nocheck

// src/lib/collectors/opencorporates.ts
import {
  BaseCompanyData,
  OpenCorporatesCompany,
  OpenCorporatesResponse,
} from "./types";

export class OpenCorporatesCollector {
  private readonly baseUrl = "https://api.opencorporates.com";
  private readonly apiKey?: string;
  private readonly cache: Map<string, OpenCorporatesCompany> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(path: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(params);
    if (this.apiKey) {
      searchParams.append("api_token", this.apiKey);
    }
    const queryString = searchParams.toString();
    return `${this.baseUrl}${path}${queryString ? "?" + queryString : ""}`;
  }

  private async fetch<T>(
    path: string,
    params: Record<string, string> = {}
  ): Promise<OpenCorporatesResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("OpenCorporates API rate limit exceeded");
      }
      throw new Error(`OpenCorporates API error: ${response.statusText}`);
    }

    return response.json();
  }

  private getCompanyAddress(company: OpenCorporatesCompany): string {
    const addressDatum = company.data.most_recent.find(
      (item) => item.datum.data_type === "CompanyAddress"
    );
    return addressDatum?.datum.description || "Address not available";
  }

  async getCompanyByJurisdiction(
    jurisdictionCode: string,
    companyNumber: string
  ): Promise<BaseCompanyData> {
    try {
      const cacheKey = `${jurisdictionCode}/${companyNumber}`;

      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        return this.parseToBaseCompanyData(cached);
      }

      const response = await this.fetch<{ company: OpenCorporatesCompany }>(
        `/companies/${jurisdictionCode}/${companyNumber}`
      );

      const company = response.results.company;
      this.cache.set(cacheKey, company);

      return this.parseToBaseCompanyData(company);
    } catch (error) {
      console.error(
        `Error fetching company ${jurisdictionCode}/${companyNumber}:`,
        error
      );
      throw error;
    }
  }

  private parseToBaseCompanyData(
    company: OpenCorporatesCompany
  ): BaseCompanyData {
    return {
      name: company.name,
      registeredAddress: this.getCompanyAddress(company),
      incorporationDate: company.incorporation_date
        ? new Date(company.incorporation_date)
        : new Date(company.created_at),
      status: company.inactive
        ? "INACTIVE"
        : company.dissolution_date
        ? "DISSOLVED"
        : "ACTIVE",
      lastUpdated: new Date(company.updated_at),
      metadata: {
        companyNumber: company.company_number,
        jurisdictionCode: company.jurisdiction_code,
        companyType: company.company_type,
        registryUrl: company.registry_url,
        opencorporatesUrl: company.opencorporates_url,
      },
    };
  }

  async searchCompanies(
    query: string,
    options: {
      jurisdictionCode?: string;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<BaseCompanyData[]> {
    try {
      const params: Record<string, string> = {
        q: query,
        page: (options.page || 1).toString(),
        per_page: (options.perPage || 30).toString(),
      };

      if (options.jurisdictionCode) {
        params.jurisdiction_code = options.jurisdictionCode;
      }

      const response = await this.fetch<{
        companies: Array<{ company: OpenCorporatesCompany }>;
      }>("/companies/search", params);

      return response.results.companies.map((result) =>
        this.parseToBaseCompanyData(result.company)
      );
    } catch (error) {
      console.error(`Error searching companies with query ${query}:`, error);
      throw error;
    }
  }

  async getOfficers(
    jurisdictionCode: string,
    companyNumber: string
  ): Promise<
    Array<{
      name: string;
      position: string;
      startDate?: string;
      endDate?: string;
    }>
  > {
    try {
      const response = await this.fetch<{
        officers: Array<{
          officer: {
            name: string;
            position: string;
            start_date?: string;
            end_date?: string;
          };
        }>;
      }>(`/companies/${jurisdictionCode}/${companyNumber}/officers`);

      return response.results.officers.map((item) => ({
        name: item.officer.name,
        position: item.officer.position,
        startDate: item.officer.start_date,
        endDate: item.officer.end_date,
      }));
    } catch (error) {
      console.error(
        `Error fetching officers for company ${jurisdictionCode}/${companyNumber}:`,
        error
      );
      throw error;
    }
  }

  async getFilings(
    jurisdictionCode: string,
    companyNumber: string
  ): Promise<
    Array<{
      title: string;
      date: string;
      description?: string;
      url?: string;
    }>
  > {
    try {
      const response = await this.fetch<{
        filings: Array<{
          filing: {
            title: string;
            date: string;
            description?: string;
            opencorporates_url?: string;
          };
        }>;
      }>(`/companies/${jurisdictionCode}/${companyNumber}/filings`);

      return response.results.filings.map((item) => ({
        title: item.filing.title,
        date: item.filing.date,
        description: item.filing.description,
        url: item.filing.opencorporates_url,
      }));
    } catch (error) {
      console.error(
        `Error fetching filings for company ${jurisdictionCode}/${companyNumber}:`,
        error
      );
      throw error;
    }
  }
}
