// Core types for company data
interface BaseCompanyData {
  name: string;
  registeredAddress: string;
  incorporationDate: Date;
  status: "ACTIVE" | "INACTIVE" | "DISSOLVED";
  lei?: string; // Legal Entity Identifier
  lastUpdated: Date;
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
