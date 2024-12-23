export async function GET() {
  return Response.json("PIss off");
}

// // src/app/api/companies/[jurisdiction]/[id]/route.ts
// import { NextRequest } from "next/server";
// import { GLEIFCollector } from "@/lib/collectors/gleif";
// // import { EDGARCollector } from "@/lib/collectors/edgar";
// import { OpenCorporatesCollector } from "@/lib/collectors/opencorporates";
// // import { ShellCompanyDetector } from "@/lib/risk-analysis/detector";

// // Type for our enriched company response
// interface EnrichedCompanyResponse {
//   basicInfo: {
//     name: string;
//     registeredAddress: string;
//     incorporationDate: string;
//     status: string;
//   };
//   identifiers: {
//     lei?: string;
//     cik?: string;
//     companyNumber?: string;
//     jurisdictionCode?: string;
//   };
//   sources: {
//     opencorporates?: {
//       url: string;x
//       officers: Array<{
//         name: string;
//         position: string;
//         startDate?: string;
//         endDate?: string;
//       }>;
//       filings: Array<{
//         title: string;
//         date: string;
//         description?: string;
//       }>;
//     };
//     gleif?: {
//       relationships: {
//         directParent?: string;
//         ultimateParent?: string;
//       };
//     };
//     edgar?: {
//       filings: Array<{
//         form: string;
//         filingDate: string;
//         description: string;
//       }>;
//     };
//   };
//   riskAnalysis?: {
//     score: number;
//     isShell: boolean;
//     flagsTriggered: string[];
//   };
//   metadata: {
//     fetchedAt: string;
//     dataSources: string[];
//   };
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { jurisdiction: string; id: string } }
// ) {
//   try {
//     // Initialize collectors
//     const openCorpCollector = new OpenCorporatesCollector(
//       process.env.OPENCORPORATES_API_KEY
//     );
//     const gleifCollector = new GLEIFCollector();
//     // const edgarCollector = new EDGARCollector(process.env.SEC_USER_AGENT);
//     // const shellDetector = new ShellCompanyDetector();

//     const { jurisdiction, id } = params;
//     let response: Partial<EnrichedCompanyResponse> = {
//       metadata: {
//         fetchedAt: new Date().toISOString(),
//         dataSources: [],
//       },
//     };

//     // Fetch data from OpenCorporates
//     try {
//       const companyData = await openCorpCollector.getCompanyByJurisdiction(
//         jurisdiction,
//         id
//       );
//       const [officers, filings] = await Promise.all([
//         openCorpCollector.getOfficers(jurisdiction, id),
//         openCorpCollector.getFilings(jurisdiction, id),
//       ]);

//       response.basicInfo = {
//         name: companyData.name,
//         registeredAddress: companyData.registeredAddress,
//         incorporationDate: companyData.incorporationDate.toISOString(),
//         status: companyData.status,
//       };

//       response.identifiers = {
//         companyNumber: id,
//         jurisdictionCode: jurisdiction,
//       };

//       response.sources = {
//         opencorporates: {
//           url: `https://opencorporates.com/companies/${jurisdiction}/${id}`,
//           officers,
//           filings,
//         },
//       };

//       response.metadata!.dataSources.push("OpenCorporates");
//     } catch (error) {
//       console.error("OpenCorporates fetch error:", error);
//     }

//     // Try to fetch GLEIF data if we have a matching LEI
//     try {
//       const searchResults = await gleifCollector.searchCompanies(
//         response.basicInfo?.name || "",
//         { page: 1, limit: 1 }
//       );

//       if (searchResults.length > 0) {
//         const lei = searchResults[0].lei;
//         if (lei) {
//           const gleifData = await gleifCollector.getCompanyByLEI(lei);
//           const relatedCompanies = await gleifCollector.getRelatedCompanies(
//             lei
//           );

//           response.identifiers = {
//             ...response.identifiers,
//             lei,
//           };

//           response.sources = {
//             ...response.sources,
//             gleif: {
//               relationships: {
//                 directParent: Array.from(relatedCompanies.values())[0]?.name,
//                 ultimateParent: Array.from(relatedCompanies.values()).slice(
//                   -1
//                 )[0]?.name,
//               },
//             },
//           };

//           response.metadata!.dataSources.push("GLEIF");
//         }
//       }
//     } catch (error) {
//       console.error("GLEIF fetch error:", error);
//     }

//     // Try to fetch EDGAR data for US companies
//     if (jurisdiction.toLowerCase() === "us") {
//       try {
//         const edgarData = await edgarCollector.getCompanyInfo(id);
//         const recentFilings = await edgarCollector.getRecentFilings(id);

//         response.identifiers = {
//           ...response.identifiers,
//           cik: id,
//         };

//         response.sources = {
//           ...response.sources,
//           edgar: {
//             filings: recentFilings.map((filing) => ({
//               form: filing.form,
//               filingDate: filing.filingDate,
//               description: filing.primaryDocument,
//             })),
//           },
//         };

//         response.metadata!.dataSources.push("EDGAR");
//       } catch (error) {
//         console.error("EDGAR fetch error:", error);
//       }
//     }

//     // Perform risk analysis if we have enough data
//     if (response.basicInfo) {
//       try {
//         const riskAnalysis = await shellDetector.analyzeCompany(
//           {
//             name: response.basicInfo.name,
//             registeredAddress: response.basicInfo.registeredAddress,
//             incorporationDate: new Date(response.basicInfo.incorporationDate),
//             status: response.basicInfo.status as any,
//             lastUpdated: new Date(),
//           },
//           {
//             relatedCompanies: new Map(), // Add related companies if available
//             filingHistory: response.sources?.edgar?.filings || [],
//           }
//         );

//         response.riskAnalysis = {
//           score: riskAnalysis.riskScore,
//           isShell: riskAnalysis.isShell,
//           flagsTriggered: riskAnalysis.flagsTriggered,
//         };
//       } catch (error) {
//         console.error("Risk analysis error:", error);
//       }
//     }

//     if (response.metadata!.dataSources.length === 0) {
//       return Response.json(
//         { error: "No data found from any source" },
//         { status: 404 }
//       );
//     }

//     return Response.json(response);
//   } catch (error) {
//     console.error("API route error:", error);

//     if (error instanceof Error) {
//       return Response.json({ error: error.message }, { status: 500 });
//     }

//     return Response.json(
//       { error: "An unexpected error occurred" },
//       { status: 500 }
//     );
//   }
// }
