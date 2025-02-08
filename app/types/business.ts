export interface BusinessEntity {
  id: string;
  name: string;
  registrationDate: string;
  status: "Active" | "Inactive" | "Suspended";
  riskScore: number;
  riskFactors: string[];
  lastFilingDate: string;
  address: string;
  relatedEntities?: RelatedEntity[];
}

export interface GleifObject {
  type: "fuzzycompletions";
  attributes: {
    value: string;
  };
  relationships: {
    "lei-records": {
      data: {
        type: "lei-records";
        id: string;
      };
      links: {
        related: string;
      };
    };
  };
}

export interface RelatedEntity {
  id: string;
  name: string;
  relationship: string;
  riskScore: number;
}

export interface SearchResults {
  query: string;
  results: BusinessEntity[];
}
