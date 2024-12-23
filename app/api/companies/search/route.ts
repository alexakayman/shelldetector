// src/app/api/companies/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenCorporatesCollector } from "@/lib/collectors/opencorporates";
import {
  GLEIFCollector,
  GLEIFFuzzyCompletion,
  GLEIFFuzzyResponse,
} from "@/lib/collectors/gleif";

export const dynamic = "force-dynamic";

interface SearchOptions {
  query: string;
  limit: number;
}

async function gleifSearch(options: SearchOptions) {
  const gleifCollector = new GLEIFCollector();

  const results = await gleifCollector.fuzzySearch(options.query, {
    field: "entity.legalName",
  });

  // return results.map((result) => ({
  //   id: `gleif-${result.lei}`,
  //   name: result.legalName,
  //   lei: result.lei,
  //   source: "GLEIF" as const,
  //   metadata: {
  //     status: "ACTIVE", // Default status as we don't have this in fuzzy search
  //     apiUrl: result.lei,
  //   },
  // }));
  return results;
}

function openCorporateSearch(query: string) {
  //
}

export async function GET(request: NextRequest) {
  try {
    console.log("Starting search request"); // Debug log
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const jurisdiction = searchParams.get("jurisdiction");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    console.log("Search parameters:", { query, jurisdiction, page, limit }); // Debug log

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // const openCorpCollector = new OpenCorporatesCollector(
    //   process.env.OPENCORPORATES_API_KEY
    // );

    // // Fetch OpenCorporates results if GLEIF results are empty
    // let openCorpResults = [];
    // if (gleifResults.length === 0) {
    //   try {
    //     console.log("Fetching OpenCorporates results"); // Debug log
    //     const results = await openCorpCollector.searchCompanies(query, {
    //       jurisdictionCode: jurisdiction || undefined,
    //       page,
    //       perPage: limit,
    //     });

    //     openCorpResults = results.map((result) => ({
    //       id: `oc-${result.metadata?.companyNumber}`,
    //       name: result.name,
    //       matchScore: 1,
    //       jurisdiction: result.metadata?.jurisdictionCode,
    //       source: "OpenCorporates" as const,
    //       metadata: result.metadata,
    //     }));

    //     console.log(
    //       "Processed OpenCorporates results:",
    //       openCorpResults.length
    //     ); // Debug log
    //   } catch (error) {
    //     console.error("OpenCorporates search error:", error);
    //   }
    // }

    // Combine and sort results
    // const combinedResults = [...gleifResults, ...openCorpResults];

    const combinedResults = await gleifSearch({
      limit,
      query,
    });

    console.log("Final results count:", combinedResults.length); // Debug log

    return NextResponse.json({
      results: combinedResults,
      // metadata: {
      //   fetchedAt: new Date().toISOString(),
      //   sources: ["GLEIF"], // TODO: Figure out which sources returned
      //   // sources: combinedResults.length > 0 ? ["GLEIF"] : ["OpenCorporates"],
      //   query: {
      //     original: query,
      //     jurisdiction: jurisdiction ?? "all",
      //   },
      // },
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
