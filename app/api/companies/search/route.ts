// src/app/api/companies/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenCorporatesCollector } from "@/lib/collectors/opencorporates";
import { GLEIFCollector } from "@/lib/collectors/gleif";
import { GLEIFEntity, OpenCorporatesCompany } from "@/lib/collectors/types";

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

    const gleifCollector = new GLEIFCollector();

    // Attempt to fetch results from GLEIF first
    let gleifResults: GLEIFEntity[] = [];
    try {
      const results = await gleifCollector.fuzzySearch(query, {
        page,
        pageSize: limit,
      });
      gleifResults = results.map((result) => ({
        lei: result.lei,
        entity: {
          legalName: [{ name: result.legalName, language: "en" }],
          legalAddress: {
            addressLines: [result.legalAddress],
            city: "",
            country: "",
            postalCode: "",
          },
          status: result.status,
        },
        registration: {
          initialRegistrationDate: "",
          lastUpdateDate: "",
          status: result.status,
        },
      }));
    } catch (error) {
      console.error("GLEIF search error:", error);
    }

    // If GLEIF fails, fallback to OpenCorporates
    let openCorpResults: BaseCompanyData[] = [];
    if (gleifResults.length === 0) {
      try {
        openCorpResults = await openCorpCollector.searchCompanies(query, {
          jurisdictionCode: jurisdiction || undefined,
          page,
          perPage: limit,
        });
      } catch (error) {
        console.error("OpenCorporates search error:", error);
      }
    }

    // Transform and combine results
    const combinedResults = [
      // Transform GLEIF results
      ...gleifResults.map((result) => ({
        id: `gleif-${result.lei}`,
        name: result.entity.legalName[0].name,
        matchScore: 1, // Assuming a default match score
        lei: result.lei,
        source: "GLEIF" as const,
        metadata: {
          status: result.entity.status,
          legalAddress: result.entity.legalAddress.addressLines.join(", "),
          registrationAuthority: "", // Assuming no registration authority in the current context
        },
      })),
      // Transform OpenCorporates results
      ...openCorpResults.map((result) => ({
        id: `oc-${result.metadata?.companyNumber}`,
        name: result.name,
        matchScore: 1,
        jurisdiction: result.metadata?.jurisdictionCode,
        source: "OpenCorporates" as const,
        metadata: result.metadata,
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
        sources: gleifResults.length > 0 ? ["GLEIF"] : ["OpenCorporates"],
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
