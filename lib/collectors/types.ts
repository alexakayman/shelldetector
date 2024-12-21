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

export interface OpenCorporatesCompany {
  name: string;
  company_number: string;
  jurisdiction_code: string;
  incorporation_date: string | null;
  dissolution_date: string | null;
  company_type: string;
  registry_url: string;
  branch: string | null;
  branch_status: string | null;
  inactive: boolean;
  current_status: string;
  created_at: string;
  updated_at: string;
  retrieved_at: string;
  opencorporates_url: string;
  previous_names: string[] | null;
  source: {
    publisher: string;
    url: string;
    retrieved_at: string;
  };
  corporate_groupings: any[];
  data: {
    most_recent: Array<{
      datum: {
        id: number;
        title: string;
        data_type: string;
        description: string;
        opencorporates_url: string;
      };
    }>;
    total_count: number;
    url: string;
  };
  filings: any[];
  officers: any[];
}

export interface OpenCorporatesResponse<T> {
  api_version: string;
  results: T;
}
