export interface BaseCompanyData {
  name: string;
  registeredAddress: string;
  incorporationDate: Date;
  status: "ACTIVE" | "INACTIVE" | "DISSOLVED";
  lei?: string;
  lastUpdated: Date;
}

export interface GLEIFEntity {
  lei: string;
  entity: {
    legalName: {
      name: string;
      language: string;
    }[];
    legalAddress: {
      addressLines: string[];
      city: string;
      country: string;
      postalCode: string;
    };
    headquartersAddress?: {
      addressLines: string[];
      city: string;
      country: string;
      postalCode: string;
    };
    status: string;
    legalForm?: {
      id: string;
      other: string;
    };
  };
  registration: {
    initialRegistrationDate: string;
    lastUpdateDate: string;
    status: string;
  };
}

export interface GLEIFRelationship {
  relationship: {
    startNode: { nodeID: string };
    endNode: { nodeID: string };
    relationshipType: string;
    startDate: string;
    endDate?: string;
  };
}
