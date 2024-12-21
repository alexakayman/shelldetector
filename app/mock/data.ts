import { BusinessEntity } from "../types/business";

export const mockSearch = async (query: string): Promise<BusinessEntity[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!query) return [];
  
  return [
    {
      id: "1",
      name: query + " LLC",
      registrationDate: "2022-01-15",
      status: "Active",
      riskScore: 25,
      riskFactors: [],
      lastFilingDate: "2024-01-15",
      address: "123 Business Ave, Dover, DE 19901",
      relatedEntities: [
        {
          id: "1a",
          name: query + " Services LLC",
          relationship: "Subsidiary",
          riskScore: 30
        },
        {
          id: "1b",
          name: query + " Management LLC",
          relationship: "Sister Company",
          riskScore: 20
        }
      ]
    },
    {
      id: "2",
      name: query + " Holdings Inc",
      registrationDate: "2023-06-01",
      status: "Active",
      riskScore: 65,
      riskFactors: [
        "Multiple address changes in short period",
        "Limited public information available"
      ],
      lastFilingDate: "2023-12-30",
      address: "456 Corporate Blvd, Wilmington, DE 19801",
      relatedEntities: [
        {
          id: "2a",
          name: query + " Ventures LLC",
          relationship: "Subsidiary",
          riskScore: 75
        },
        {
          id: "2b",
          name: query + " Capital Inc",
          relationship: "Parent Company",
          riskScore: 45
        }
      ]
    },
    {
      id: "3",
      name: query + " International Corp",
      registrationDate: "2023-11-30",
      status: "Active",
      riskScore: 85,
      riskFactors: [
        "Recently registered",
        "Multiple related entities",
        "Incomplete filing history",
        "Unusual transaction patterns"
      ],
      lastFilingDate: "2024-02-01",
      address: "789 Enterprise St, Dover, DE 19904",
      relatedEntities: [
        {
          id: "3a",
          name: query + " Global Trading Ltd",
          relationship: "Subsidiary",
          riskScore: 90
        },
        {
          id: "3b",
          name: query + " Offshore Holdings",
          relationship: "Sister Company",
          riskScore: 95
        },
        {
          id: "3c",
          name: query + " Investment Group",
          relationship: "Parent Company",
          riskScore: 70
        }
      ]
    }
  ];
};