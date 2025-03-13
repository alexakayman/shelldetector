// Core types for company data
interface BaseCompanyData {
  name: string;
  registeredAddress: string;
  incorporationDate: Date;
  status: "ACTIVE" | "INACTIVE" | "DISSOLVED";
  lei?: string; // Legal Entity Identifier
  lastUpdated: Date;
}

export interface LEIRecordData {
  type: string;
  id: string;
  attributes: {
    lei: string;
    entity: {
      legalName: {
        name: string;
        language: string;
      };
      otherNames?: Array<{
        name: string;
        language: string;
        type: string;
      }>;
      transliteratedOtherNames?: Array<any>;
      legalAddress: {
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
      headquartersAddress: {
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
      registeredAt: {
        id: string;
        other: string | null;
      };
      registeredAs: string;
      jurisdiction: string;
      category: string | null;
      legalForm: {
        id: string;
        other: string | null;
      };
      associatedEntity: {
        lei: string | null;
        name: string | null;
      } | null;
      status: string;
      expiration: {
        date: string | null;
        reason: string | null;
      } | null;
      successorEntity: {
        lei: string | null;
        name: string | null;
      } | null;
      successorEntities?: Array<any>;
      creationDate?: string;
      subCategory?: string | null;
      otherAddresses?: Array<{
        fieldType: string;
        language: string;
        type: string;
        addressLines: string[];
        addressNumber: string | null;
        city: string;
        region: string | null;
        country: string;
        postalCode: string;
      }>;
      eventGroups?: Array<any>;
    };
    registration: {
      initialRegistrationDate: string;
      lastUpdateDate: string;
      status: string;
      nextRenewalDate: string;
      managingLou: string;
      corroborationLevel: string;
      validatedAt: {
        id: string;
        other: string | null;
      };
      validatedAs: string;
      otherValidationAuthorities?: Array<any>;
    };
    bic: string[] | null;
    mic?: string | null;
    ocid?: string | null;
    spglobal?: string[];
    conformityFlag?: string;
  };
  relationships: {
    "managing-lou"?: {
      links: {
        related: string;
      };
    };
    "lei-issuer"?: {
      links: {
        related: string;
      };
    };
    "field-modifications"?: {
      links: {
        related: string;
      };
    };
    "direct-parent"?: {
      links: {
        "reporting-exception": string;
      };
    };
    "ultimate-parent"?: {
      links: {
        "reporting-exception": string;
      };
    };
    "direct-children"?: {
      links: {
        "relationship-records": string;
        related: string;
      };
    };
    "ultimate-children"?: {
      links: {
        "relationship-records": string;
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface CompanyNode {
  id: string;
  lei: string;
  name: string;
  jurisdiction: string;
  status: "Active" | "Inactive" | "Pending" | "Dissolved";
  entityType: string;
  incorporationDate?: string;
  position: {
    x: number;
    y: number;
  };
  parentId?: string;
  children?: string[];
}

export interface CompanyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relationship?: "owns" | "controls" | "operates" | "manages";
  ownershipPercentage?: number;
}

export interface CompanyHierarchyData {
  nodes: CompanyNode[];
  edges: CompanyEdge[];
}

// Mock company data structure
export interface MockCompaniesData {
  parent: CompanyNode;
  subsidiaries: CompanyNode[];
  grandchildren: CompanyNode[];
}

export type LayoutDirection = "horizontal" | "vertical";

export interface LayoutOptions {
  direction: LayoutDirection;
  nodeSeparation: number;
  rankSeparation: number;
  alignRanks?: boolean;
}

export interface FilterOptions {
  status?: string[];
  jurisdiction?: string[];
  entityType?: string[];
  incorporatedAfter?: string;
  incorporatedBefore?: string;
  searchTerm?: string;
}

export interface CompanyDetails {
  lei: string;
  name: string;
  jurisdiction: string;
  status: string;
  entityType: string;
  incorporationDate?: string;
  registrationDetails: {
    registrationAuthority: string;
    registrationNumber: string;
    registrationDate: string;
    lastUpdated: string;
  };
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  parentCompany?: {
    lei: string;
    name: string;
    ownershipPercentage?: number;
  };
  subsidiaries?: Array<{
    lei: string;
    name: string;
    ownershipPercentage?: number;
  }>;
  directors?: string[];
  website?: string;
  industry?: string;
  financials?: {
    currency: string;
    revenue?: number;
    assets?: number;
    employees?: number;
    fiscalYearEnd: string;
  };
}

export interface CompanyHierarchyResponse {
  rootCompany: CompanyDetails;
  hierarchyData: CompanyHierarchyData;
  metadata: {
    levels: number;
    totalEntities: number;
    lastUpdated: string;
    source: string;
  };
}
