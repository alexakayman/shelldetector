// Core types for company data
interface BaseCompanyData {
  name: string;
  registeredAddress: string;
  incorporationDate: Date;
  status: "ACTIVE" | "INACTIVE" | "DISSOLVED";
  lei?: string; // Legal Entity Identifier
  lastUpdated: Date;
}
