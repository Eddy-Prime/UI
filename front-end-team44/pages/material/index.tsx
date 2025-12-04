import Head from "next/head";
import Header from "@components/header";
import { useState } from "react";

const MaterialPage: React.FC = () => {
  const [goodBatch, setGoodBatch] = useState("GB-2024-001");
  const [failedBatch, setFailedBatch] = useState("FB-2024-023");

  return (
    <>
      <Head>
        <title>Material Tracking</title>
        <meta name="description" content="Material tracking and raw material lot changes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <main className="mx-auto max-w-3xl px-4">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-2xl rounded-2xl p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Material Tracking</h1>

            <section className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Raw Material Lot Tracking</h2>
              <p className="text-sm text-gray-500 mb-6">
                Use the fields below to identify changes between raw material lots. Provide the Good Batch ID and the Failed Batch ID and click
                "Track Changes" to compare lot-level differences.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Good Batch ID</span>
                  <input
                    type="text"
                    value={goodBatch}
                    onChange={(e) => setGoodBatch(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </label>

                <label className="block mt-2">
                  <span className="text-sm font-medium text-gray-700">Failed Batch ID</span>
                  <input
                    type="text"
                    value={failedBatch}
                    onChange={(e) => setFailedBatch(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </label>

                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-black hover:bg-gray-900 text-white px-6 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-black/30"
                    onClick={() => {
                      console.log("Track Changes", { goodBatch, failedBatch });
                      alert(`Tracking changes between ${goodBatch} and ${failedBatch}`);
                    }}
                  >
                    Track Changes
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default MaterialPage;
