// src/lib/collectors/edgar.ts
import { BaseCompanyData } from "./types";

interface EDGARSubmission {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  insiderTransactionForOwnerExists: number;
  insiderTransactionForIssuerExists: number;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  description: string;
  website: string;
  investorWebsite: string;
  category: string;
  fiscalYearEnd: string;
  stateOfIncorporation: string;
  stateOfIncorporationDescription: string;
  addresses: {
    mailing: {
      street1: string;
      street2: string | null;
      city: string;
      stateOrCountry: string;
      zipCode: string;
      stateOrCountryDescription: string;
    };
    business: {
      street1: string;
      street2: string | null;
      city: string;
      stateOrCountry: string;
      zipCode: string;
      stateOrCountryDescription: string;
    };
  };
  phone: string;
  flags: string;
  formerNames: Array<{
    name: string;
    from: string;
    to: string;
  }>;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      acceptanceDateTime: string[];
      act: string[];
      form: string[];
      fileNumber: string[];
      filmNumber: string[];
      items: string[];
      size: number[];
      isXBRL: number[];
      isInlineXBRL: number[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
    files: Array<{
      name: string;
      filingCount: number;
      filingFrom: string;
      filingTo: string;
    }>;
  };
}

interface Filing {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string;
  primaryDocument: string;
}

export class EDGARCollector {
  private readonly baseUrl = "https://data.sec.gov";
  private readonly userAgent: string;
  private readonly cache: Map<string, EDGARSubmission> = new Map();

  constructor(userAgent: string) {
    this.userAgent = userAgent;
  }

  private async fetchWithHeaders(url: string) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("SEC EDGAR API rate limit exceeded");
      }
      throw new Error(`SEC EDGAR API error: ${response.statusText}`);
    }

    return response.json();
  }

  private formatCIK(cik: string): string {
    return cik.padStart(10, "0");
  }

  async getCompanyInfo(cik: string): Promise<EDGARSubmission> {
    try {
      const formattedCIK = this.formatCIK(cik);

      if (this.cache.has(formattedCIK)) {
        return this.cache.get(formattedCIK)!;
      }

      const data = await this.fetchWithHeaders(
        `${this.baseUrl}/submissions/CIK${formattedCIK}.json`
      );

      this.cache.set(formattedCIK, data);
      return data;
    } catch (error) {
      console.error(`Error fetching company info for CIK ${cik}:`, error);
      throw error;
    }
  }

  async getRecentFilings(cik: string): Promise<Filing[]> {
    try {
      const companyInfo = await this.getCompanyInfo(cik);
      const recentFilings = companyInfo.filings.recent;

      return recentFilings.accessionNumber.map((accessionNumber, index) => ({
        accessionNumber,
        form: recentFilings.form[index],
        filingDate: recentFilings.filingDate[index],
        reportDate: recentFilings.reportDate[index],
        primaryDocument: recentFilings.primaryDocument[index],
      }));
    } catch (error) {
      console.error(`Error fetching recent filings for CIK ${cik}:`, error);
      throw error;
    }
  }

  async getFilingDocument(
    cik: string,
    accessionNumber: string,
    primaryDocument: string
  ): Promise<string> {
    try {
      const formattedCIK = this.formatCIK(cik);
      const formattedAccessionNumber = accessionNumber.replace(/-/g, "");

      const response = await fetch(
        `${this.baseUrl}/Archives/edgar/data/${formattedCIK}/` +
          `${formattedAccessionNumber}/${primaryDocument}`,
        {
          headers: {
            "User-Agent": this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch filing document: ${response.statusText}`
        );
      }

      return response.text();
    } catch (error) {
      console.error(
        `Error fetching filing document for CIK ${cik}, ` +
          `accession ${accessionNumber}:`,
        error
      );
      throw error;
    }
  }

  async searchCompanies(query: string): Promise<BaseCompanyData[]> {
    // Note: SEC EDGAR doesn't provide a direct search API
    // You would need to implement a custom solution or use a third-party service
    throw new Error("EDGAR company search not implemented");
  }

  async parseFilingToBaseCompanyData(
    submission: EDGARSubmission
  ): Promise<BaseCompanyData> {
    return {
      name: submission.name,
      registeredAddress: [
        submission.addresses.business.street1,
        submission.addresses.business.street2,
        submission.addresses.business.city,
        submission.addresses.business.stateOrCountry,
        submission.addresses.business.zipCode,
      ]
        .filter(Boolean)
        .join(", "),
      incorporationDate: new Date(), // Not available in EDGAR
      status: "ACTIVE", // EDGAR only lists active companies
      lastUpdated: new Date(submission.filings.recent.filingDate[0]),
    };
  }
}
