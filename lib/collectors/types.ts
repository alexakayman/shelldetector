// GLEIF specific types
interface GLEIFResponse {
  data: {
    attributes: {
      lei: string;
      entity: {
        legalName: string;
        legalAddress: {
          addressLines: string[];
          city: string;
          country: string;
          postalCode: string;
        };
        status: string;
      };
      registration: {
        initialRegistrationDate: string;
        lastUpdateDate: string;
      };
    };
    relationships: {
      directParent: GLEIFRelationship;
      ultimateParent: GLEIFRelationship;
    };
  };
}

interface GLEIFRelationship {
  lei: string;
  name: string;
  relationshipType: string;
  relationshipPeriod: {
    startDate: string;
    endDate?: string;
  };
}

// SEC EDGAR specific types
interface EDGARResponse {
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      form: string[];
      primaryDocument: string[];
    };
  };
}
