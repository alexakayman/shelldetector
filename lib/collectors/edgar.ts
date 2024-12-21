class EDGARCollector {
  private readonly baseUrl = "https://data.sec.gov/submissions";
  private readonly userAgent: string;

  constructor(userAgent: string) {
    this.userAgent = userAgent;
  }

  async getCompanyFilings(cik: string): Promise<EDGARResponse> {
    const response = await fetch(`${this.baseUrl}/CIK${cik}.json`, {
      headers: {
        "User-Agent": this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`EDGAR API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getFilingDetails(accessionNumber: string): Promise<any> {
    // Implementation for getting specific filing details
  }
}
