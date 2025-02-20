import { MockCompaniesData, CompanyHierarchyData } from "@/types/company";

// Mock data for OpenAI's incorporation structure
export const mockOpenAIData: MockCompaniesData = {
  parent: {
    id: "openai-parent",
    lei: "549300T3H4DK5Y21M728",
    name: "OpenAI Global LLC",
    jurisdiction: "Delaware, USA",
    status: "Active",
    entityType: "Limited Liability Company",
    incorporationDate: "2015-12-11",
    position: { x: 300, y: 50 },
  },
  subsidiaries: [
    {
      id: "openai-us",
      lei: "549300RZ1V2K4U3JT546",
      name: "OpenAI Inc.",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Corporation",
      incorporationDate: "2018-03-22",
      position: { x: 100, y: 250 },
      parentId: "openai-parent",
    },
    {
      id: "openai-uk",
      lei: "549300XJ83B3F85QLT31",
      name: "OpenAI UK Ltd",
      jurisdiction: "United Kingdom",
      status: "Active",
      entityType: "Private Limited Company",
      incorporationDate: "2020-07-15",
      position: { x: 350, y: 250 },
      parentId: "openai-parent",
    },
    {
      id: "openai-canada",
      lei: "549300N936KD1SV7D968",
      name: "OpenAI Canada Inc.",
      jurisdiction: "Canada",
      status: "Active",
      entityType: "Corporation",
      incorporationDate: "2021-02-18",
      position: { x: 600, y: 250 },
      parentId: "openai-parent",
    },
  ],
  grandchildren: [
    {
      id: "openai-api",
      lei: "549300HV328E5RJT9X12",
      name: "OpenAI API Services LLC",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Limited Liability Company",
      incorporationDate: "2021-05-10",
      position: { x: 0, y: 400 },
      parentId: "openai-us",
    },
    {
      id: "openai-ventures",
      lei: "549300Q91PHL8VT4M773",
      name: "OpenAI Ventures LLC",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Limited Liability Company",
      incorporationDate: "2020-11-24",
      position: { x: 200, y: 400 },
      parentId: "openai-us",
    },
    {
      id: "openai-uk-research",
      lei: "549300MT734S6JFX5V31",
      name: "OpenAI Research UK Ltd",
      jurisdiction: "United Kingdom",
      status: "Active",
      entityType: "Private Limited Company",
      incorporationDate: "2021-01-12",
      position: { x: 350, y: 400 },
      parentId: "openai-uk",
    },
    {
      id: "openai-toronto",
      lei: "549300Z4AU6JC31KR44",
      name: "OpenAI Toronto R&D Inc.",
      jurisdiction: "Ontario, Canada",
      status: "Active",
      entityType: "Corporation",
      incorporationDate: "2022-03-05",
      position: { x: 600, y: 400 },
      parentId: "openai-canada",
    },
  ],
};

// Mock data for Anthropic's incorporation structure
export const mockAnthropicData: MockCompaniesData = {
  parent: {
    id: "anthropic-parent",
    lei: "5493001XY42HT6K9P817",
    name: "Anthropic PBC",
    jurisdiction: "Delaware, USA",
    status: "Active",
    entityType: "Public Benefit Corporation",
    incorporationDate: "2021-01-05",
    position: { x: 300, y: 50 },
  },
  subsidiaries: [
    {
      id: "anthropic-us-ops",
      lei: "5493002YF56KE9WD285",
      name: "Anthropic Operations LLC",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Limited Liability Company",
      incorporationDate: "2021-04-15",
      position: { x: 100, y: 250 },
      parentId: "anthropic-parent",
    },
    {
      id: "anthropic-uk",
      lei: "5493006PQ82ZF5LK914",
      name: "Anthropic UK Ltd",
      jurisdiction: "United Kingdom",
      status: "Active",
      entityType: "Private Limited Company",
      incorporationDate: "2022-03-22",
      position: { x: 350, y: 250 },
      parentId: "anthropic-parent",
    },
    {
      id: "anthropic-eu",
      lei: "5493008TF74KL84MD36",
      name: "Anthropic Europe GmbH",
      jurisdiction: "Germany",
      status: "Active",
      entityType: "GmbH",
      incorporationDate: "2023-01-15",
      position: { x: 600, y: 250 },
      parentId: "anthropic-parent",
    },
  ],
  grandchildren: [
    {
      id: "anthropic-claude",
      lei: "5493004VH28RM5NS632",
      name: "Claude AI Services LLC",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Limited Liability Company",
      incorporationDate: "2022-08-10",
      position: { x: 0, y: 400 },
      parentId: "anthropic-us-ops",
    },
    {
      id: "anthropic-research",
      lei: "5493009WK37YR6NH721",
      name: "Anthropic Research LLC",
      jurisdiction: "Delaware, USA",
      status: "Active",
      entityType: "Limited Liability Company",
      incorporationDate: "2021-06-18",
      position: { x: 200, y: 400 },
      parentId: "anthropic-us-ops",
    },
    {
      id: "anthropic-london",
      lei: "5493003DR92MF5JK489",
      name: "Anthropic London Research Ltd",
      jurisdiction: "United Kingdom",
      status: "Active",
      entityType: "Private Limited Company",
      incorporationDate: "2022-05-20",
      position: { x: 350, y: 400 },
      parentId: "anthropic-uk",
    },
    {
      id: "anthropic-berlin",
      lei: "5493007QE19XC3BL156",
      name: "Anthropic Berlin GmbH",
      jurisdiction: "Germany",
      status: "Active",
      entityType: "GmbH",
      incorporationDate: "2023-03-17",
      position: { x: 600, y: 400 },
      parentId: "anthropic-eu",
    },
  ],
};

// Helper function to convert MockCompaniesData to CompanyHierarchyData format
export function convertToHierarchyData(
  mockData: MockCompaniesData
): CompanyHierarchyData {
  const nodes = [
    mockData.parent,
    ...mockData.subsidiaries,
    ...mockData.grandchildren,
  ];

  const edges = [];

  // Create edges from subsidiaries to parent
  mockData.subsidiaries.forEach((subsidiary) => {
    if (subsidiary.parentId) {
      edges.push({
        id: `${subsidiary.parentId}-${subsidiary.id}`,
        source: subsidiary.parentId,
        target: subsidiary.id,
        relationship: "owns",
      });
    }
  });

  // Create edges from grandchildren to their parents
  mockData.grandchildren.forEach((grandchild) => {
    if (grandchild.parentId) {
      edges.push({
        id: `${grandchild.parentId}-${grandchild.id}`,
        source: grandchild.parentId,
        target: grandchild.id,
        relationship: "owns",
      });
    }
  });

  return { nodes, edges };
}

// Function to get all available company datasets
export function getAvailableCompanyDatasets() {
  return [
    { id: "openai", name: "OpenAI" },
    { id: "anthropic", name: "Anthropic" },
  ];
}

// Function to get a specific company dataset by ID
export function getCompanyDataset(id: string): CompanyHierarchyData | null {
  switch (id) {
    case "openai":
      return convertToHierarchyData(mockOpenAIData);
    case "anthropic":
      return convertToHierarchyData(mockAnthropicData);
    default:
      return null;
  }
}
