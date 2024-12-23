// @ts-nocheck
"use client";

import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
} from "react-flow-renderer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BusinessEntity, RelatedEntity } from "../types/business";
import { useMemo } from "react";
import { BusinessSearchResult } from "@/lib/collectors/types";

interface RelationshipMapProps {
  business: BusinessSearchResult;
  isOpen: boolean;
  onClose: () => void;
}

export function RelationshipMap({
  business,
  isOpen,
  onClose,
}: RelationshipMapProps) {
  const { nodes, edges } = useMemo(() => {
    if (!business.relatedEntities) return { nodes: [], edges: [] };

    const nodes: Node[] = [
      {
        id: business.id,
        data: {
          label: business.name,
          riskScore: business.riskScore,
        },
        position: { x: 250, y: 100 },
        className: "bg-white rounded-lg border p-4 shadow-lg",
      },
      ...business.relatedEntities.map((entity, index) => ({
        id: entity.id,
        data: {
          label: entity.name,
          riskScore: entity.riskScore,
          relationship: entity.relationship,
        },
        position: {
          x: 150 + index * 200,
          y: 300,
        },
        className: "bg-white rounded-lg border p-4 shadow-lg",
      })),
    ];

    const edges: Edge[] = business.relatedEntities.map((entity) => ({
      id: `${business.id}-${entity.id}`,
      source: business.id,
      target: entity.id,
      label: entity.relationship,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      className: "text-sm",
      labelClassName: "bg-white px-2 py-1 rounded-full text-xs",
    }));

    return { nodes, edges };
  }, [business]);

  const nodeTypes = useMemo(
    () => ({
      default: ({
        data,
      }: {
        data: { label: string; riskScore: number; relationship: string };
      }) => (
        <div className="text-center">
          <div className="font-medium text-lg">{data.label}</div>
          <div className="font-light text-xs text-slate-700">
            {data.relationship}
          </div>
          <div
            className={`text-sm mt-1 ${
              data.riskScore <= 30
                ? "text-green-600"
                : data.riskScore <= 70
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            Risk: {data.riskScore}
          </div>
        </div>
      ),
    }),
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <div className="h-full">
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
