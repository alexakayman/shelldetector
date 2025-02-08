import { BusinessEntity, GleifObject } from "../types/business";

export const mockSearch = async (query: string): Promise<GleifObject[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!query) return [];

  return [
    {
      type: "fuzzycompletions",
      attributes: {
        value: "HAWKER",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "969500AC418Z4V6ZOT06",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/969500AC418Z4V6ZOT06",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "Hakera OÜ",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "254900S3YB2JTHBKAQ62",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/254900S3YB2JTHBKAQ62",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "Hankera Oy",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "743700CNBP207BYEKR92",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/743700CNBP207BYEKR92",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "Hackel GmbH",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "8945002FGC8AMOYJ5F47",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/8945002FGC8AMOYJ5F47",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "HACER INVEST",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "969500GTLWNGRJ4AWM31",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/969500GTLWNGRJ4AWM31",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "HACER S.R.L.",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "815600FFBB58D01A4031",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/815600FFBB58D01A4031",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "Hackwerk B.V.",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "724500GF14ND4KIPTN20",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/724500GF14ND4KIPTN20",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "HACKENBUSH LTD",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "213800YDK17OZH918270",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/213800YDK17OZH918270",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "Hackett UK Ltd",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "254900YB8JFK6V78G690",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/254900YB8JFK6V78G690",
          },
        },
      },
    },
    {
      type: "fuzzycompletions",
      attributes: {
        value: "HAWKER RC7 LLC",
      },
      relationships: {
        "lei-records": {
          data: {
            type: "lei-records",
            id: "549300I10EOLXXROXJ13",
          },
          links: {
            related:
              "https://api.gleif.org/api/v1/lei-records/549300I10EOLXXROXJ13",
          },
        },
      },
    },
  ];
};
