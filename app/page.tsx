"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BusinessCard } from "./components/BusinessCard";
import type { BusinessEntity, RelatedEntity } from "./types/business";
import { mockSearch } from "./mock/data";
import { BusinessSearchResult } from "@/lib/collectors/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  interface SearchResult {
    id: string;
    name: string;
    matchScore: number;
    jurisdiction?: string;
    lei?: string;
    source: "GLEIF" | "OpenCorporates";
    metadata?: Record<string, any>;
  }

  interface BusinessEntity {
    id: string;
    name: string;
    registrationDate: string;
    status: "Active" | "Inactive" | "Suspended";
    riskScore: number;
    riskFactors: string[];
    lastFilingDate: string;
    address: string;
    relatedEntities?: RelatedEntity[];
  }

  interface SearchResponse {
    results: SearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
    metadata: {
      fetchedAt: string;
      sources: string[];
      query: {
        original: string;
        jurisdiction: string;
      };
    };
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // fetch function
    try {
      const response = await fetch(
        `/api/companies/search?${new URLSearchParams({
          q: query,
          page: "1",
          limit: "10",
        })}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();

      setResults(data.results);
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map various status strings to your union type
  const mapStatus = (status?: string): BusinessEntity["status"] => {
    if (!status) return "Inactive";

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes("active")) return "Active";
    if (normalizedStatus.includes("suspend")) return "Suspended";
    return "Inactive";
  };

  return (
    <main className="min-h-screen bg-[url('img/bg.jpg')] bg-cover bg-top">
      <div className="max-w-4xl mx-auto p-12">
        <div className="text-center mb-8 py-12">
          <h1 className="text-7xl mb-2">Find shells faster</h1>
          <p className="text-2xl text-muted-foreground">
            Shell company pattern detection for lightweight KYOB.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 font-sans">
          <Input
            type="text"
            placeholder="Enter business name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {results.map((business) => (
            <BusinessCard key={business.attributes.lei} business={business} />
          ))}
        </div>

        {results.length === 0 && query && !loading && (
          <div className="text-center text-muted-foreground">
            No results found for "{query}". Please make sure to include .Inc or
            incorporation form. Searching Apple will return no results, while
            Apple Inc will.
          </div>
        )}
      </div>
    </main>
  );
}
