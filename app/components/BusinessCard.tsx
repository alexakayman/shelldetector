"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusinessEntity } from "../types/business";
import { RiskMeter } from "./RiskMeter";
import { AlertCircle, Calendar, MapPin, Network } from "lucide-react";
import { useState } from "react";
import { RelationshipMap } from "./RelationshipMap";

interface BusinessCardProps {
  business: BusinessEntity;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">{business.name}</h3>
            {business.relatedEntities && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(true)}
              >
                <Network className="w-4 h-4 mr-2" />
                View Relations
              </Button>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground font-sans">
            <MapPin className="w-4 h-4 mr-1" />
            {business.address}
          </div>
        </div>

        <RiskMeter score={business.riskScore} />

        <div className="space-y-2 font-sans">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Registered: {business.registrationDate}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Last Filing: {business.lastFilingDate}</span>
          </div>
        </div>

        {business.riskFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center font-sans">
              <AlertCircle className="w-4 h-4 mr-1" />
              Risk Factors
            </h4>
            <ul className="text-sm space-y-1">
              {business.riskFactors.map((factor, index) => (
                <li key={index} className="text-muted-foreground font-sans">
                  • {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <RelationshipMap
        business={business}
        isOpen={showMap}
        onClose={() => setShowMap(false)}
      />
    </>
  );
}
