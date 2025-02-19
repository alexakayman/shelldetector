import { NextApiRequest, NextApiResponse } from "next";

interface LEIRecordData {
  type: string;
  id: string;
  attributes: {
    lei: string;
    entity: {
      legalName: {
        name: string;
        language: string;
      };
      otherNames?: Array<{
        name: string;
        language: string;
        type: string;
      }>;
      transliteratedOtherNames?: Array<any>;
      legalAddress: {
        language: string;
        addressLines: string[];
        addressNumber: string | null;
        addressNumberWithinBuilding: string | null;
        mailRouting: string | null;
        city: string;
        region: string | null;
        country: string;
        postalCode: string;
      };
      headquartersAddress: {
        language: string;
        addressLines: string[];
        addressNumber: string | null;
        addressNumberWithinBuilding: string | null;
        mailRouting: string | null;
        city: string;
        region: string | null;
        country: string;
        postalCode: string;
      };
      registeredAt: {
        id: string;
        other: string | null;
      };
      registeredAs: string;
      jurisdiction: string;
      category: string | null;
      legalForm: {
        id: string;
        other: string | null;
      };
      associatedEntity: {
        lei: string | null;
        name: string | null;
      } | null;
      status: string;
      expiration: {
        date: string | null;
        reason: string | null;
      } | null;
      successorEntity: {
        lei: string | null;
        name: string | null;
      } | null;
      successorEntities?: Array<any>;
      creationDate?: string;
      subCategory?: string | null;
      otherAddresses?: Array<{
        fieldType: string;
        language: string;
        type: string;
        addressLines: string[];
        addressNumber: string | null;
        city: string;
        region: string | null;
        country: string;
        postalCode: string;
      }>;
      eventGroups?: Array<any>;
    };
    registration: {
      initialRegistrationDate: string;
      lastUpdateDate: string;
      status: string;
      nextRenewalDate: string;
      managingLou: string;
      corroborationLevel: string;
      validatedAt: {
        id: string;
        other: string | null;
      };
      validatedAs: string;
      otherValidationAuthorities?: Array<any>;
    };
    bic: string[] | null;
    mic?: string | null;
    ocid?: string | null;
    spglobal?: string[];
    conformityFlag?: string;
  };
  relationships: {
    "managing-lou"?: {
      links: {
        related: string;
      };
    };
    "lei-issuer"?: {
      links: {
        related: string;
      };
    };
    "field-modifications"?: {
      links: {
        related: string;
      };
    };
    "direct-parent"?: {
      links: {
        "reporting-exception": string;
      };
    };
    "ultimate-parent"?: {
      links: {
        "reporting-exception": string;
      };
    };
    "direct-children"?: {
      links: {
        "relationship-records": string;
        related: string;
      };
    };
    "ultimate-children"?: {
      links: {
        "relationship-records": string;
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

interface GLEIFResponse {
  meta: {
    goldenCopy?: {
      publishDate: string;
    };
  };
  data: LEIRecordData;
}

interface ErrorResponse {
  errors: Array<{
    status: string;
    title: string;
    detail?: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LEIRecordData | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      errors: [
        {
          status: "405",
          title: "Method Not Allowed",
          detail: "Only GET requests are allowed for this endpoint",
        },
      ],
    });
  }

  const { company_lei } = req.query;

  if (
    !company_lei ||
    typeof company_lei !== "string" ||
    !isValidLEI(company_lei)
  ) {
    return res.status(400).json({
      errors: [
        {
          status: "400",
          title: "Bad Request",
          detail: "A valid LEI must be provided",
        },
      ],
    });
  }

  try {
    const response = await fetch(
      `https://api.gleif.org/api/v1/lei-records/${company_lei}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const statusCode = response.status;

      return res.status(statusCode).json({
        errors: Array.isArray(errorData.errors)
          ? errorData.errors
          : [
              {
                status: statusCode.toString(),
                title: "GLEIF API Error",
                detail: "Failed to fetch company data",
              },
            ],
      });
    }

    const responseData: GLEIFResponse = await response.json();

    // Only return the data part of the response
    return res.status(200).json(responseData.data);
  } catch (error) {
    console.error("Error fetching company data:", error);

    return res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "Failed to fetch company data from GLEIF API",
        },
      ],
    });
  }
}

// Validate LEI format: 20 characters alphanumeric
function isValidLEI(lei: string): boolean {
  const leiRegex = /^[0-9A-Z]{20}$/;
  return leiRegex.test(lei);
}
