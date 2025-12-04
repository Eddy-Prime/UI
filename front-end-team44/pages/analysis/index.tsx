import Head from "next/head";
import Header from "@components/header";
import { useState } from "react";
import RoundedSelect from "@components/RoundedSelect";

const AnalysisPage: React.FC = () => {
  const [productionStep, setProductionStep] = useState<string>("");

  return (
    <>
      <Head>
        <title>Alarm Analysis</title>
        <meta name="description" content="Alarm event analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <main className="mx-auto max-w-3xl px-4">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-2xl rounded-2xl p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Alarm Event Analysis</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Select a production step and ask a question about the alarms that occurred
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="production-step" className="block text-sm font-medium text-black-700 mb-2">
                  Production Step
                </label>
                <RoundedSelect
                  options={[
                    { value: "polymerization", label: "Polymerization" },
                    { value: "mixing", label: "Mixing" },
                    { value: "drying", label: "Drying" },
                    { value: "packaging", label: "Packaging" },
                    { value: "quality-control", label: "Quality Control" },
                  ]}
                  value={productionStep}
                  onChange={(v) => setProductionStep(v)}
                  placeholder="Select a step..."
                  ariaLabel="Production Step"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AnalysisPage;
