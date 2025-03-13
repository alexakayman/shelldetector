"use client";

import React, { useState, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Info,
  Search,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { LEIRecordData } from "@/types/company";
import { Button } from "@/components/ui/button";

// Dynamically import ReactFlow to avoid SSR issues
const CompanyHierarchyFlow = dynamic(
  () => import("@/app/components/CompanyHierarchyFlow"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-teal-800 font-medium">
            Loading company hierarchy data...
          </p>
        </div>
      </div>
    ),
  }
);

// Define interface for company data
interface LayoutOptions {
  direction: "horizontal" | "vertical";
  nodeSeparation: number;
  rankSeparation: number;
}

export default function CompanyHierarchyPage() {
  const params = useParams();
  const router = useRouter();
  const company_lei = params.company_lei as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [companyData, setCompanyData] = useState<LEIRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/companies/${company_lei}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.errors?.[0]?.detail || "Failed to fetch company data"
          );
        }
        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching company data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (company_lei) {
      fetchCompanyData();
    }
  }, [company_lei]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-teal-800 font-medium">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="text-red-500 mb-4">
            <Info size={48} />
          </div>
          <p className="text-red-800 font-medium mb-2">
            Error Loading Company Data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="text-gray-500 mb-4">
            <Info size={48} />
          </div>
          <p className="text-gray-800 font-medium">No Company Data Found</p>
          <p className="text-gray-600">
            Could not find company with LEI: {company_lei}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-[#EEECE7] text-[#797773] hover:bg-[#E5E2DC] rounded-full flex items-center gap-2"
            onClick={() => router.push(`/company/${company_lei}`)}
          >
            <ArrowLeft size={16} />
            Back to Company View
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Corporate Incorporation Structure
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {companyData.attributes.entity.legalName.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="py-2 px-4 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-64"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <button
              className="flex items-center gap-1 py-2 px-4 border border-gray-300 rounded-full bg-[#EEECE7] text-[#797773] hover:bg-[#E5E2DC]"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span>Filters</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Filter Options
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jurisdiction
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="all">All Jurisdictions</option>
                        <option value="us">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="canada">Canada</option>
                        <option value="eu">European Union</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity Type
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="all">All Types</option>
                        <option value="llc">LLC</option>
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                        <option value="plc">PLC</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                      Reset
                    </button>
                    <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            title="Information"
          >
            <Info size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden bg-gray-50">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-teal-800 font-medium">
                  Loading visualization...
                </p>
              </div>
            </div>
          }
        >
          <CompanyHierarchyFlow companyData={companyData} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Data last updated: {new Date().toLocaleDateString()}
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            title="Zoom In"
          >
            <ZoomIn size={20} className="text-gray-600" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut size={20} className="text-gray-600" />
          </button>
          <select className="py-1 px-2 border border-gray-300 rounded-md text-sm">
            <option value="100">100%</option>
            <option value="75">75%</option>
            <option value="50">50%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
          </select>
        </div>
      </footer>
    </div>
  );
}
