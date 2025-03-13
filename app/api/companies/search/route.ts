// src/app/api/companies/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenCorporatesCollector } from "@/lib/collectors/opencorporates";
import {
  GLEIFCollector,
  GLEIFFuzzyCompletion,
  GLEIFFuzzyResponse,
} from "@/lib/collectors/gleif";
import { BaseCompanyData, BusinessSearchResult } from "@/lib/collectors/types";

export const dynamic = "force-dynamic";

// Toggle for OpenCorporates backup search
const USE_OPENCORPORATES_BACKUP = false;

interface SearchOptions {
  query: string;
  limit: number;
}

async function gleifSearch(options: SearchOptions) {
  const gleifCollector = new GLEIFCollector();

  const results = await gleifCollector.fuzzySearch(options.query, {
    field: "entity.legalName",
  });

  return results;
}

async function openCorporateSearch(
  query: string,
  options: { jurisdiction?: string; page?: number; limit?: number } = {}
): Promise<BusinessSearchResult[]> {
  const openCorpCollector = new OpenCorporatesCollector();

  try {
    const results = await openCorpCollector.searchCompanies(query, {
      jurisdictionCode: options.jurisdiction || undefined,
      page: options.page || 1,
      perPage: options.limit || 10,
    });

    return results.map((result) => ({
      type: "lei-records",
      id: `oc-${result.metadata?.companyNumber}`,
      attributes: {
        lei: `oc-${result.metadata?.companyNumber}`,
        entity: {
          legalName: {
            name: result.name,
            language: "en",
          },
          otherNames: [],
          transliteratedOtherNames: [],
          legalAddress: {
            language: "en",
            addressLines: [result.registeredAddress],
            addressNumber: null,
            addressNumberWithinBuilding: null,
            mailRouting: null,
            city: "", // OpenCorporates doesn't provide structured address
            region: null,
            country: result.metadata?.jurisdictionCode || "",
            postalCode: "",
          },
          headquartersAddress: {
            language: "en",
            addressLines: [result.registeredAddress],
            addressNumber: null,
            addressNumberWithinBuilding: null,
            mailRouting: null,
            city: "", // OpenCorporates doesn't provide structured address
            region: null,
            country: result.metadata?.jurisdictionCode || "",
            postalCode: "",
          },
          registeredAt: {
            id: "OpenCorporates",
            other: null,
          },
          registeredAs: result.name,
          jurisdiction: result.metadata?.jurisdictionCode || "",
          category: "LEI",
          legalForm: {
            id: "other",
            other: result.metadata?.companyType || "",
          },
          associatedEntity: {
            lei: null,
            name: null,
          },
          status: result.status,
          expiration: {
            date: null,
            reason: null,
          },
          successorEntity: {
            lei: null,
            name: null,
          },
          successorEntities: [],
          creationDate: result.incorporationDate.toISOString(),
          subCategory: null,
          otherAddresses: [],
          eventGroups: [],
        },
        registration: {
          initialRegistrationDate: result.incorporationDate.toISOString(),
          lastUpdateDate: result.lastUpdated.toISOString(),
          status: result.status === "ACTIVE" ? "ISSUED" : "LAPSED",
          nextRenewalDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // Default to 1 year from now
          managingLou: "OpenCorporates",
          corroborationLevel: "PARTIALLY_CORROBORATED",
          validatedAt: {
            id: "OpenCorporates",
            other: null,
          },
          validatedAs: result.name,
          otherValidationAuthorities: [],
        },
        bic: null,
        mic: null,
        ocid: result.metadata?.companyNumber || null,
        spglobal: [],
        conformityFlag: "CONFORMING", // Default to conforming as we don't have this data
      },
      relationships: {
        "managing-lou": { links: {} },
        "lei-issuer": { links: {} },
        "field-modifications": { links: {} },
        "direct-parent": { links: {} },
        "ultimate-parent": { links: {} },
      },
      links: {
        self: result.metadata?.opencorporatesUrl || "",
      },
    }));
  } catch (error) {
    console.error("OpenCorporates search error:", error);
    return [];
  }
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

    // First try GLEIF search
    const gleifResults = await gleifSearch({
      limit,
      query,
    });

    // If GLEIF results are empty and OpenCorporates backup is enabled, try OpenCorporates
    let openCorpResults: BusinessSearchResult[] = [];
    if (gleifResults.length === 0 && USE_OPENCORPORATES_BACKUP) {
      console.log(
        "No GLEIF results found, trying OpenCorporates backup search"
      );
      openCorpResults = await openCorporateSearch(query, {
        jurisdiction: jurisdiction || undefined,
        page,
        limit,
      });
    }

    // Combine results
    const combinedResults = [...gleifResults, ...openCorpResults];

    console.log("Final results count:", combinedResults.length); // Debug log

    return NextResponse.json({
      results: combinedResults,
      metadata: {
        fetchedAt: new Date().toISOString(),
        sources:
          combinedResults.length > 0
            ? gleifResults.length > 0
              ? ["GLEIF"]
              : ["OpenCorporates"]
            : [],
        query: {
          original: query,
          jurisdiction: jurisdiction ?? "all",
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
