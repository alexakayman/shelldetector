import { NextRequest, NextResponse } from "next/server";
import { LEIRecordData } from "@/types/company";

interface GLEIFResponse {
  meta: {
    goldenCopy?: {
      publishDate: string;
    };
  };
  data: LEIRecordData[];
}

interface ErrorResponse {
  errors: Array<{
    status: string;
    title: string;
    detail?: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { company_lei: string } }
): Promise<NextResponse<LEIRecordData[] | ErrorResponse>> {
  const company_lei = params.company_lei;

  try {
    const response = await fetch(
      `https://api.gleif.org/api/v1/lei-records/${company_lei}/relationships/direct-children`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const statusCode = response.status;

      return NextResponse.json(
        {
          errors: Array.isArray(errorData.errors)
            ? errorData.errors
            : [
                {
                  status: statusCode.toString(),
                  title: "GLEIF API Error",
                  detail: "Failed to fetch child companies",
                },
              ],
        } as ErrorResponse,
        { status: statusCode }
      );
    }

    const responseData: GLEIFResponse = await response.json();
    return NextResponse.json(responseData.data);
  } catch (error) {
    console.error("Error fetching child companies:", error);

    return NextResponse.json(
      {
        errors: [
          {
            status: "500",
            title: "Internal Server Error",
            detail: "Failed to fetch child companies from GLEIF API",
          },
        ],
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
