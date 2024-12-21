// Data collectors
class GLEIFCollector {
  private readonly baseUrl = "https://api.gleif.org/api/v1";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompanyByLEI(lei: string): Promise<BaseCompanyData> {
    const response = await fetch(`${this.baseUrl}/lei-records/${lei}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GLEIF API error: ${response.statusText}`);
    }

    const data: GLEIFResponse = await response.json();

    return {
      name: data.data.attributes.entity.legalName,
      registeredAddress: this.formatAddress(
        data.data.attributes.entity.legalAddress
      ),
      incorporationDate: new Date(
        data.data.attributes.registration.initialRegistrationDate
      ),
      status:
        data.data.attributes.entity.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      lei: data.data.attributes.lei,
      lastUpdated: new Date(data.data.attributes.registration.lastUpdateDate),
    };
  }

  async getRelatedCompanies(
    lei: string
  ): Promise<Map<string, BaseCompanyData>> {
    const response = await fetch(
      `${this.baseUrl}/lei-records/${lei}/relationships`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GLEIF API error: ${response.statusText}`);
    }

    const data = await response.json();
    const relatedCompanies = new Map<string, BaseCompanyData>();

    // Process relationships...
    return relatedCompanies;
  }

  private formatAddress(
    address: GLEIFResponse["data"]["attributes"]["entity"]["legalAddress"]
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
}
