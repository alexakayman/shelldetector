import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";

export default function CompanyInfo({
  params,
}: {
  params: { company_lei: string };
}) {
  const lei = params.company_lei;

  try {
    const response = fetch(`/api/companies/?${lei}`);
    console.log(response);
  } catch (error) {}

  //   TODO: call api again for full company details?

  return (
    <main className="min-h-screen bg-[url('img/bg.jpg')] bg-cover bg-top">
      <div className="max-w-7xl mx-auto space-y-6 p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Tesla Motors, Inc.</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#ffffff] rounded-lg pr-2 overflow-clip border border-[#EEECE7]">
              <span className="px-2 py-1 text-sm bg-[#EEECE7]">LEI</span>
              <span className="text-sm text-[#797773]">
                SDFH2388FFALGI88111
              </span>
              <Copy className="w-4 h-4 text-[#797773]" />
            </div>

            <Badge className="bg-[#0c9b76] text-white">VALID</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Core Data */}
          <Card className=" bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Core Data
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <DataRow label="Legal Name" value="Tesla Motors, Inc." />
              <DataRow label="Entity Type" value="DE Corporation" />
              <DataRow
                label="Legal Address"
                value={
                  <div>
                    C/O Incorporation Co
                    <br />
                    Suite 402
                    <br />
                    Wilmington, DE
                  </div>
                }
              />
              <DataRow label="Incorporation Date" value="12-04-2005" />
              <DataRow label="Last Filing Date" value="04-15-2024" />
              <DataRow label="Expiration Date" value="04-15-2028" />
              <DataRow label="GLEIF Conforming" value="YES" />
            </div>
          </Card>

          {/* Related Entities */}
          <Card className=" bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Related Entities: Network Data
              </h2>
            </div>

            <div className="p-6 relative mt-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <EntityCard
                  name="Hackett UK Ltd"
                  location="London, GB"
                  status="Active | Conforming"
                />
                <EntityCard
                  name="Hawker Inc"
                  location="Neuilly-Sur-Seine, FR"
                  status="Active | Conforming"
                />
                <EntityCard
                  name="Hawker R7 Limited"
                  location="Neuilly-Sur-Seine, FR"
                  status="Active | Conforming"
                />
              </div>
              <div className="flex justify-center my-4">
                <EntityCard
                  name="Globe Group, Inc"
                  location="London, GB"
                  status="Active | Nonconforming"
                />
              </div>
              <div className="flex justify-center mt-4">
                <EntityCard
                  name="Losca Limited"
                  location="London, GB"
                  status="Active | Conforming"
                />
              </div>
              {/* Connection lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ top: "20%" }}
              >
                <line
                  x1="20%"
                  y1="20%"
                  x2="50%"
                  y2="45%"
                  stroke="#8caaa9"
                  strokeWidth="1"
                />
                <line
                  x1="50%"
                  y1="20%"
                  x2="50%"
                  y2="45%"
                  stroke="#8caaa9"
                  strokeWidth="1"
                />
                <line
                  x1="80%"
                  y1="20%"
                  x2="50%"
                  y2="45%"
                  stroke="#8caaa9"
                  strokeWidth="1"
                />
                <line
                  x1="50%"
                  y1="65%"
                  x2="50%"
                  y2="85%"
                  stroke="#8caaa9"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </Card>

          {/* Board Data */}
          <Card className=" bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Board Data
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <DataRow label="Name" value="Elon Musk" />
              <DataRow label="Title" value="Chairman" />
              <DataRow label="Name" value="Tesla Motors, Inc." />
              <DataRow label="Title" value="DE Corporation" />
            </div>
          </Card>

          {/* Filing History */}
          <Card className=" bg-[#ffffff]">
            <div className="px-4 py-2 bg-[#EEECE7]">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8M1 3H23V8H1V3Z" />
                </svg>
                Filing History
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <DataRow label="Name" value="Tesla Motors, Inc." />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <span className="text-[#797773]">{label}</span>
      <span className="text-[#8caaa9]">{value}</span>
    </div>
  );
}

function EntityCard({
  name,
  location,
  status,
}: {
  name: string;
  location: string;
  status: string;
}) {
  return (
    <div className="border border-[#8caaa9] rounded p-3 text-center bg-white">
      <h3 className="font-medium mb-1">{name}</h3>
      <p className="text-sm text-[#797773]">{status}</p>
      <p className="text-sm text-[#797773]">{location}</p>
    </div>
  );
}
