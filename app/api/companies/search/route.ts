// src/app/api/companies/search/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const jurisdiction = searchParams.get("jurisdiction");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query) {
      return Response.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const openCorpCollector = new OpenCorporatesCollector(
      process.env.OPENCORPORATES_API_KEY
    );

    const searchResults = await openCorpCollector.searchCompanies(query, {
      jurisdictionCode: jurisdiction || undefined,
      page,
      perPage: limit,
    });

    return Response.json({
      results: searchResults,
      pagination: {
        page,
        limit,
        total: searchResults.length,
        hasMore: searchResults.length === limit,
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        source: "OpenCorporates",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
