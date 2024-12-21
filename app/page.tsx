"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BusinessCard } from "./components/BusinessCard";
import type { BusinessEntity } from "./types/business";
import { mockSearch } from "./mock/data";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const searchResults = await mockSearch(query);
    setResults(searchResults);
    setLoading(false);
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
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {results.length === 0 && query && !loading && (
          <div className="text-center text-muted-foreground">
            No results found for "{query}"
          </div>
        )}
      </div>
    </main>
  );
}
