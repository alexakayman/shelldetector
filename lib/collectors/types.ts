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

export type Address = {
  language: string;
  addressLines: string[];
  addressNumber: string | null;
  addressNumberWithinBuilding: string | null;
  mailRouting: string | null;
  city: string;
  region: string | null;
  country: string;
  postalCode: string;
};

export type LegalName = {
  name: string;
  language: string;
};

export type OtherName = {
  name: string;
  language: string;
  type: string;
};

export type ValidationAuthority = {
  id: string;
  other: string | null;
};

export type EntityExpiration = {
  date: string | null;
  reason: string | null;
};

export type AssociatedEntity = {
  lei: string | null;
  name: string | null;
};

export type Event = {
  validationDocuments: string;
  effectiveDate: string;
  recordedDate: string;
  type: string;
  status: string;
};

export type EventGroup = {
  groupType: string;
  events: Event[];
};

export type Entity = {
  legalName: LegalName;
  otherNames: OtherName[];
  transliteratedOtherNames: any[]; // Based on the data, this appears to always be empty
  legalAddress: Address;
  headquartersAddress: Address;
  registeredAt: ValidationAuthority;
  registeredAs: string;
  jurisdiction: string;
  category: string;
  legalForm: {
    id: string;
    other: string | null;
  };
  associatedEntity: AssociatedEntity;
  status: string;
  expiration: EntityExpiration;
  successorEntity: AssociatedEntity;
  successorEntities: AssociatedEntity[];
  creationDate: string | null;
  subCategory: string | null;
  otherAddresses: Address[];
  eventGroups: EventGroup[];
};

export type Registration = {
  initialRegistrationDate: string;
  lastUpdateDate: string;
  status: "ISSUED" | "LAPSED";
  nextRenewalDate: string;
  managingLou: string;
  corroborationLevel: string;
  validatedAt: ValidationAuthority;
  validatedAs: string;
  otherValidationAuthorities: {
    validatedAt: {
      id: string;
    };
    validatedAs: string;
  }[];
};

export type Links = {
  "relationship-record"?: string;
  "lei-record"?: string;
  "reporting-exception"?: string;
  "relationship-records"?: string;
  related?: string;
  self?: string;
};

export type Relationships = {
  "managing-lou": { links: Links };
  "lei-issuer": { links: Links };
  "field-modifications": { links: Links };
  "direct-parent": { links: Links };
  "ultimate-parent": { links: Links };
  "direct-children"?: { links: Links };
};

export type BusinessSearchResult = {
  type: string;
  id: string;
  attributes: {
    lei: string;
    entity: Entity;
    registration: Registration;
    bic: string[] | null;
    mic: string | null;
    ocid: string | null;
    spglobal: string[];
    conformityFlag: "CONFORMING" | "NON_CONFORMING";
  };
  relationships: Relationships;
  links: {
    self: string;
  };
};
