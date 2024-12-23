// src/app/api/companies/route.ts
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return Response.json("al");
  // try {
  //   const { searchParams } = new URL(request.url);
  //   const query = searchParams.get("q");
  //   const page = parseInt(searchParams.get("page") || "1", 10);
  //   const limit = parseInt(searchParams.get("limit") || "10", 10);
  //   if (!query) {
  //     return Response.json(
  //       { error: "Search query is required" },
  //       { status: 400 }
  //     );
  //   }
  //   const gleifCollector = new GLEIFCollector(process.env.GLEIF_API_KEY);
  //   // Implement search functionality
  //   // This would depend on how you want to search (by name, by LEI, etc.)
  //   const results = await gleifCollector.searchCompanies(query, {
  //     page,
  //     limit,
  //   });
  //   return Response.json({
  //     results,
  //     pagination: {
  //       page,
  //       limit,
  //       total: results.length, // This should be the total count from the API
  //       hasMore: results.length === limit,
  //     },
  //   });
  // } catch (error) {
  //   console.error("Error searching companies:", error);
  //   if (error instanceof Error) {
  //     return Response.json({ error: error.message }, { status: 500 });
  //   }
  //   return Response.json(
  //     { error: "An unexpected error occurred" },
  //     { status: 500 }
  //   );
  // }
}
