import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node component
const CompanyNode = ({ data }) => {
  return (
    <div
      className="p-4 bg-white rounded-lg shadow-md border border-teal-500"
      style={{ minWidth: "240px" }}
    >
      <div className="font-semibold text-lg mb-2 text-teal-800">
        {data.name}
      </div>
      <div className="text-sm text-gray-600 mb-2">LEI: {data.lei}</div>
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Jurisdiction:</span>
          <span className="font-medium">{data.jurisdiction}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className="font-medium">{data.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Type:</span>
          <span className="font-medium">{data.entityType}</span>
        </div>
        {data.incorporationDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Incorporated:</span>
            <span className="font-medium">{data.incorporationDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for company hierarchy
const mockCompanies = {
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

const nodeTypes = {
  company: CompanyNode,
};

const CompanyHierarchyFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState("horizontal");

  // Function to build nodes and edges from company data
  const buildHierarchy = useCallback(() => {
    const allCompanies = [
      mockCompanies.parent,
      ...mockCompanies.subsidiaries,
      ...mockCompanies.grandchildren,
    ];

    // Generate nodes
    const nodes = allCompanies.map((company) => ({
      id: company.id,
      data: {
        ...company,
      },
      position: company.position,
      type: "company",
    }));

    // Generate edges
    const edges = [];
    [...mockCompanies.subsidiaries, ...mockCompanies.grandchildren].forEach(
      (company) => {
        if (company.parentId) {
          edges.push({
            id: `${company.parentId}-${company.id}`,
            source: company.parentId,
            target: company.id,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#14b8a6", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#14b8a6",
              width: 20,
              height: 20,
            },
          });
        }
      }
    );

    setNodes(nodes);
    setEdges(edges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    buildHierarchy();
  }, [buildHierarchy]);

  // Auto-layout positioning (not implemented - would require dagre or custom algorithm)
  const applyLayout = useCallback(
    (layoutType) => {
      setLayout(layoutType);
      // For a real implementation, we'd use dagre or another layout algorithm here
      // For this mockup, we'll just use the predefined positions
      buildHierarchy();
    },
    [buildHierarchy]
  );

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={1.5}
        defaultZoom={0.8}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor="#14b8a6"
          nodeColor="#ffffff"
          nodeBorderRadius={8}
        />
        <Background color="#f9fafb" gap={16} />
        <Panel position="top-left">
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-teal-800 mb-2">
              Company Incorporation Hierarchy
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => applyLayout("horizontal")}
                className={`px-3 py-1 text-sm rounded-md ${
                  layout === "horizontal"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Horizontal
              </button>
              <button
                onClick={() => applyLayout("vertical")}
                className={`px-3 py-1 text-sm rounded-md ${
                  layout === "vertical"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Vertical
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default CompanyHierarchyFlow;
