"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CompanyHierarchyFlow from "@/app/components/CompanyHierarchyFlow";
import { useEffect, useState } from "react";
import { LEIRecordData } from "@/types/company";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CompanyInfo({
  params,
}: {
  params: { company_lei: string };
}) {
  const lei = params.company_lei;
  const router = useRouter();
  const [companyData, setCompanyData] = useState<LEIRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${lei}`);
        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }
        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [lei]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-4">
            {error || "Company data not found"}
          </p>
        </div>
      </div>
    );
  }

  const { attributes } = companyData;
  const { entity, registration } = attributes;

  return (
    <main className="min-h-screen bg-[url('img/bg.jpg')] bg-cover bg-top">
      <div className="max-w-7xl mx-auto space-y-6 p-8">
        {/* Header */}
        <div className="space-y-2 w-full">
          <div className="flex flex-row justify-between items-center gap-8">
            <h1 className="text-4xl font-serif">{entity.legalName.name}</h1>
            <Button
              variant="outline"
              className="bg-[#EEECE7] text-[#797773] hover:bg-[#E5E2DC] rounded-full flex items-center gap-2"
              onClick={() => router.push(`/`)}
            >
              <ArrowLeft size={16} />
              Back to Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#ffffff] rounded-lg pr-2 overflow-clip border border-[#EEECE7]">
              <span className="px-2 py-1 text-sm bg-[#EEECE7]">LEI</span>
              <span className="text-sm text-[#797773]">{lei}</span>
              <Copy className="w-4 h-4 text-[#797773]" />
            </div>
            <Badge
              className={`${
                entity.status === "ACTIVE" ? "bg-[#0c9b76]" : "bg-red-500"
              } text-white`}
            >
              {entity.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Core Data */}
          <Card className="bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Core Data
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <DataRow label="Legal Name" value={entity.legalName.name} />
              <DataRow label="Entity Type" value={entity.legalForm.id} />
              <DataRow
                label="Legal Address"
                value={
                  <div>
                    {entity.legalAddress.addressLines.join("<br />")}
                    <br />
                    {entity.legalAddress.city}, {entity.legalAddress.country}
                    {entity.legalAddress.postalCode &&
                      ` ${entity.legalAddress.postalCode}`}
                  </div>
                }
              />
              <DataRow label="Jurisdiction" value={entity.jurisdiction} />
              <DataRow
                label="Registration Date"
                value={registration.initialRegistrationDate}
              />
              <DataRow
                label="Last Update"
                value={registration.lastUpdateDate}
              />
              <DataRow
                label="Next Renewal"
                value={registration.nextRenewalDate}
              />
              <DataRow
                label="GLEIF Conforming"
                value={registration.status === "ISSUED" ? "YES" : "NO"}
              />
            </div>
          </Card>

          {/* Related Entities */}
          <Card className="bg-[#ffffff] relative">
            <div className="px-4 py-2 bg-[#EEECE7] flex justify-between items-center">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Corporate Structure
              </h2>
              <Link href={`/company/${lei}/flow`}>
                <Button
                  variant="outline"
                  className="bg-[#EEECE7] text-[#797773] hover:bg-[#E5E2DC] rounded-full"
                >
                  Expand
                </Button>
              </Link>
            </div>

            <div className="h-[400px] w-full">
              <CompanyHierarchyFlow preview={true} companyData={companyData} />
            </div>
          </Card>

          {/* Board Data */}
          <Card className="bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Registration Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <DataRow label="Managing LOU" value={registration.managingLou} />
              <DataRow
                label="Validation Level"
                value={registration.corroborationLevel}
              />
              <DataRow label="Validated As" value={registration.validatedAs} />
              <DataRow
                label="Validated At"
                value={registration.validatedAt.id}
              />
            </div>
          </Card>

          {/* Filing History */}
          <Card className="bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Additional Information
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {entity.category && (
                <DataRow label="Category" value={entity.category} />
              )}
              {entity.subCategory && (
                <DataRow label="Sub Category" value={entity.subCategory} />
              )}
              {entity.creationDate && (
                <DataRow label="Creation Date" value={entity.creationDate} />
              )}
              {entity.expiration?.date && (
                <DataRow
                  label="Expiration Date"
                  value={entity.expiration.date}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <span className="text-[#797773]">{label}</span>
      <span className="text-[#8caaa9]">{value}</span>
    </div>
  );
}

function EntityCard({
  name,
  location,
  status,
}: {
  name: string;
  location: string;
  status: string;
}) {
  return (
    <div className="border border-[#8caaa9] rounded p-3 text-center bg-white">
      <h3 className="font-medium mb-1">{name}</h3>
      <p className="text-sm text-[#797773]">{status}</p>
      <p className="text-sm text-[#797773]">{location}</p>
    </div>
  );
}
