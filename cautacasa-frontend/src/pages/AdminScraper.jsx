import { useEffect, useState } from "react";
import AdminNavbar from "../components_admin/AdminNavbar";
import { startScraper, getScraperStatus } from "../api/admin";

export default function AdminScraper() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getScraperStatus();
        setStatus(res.data);
      } catch (err) {
        console.error("STATUS ERROR:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startScraper();
      alert("Scraper-ul a pornit!");
    } catch (err) {
      console.error("START ERROR:", err);
      alert("Eroare la pornirea scraper-ului");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Scraper OLX & Procesare AI</h1>
        <p className="text-gray-600 mb-6">
          Aici poți porni pipeline-ul complet: Scraper OLX → AI Processor → Inserare DB.
        </p>

        <button
          onClick={handleStart}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Se pornește..." : "Pornire Scraper"}
        </button>

        <div className="mt-6 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">Status pipeline</h2>

          {!status || !status.running ? (
            <p className="text-gray-500">Scraper-ul nu rulează în acest moment.</p>
          ) : (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Stadiu:</span>{" "}
                <span className="text-blue-600">{status.stage}</span>
              </p>

              <p>
                <span className="font-semibold">Mesaj:</span>{" "}
                {status.message}
              </p>

              <p className="text-sm text-gray-500">
                Ultima actualizare: {new Date(status.timestamp * 1000).toLocaleString()}
              </p>

              <div className="w-full bg-gray-200 h-3 rounded-full mt-4">
                <div
                  className={`h-3 rounded-full transition-all ${
                    status.stage === "scraper"
                      ? "bg-blue-600 w-1/3"
                      : status.stage === "ai"
                      ? "bg-purple-600 w-2/3"
                      : status.stage === "done"
                      ? "bg-green-600 w-full"
                      : "w-0"
                  }`}
                />
              </div>

              {status.stage === "done" && (
                <p className="mt-4 text-green-600 font-semibold text-lg">
                  🎉 Pipeline completat cu succes!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}