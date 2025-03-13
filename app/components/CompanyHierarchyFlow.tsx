import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { LEIRecordData } from "@/types/company";

interface CompanyNodeData {
  name: string;
  lei: string;
  jurisdiction: string;
  status: string;
  entityType: string;
  incorporationDate?: string;
}

interface CompanyNodeProps {
  data: CompanyNodeData;
}

// Custom node component
const CompanyNode = ({ data }: CompanyNodeProps) => {
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

const nodeTypes = {
  company: CompanyNode,
};

interface CompanyHierarchyFlowProps {
  preview?: boolean;
  companyData?: LEIRecordData;
}

// Helper function to calculate node positions in a tree layout
const calculateNodePositions = (
  nodes: Node[],
  edges: Edge[],
  direction: "horizontal" | "vertical" = "vertical"
) => {
  const nodeMap = new Map<string, Node>();
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  // Build maps for quick lookups
  nodes.forEach((node) => nodeMap.set(node.id, node));
  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
    parentMap.set(edge.target, edge.source);
  });

  // Find root nodes (nodes without parents)
  const rootNodes = nodes.filter((node) => !parentMap.has(node.id));

  // Calculate positions recursively
  const calculatePositions = (
    nodeId: string,
    level: number,
    index: number,
    totalSiblings: number
  ) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const children = childrenMap.get(nodeId) || [];
    const spacing = direction === "horizontal" ? 300 : 200;
    const levelSpacing = direction === "horizontal" ? 200 : 300;

    // Position the current node
    if (direction === "horizontal") {
      node.position = {
        x: level * levelSpacing,
        y: (index - totalSiblings / 2) * spacing,
      };
    } else {
      node.position = {
        x: (index - totalSiblings / 2) * spacing,
        y: level * levelSpacing,
      };
    }

    // Position children
    children.forEach((childId, childIndex) => {
      calculatePositions(childId, level + 1, childIndex, children.length);
    });
  };

  // Start from root nodes
  rootNodes.forEach((rootNode, index) => {
    calculatePositions(rootNode.id, 0, index, rootNodes.length);
  });

  return nodes;
};

const CompanyHierarchyFlow = ({
  preview = false,
  companyData,
}: CompanyHierarchyFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState<"horizontal" | "vertical">("vertical");
  const [loading, setLoading] = useState(false);

  // Function to fetch company data by LEI
  const fetchCompanyData = async (
    lei: string
  ): Promise<LEIRecordData | null> => {
    try {
      const response = await fetch(`/api/companies/${lei}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Error fetching company data for ${lei}:`, error);
      return null;
    }
  };

  // Function to fetch child companies recursively
  const fetchChildCompanies = async (lei: string): Promise<LEIRecordData[]> => {
    try {
      const response = await fetch(`/api/companies/${lei}/children`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Error fetching children for ${lei}:`, error);
      return [];
    }
  };

  // Function to build nodes and edges from company data
  const buildHierarchy = useCallback(async () => {
    if (!companyData) {
      // If no data, use mock data for preview
      const mockNodes = [
        {
          id: "mock-parent",
          data: {
            name: "Example Parent Corp",
            lei: "549300T3H4DK5Y21M728",
            jurisdiction: "Delaware, USA",
            status: "Active",
            entityType: "Limited Liability Company",
            incorporationDate: "2015-12-11",
          },
          position: { x: 300, y: 50 },
          type: "company",
        },
        {
          id: "mock-child",
          data: {
            name: "Example Child Corp",
            lei: "549300RZ1V2K4U3JT546",
            jurisdiction: "Delaware, USA",
            status: "Active",
            entityType: "Corporation",
            incorporationDate: "2018-03-22",
          },
          position: { x: 300, y: 250 },
          type: "company",
        },
      ];

      const mockEdges = [
        {
          id: "mock-edge",
          source: "mock-parent",
          target: "mock-child",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#14b8a6", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#14b8a6",
            width: 20,
            height: 20,
          },
        },
      ];

      setNodes(mockNodes);
      setEdges(mockEdges);
      return;
    }

    setLoading(true);
    try {
      // Build nodes from real data
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Add main company node
      nodes.push({
        id: companyData.id,
        data: {
          name: companyData.attributes.entity.legalName.name,
          lei: companyData.attributes.lei,
          jurisdiction: companyData.attributes.entity.jurisdiction,
          status: companyData.attributes.entity.status,
          entityType: companyData.attributes.entity.legalForm.id,
          incorporationDate: companyData.attributes.entity.creationDate,
        },
        position: { x: 0, y: 0 }, // Position will be calculated later
        type: "company",
      });

      // Only add parent if it's not a reporting exception
      if (
        companyData.relationships["ultimate-parent"]?.links &&
        !companyData.relationships["ultimate-parent"].links[
          "reporting-exception"
        ].includes("reporting-exception")
      ) {
        const parentLei = companyData.relationships["ultimate-parent"].links[
          "reporting-exception"
        ]
          .split("/")
          .pop();
        if (parentLei) {
          // Fetch parent company data
          const parentData = await fetchCompanyData(parentLei);
          if (parentData) {
            nodes.push({
              id: parentLei,
              data: {
                name: parentData.attributes.entity.legalName.name,
                lei: parentData.attributes.lei,
                jurisdiction: parentData.attributes.entity.jurisdiction,
                status: parentData.attributes.entity.status,
                entityType: parentData.attributes.entity.legalForm.id,
                incorporationDate: parentData.attributes.entity.creationDate,
              },
              position: { x: 0, y: 0 }, // Position will be calculated later
              type: "company",
            });

            edges.push({
              id: `${parentLei}-${companyData.id}`,
              source: parentLei,
              target: companyData.id,
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
      }

      // Fetch and add child companies recursively
      const fetchChildrenRecursively = async (
        parentId: string,
        level: number = 0
      ) => {
        if (level > 3) return; // Limit recursion depth to prevent too many API calls

        const children = await fetchChildCompanies(parentId);
        for (const child of children) {
          const childNode: Node = {
            id: child.id,
            data: {
              name: child.attributes.entity.legalName.name,
              lei: child.attributes.lei,
              jurisdiction: child.attributes.entity.jurisdiction,
              status: child.attributes.entity.status,
              entityType: child.attributes.entity.legalForm.id,
              incorporationDate: child.attributes.entity.creationDate,
            },
            position: { x: 0, y: 0 }, // Position will be calculated later
            type: "company",
          };

          nodes.push(childNode);
          edges.push({
            id: `${parentId}-${child.id}`,
            source: parentId,
            target: child.id,
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

          // Recursively fetch children of this child
          await fetchChildrenRecursively(child.id, level + 1);
        }
      };

      // Start fetching children from the main company
      await fetchChildrenRecursively(companyData.id);

      // Calculate positions for all nodes
      const positionedNodes = calculateNodePositions(nodes, edges, layout);
      setNodes(positionedNodes);
      setEdges(edges);
    } catch (error) {
      console.error("Error building hierarchy:", error);
    } finally {
      setLoading(false);
    }
  }, [companyData, layout, setNodes, setEdges]);

  useEffect(() => {
    buildHierarchy();
  }, [buildHierarchy]);

  const applyLayout = useCallback(
    (layoutType: "horizontal" | "vertical") => {
      setLayout(layoutType);
      buildHierarchy();
    },
    [buildHierarchy]
  );

  return (
    <div className={preview ? "w-full h-full" : "w-full h-screen bg-gray-50"}>
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
        zoomOnScroll={!preview}
        panOnScroll={!preview}
        zoomOnPinch={!preview}
        panOnDrag={!preview}
      >
        {!preview && <Controls />}
        {!preview && (
          <MiniMap
            nodeStrokeColor="#14b8a6"
            nodeColor="#ffffff"
            nodeBorderRadius={8}
          />
        )}
        <Background color="#f9fafb" gap={16} />
        {!preview && (
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
        )}
      </ReactFlow>
    </div>
  );
};

export default CompanyHierarchyFlow;
