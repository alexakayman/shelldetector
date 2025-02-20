"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Info, Search, ZoomIn, ZoomOut } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Corporate Incorporation Structure
        </h1>

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
              className="flex items-center gap-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
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
          <CompanyHierarchyFlow />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Data last updated: February 15, 2025
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
