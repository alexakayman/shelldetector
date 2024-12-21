// src/app/api/companies/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenCorporatesCollector } from "@/lib/collectors/opencorporates";
import { GLEIFCollector } from "@/lib/collectors/gleif";

export const dynamic = "force-dynamic"; // This ensures the route is always dynamic

export async function GET(request: NextRequest) {
  try {
    // Use the native URL object with the request url
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const jurisdiction = searchParams.get("jurisdiction");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const openCorpCollector = new OpenCorporatesCollector(
      process.env.OPENCORPORATES_API_KEY
    );
    const gleifCollector = new GLEIFCollector(process.env.GLEIF_API_KEY);

    // Fetch results from both sources concurrently
    const [openCorpResults, gleifResults] = await Promise.all([
      openCorpCollector
        .searchCompanies(query, {
          jurisdictionCode: jurisdiction || undefined,
          page,
          perPage: limit,
        })
        .catch((error) => {
          console.error("OpenCorporates search error:", error);
          return [];
        }),
      gleifCollector
        .fuzzySearch(query, {
          page,
          pageSize: limit,
        })
        .catch((error) => {
          console.error("GLEIF search error:", error);
          return [];
        }),
    ]);

    // Transform and combine results
    const combinedResults = [
      // Transform OpenCorporates results
      ...openCorpResults.map((result) => ({
        id: `oc-${result.metadata?.companyNumber}`,
        name: result.name,
        matchScore: 1,
        jurisdiction: result.metadata?.jurisdictionCode,
        source: "OpenCorporates" as const,
        metadata: result.metadata,
      })),
      // Transform GLEIF results
      ...gleifResults.map((result) => ({
        id: `gleif-${result.lei}`,
        name: result.legalName,
        matchScore: result.matchScore,
        lei: result.lei,
        source: "GLEIF" as const,
        metadata: {
          status: result.status,
          legalAddress: result.legalAddress,
          registrationAuthority: result.registrationAuthority,
        },
      })),
    ];

    // Sort combined results by match score
    const sortedResults = combinedResults.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    // Apply pagination to combined results
    const paginatedResults = sortedResults.slice(0, limit);

    return NextResponse.json({
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total: sortedResults.length,
        hasMore: sortedResults.length > limit,
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        sources: ["OpenCorporates", "GLEIF"],
        query: {
          original: query,
          jurisdiction: jurisdiction || "all",
        },
      },
    });
  } catch (error) {
    console.error("Search API error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
