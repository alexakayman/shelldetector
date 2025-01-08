"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusinessEntity } from "../types/business";
import { formatDate } from "@/lib/utils";
import { RiskMeter } from "./RiskMeter";
import { AlertCircle, Calendar, MapPin, Network } from "lucide-react";
import { useState } from "react";
import { RelationshipMap } from "./RelationshipMap";
import { BusinessSearchResult } from "@/lib/collectors/types";

interface BusinessCardProps {
  business: BusinessSearchResult;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [showMap, setShowMap] = useState(false);

  console.log(business);

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">
              {business.attributes.entity.legalName.name}
            </h3>
            {/* #TODO: Business relations map with child company, direct parent, ultimate parent */}
            {/* {business.relationships && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(true)}
              >
                <Network className="w-4 h-4 mr-2" />
                View Relations
              </Button>
            )} */}
          </div>
          <div className="flex text-sm text-muted-foreground font-sans space-x-1.5">
            <MapPin className="w-4 h-4 mt-0.5" />
            <pre className="font-sans">
              {business.attributes.entity.legalAddress.addressLines.join("\n")}
            </pre>
          </div>
        </div>

        {/* YODA: Add some support for 0-100% risk here PLZZZ */}
        <RiskMeter
          score={
            business.attributes.conformityFlag === "CONFORMING"
              ? Math.floor(Math.random() * (30 - 10 + 1)) + 10
              : Math.floor(Math.random() * (90 - 65 + 1)) + 65
          }
        />

        {/* YODA: Adjust date design */}
        <div className="space-y-2 font-sans">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              Registered:{" "}
              {formatDate(
                business.attributes.registration.initialRegistrationDate
              )}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              Last Filing:{" "}
              {formatDate(business.attributes.registration.lastUpdateDate)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              Renewal Date:{" "}
              {formatDate(business.attributes.registration.nextRenewalDate)}
            </span>
          </div>
        </div>

        {/* {business.riskFactors.length > 0 && (
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
        )} */}
      </Card>

      {/* <RelationshipMap
        business={business}
        isOpen={showMap}
        onClose={() => setShowMap(false)}
      /> */}
    </>
  );
}
