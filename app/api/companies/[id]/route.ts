// src/app/api/companies/[id]/route.ts
import { NextRequest } from "next/server";
import { GLEIFCollector } from "@/lib/collectors/gleif";
import { EDGARCollector } from "@/lib/collectors/edgar";
import { ShellCompanyDetector } from "@/lib/risk-analysis/detector";

// Environment variables should be properly typed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GLEIF_API_KEY: string;
      SEC_USER_AGENT: string;
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize collectors
    const gleifCollector = new GLEIFCollector(process.env.GLEIF_API_KEY);
    const edgarCollector = new EDGARCollector(process.env.SEC_USER_AGENT);
    const shellDetector = new ShellCompanyDetector();

    // Get company identifiers from params
    const { id } = params;

    // Fetch data from both sources concurrently
    const [companyData, relatedCompanies, filingHistory] = await Promise.all([
      gleifCollector.getCompanyByLEI(id),
      gleifCollector.getRelatedCompanies(id),
      edgarCollector.getCompanyFilings(id),
    ]);

    // Perform risk analysis
    const riskAnalysis = await shellDetector.analyzeCompany(companyData, {
      relatedCompanies,
      filingHistory,
    });

    // Combine all data
    const response = {
      company: companyData,
      relationships: {
        relatedCompanies: Array.from(relatedCompanies.values()),
        totalRelated: relatedCompanies.size,
      },
      filings: {
        recent: filingHistory.filings.recent,
        totalFilings: filingHistory.filings.recent.accessionNumber.length,
      },
      riskAnalysis: {
        score: riskAnalysis.riskScore,
        isShell: riskAnalysis.isShell,
        flagsTriggered: riskAnalysis.flagsTriggered,
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        sources: ["GLEIF", "SEC EDGAR"],
      },
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching company data:", error);

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
