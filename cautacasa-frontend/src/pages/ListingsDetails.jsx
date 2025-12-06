// src/pages/ListingsDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { getListingById } from "../api/listings";

export default function ListingsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const res = await getListingById(id);
      setListing(res.data);
    } catch (err) {
      console.error("Error loading listing details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <UserNavbar />
        <p className="text-center text-gray-500 mt-10">Se încarcă...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-100">
        <UserNavbar />
        <div className="max-w-4xl mx-auto mt-10 px-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:underline"
          >
            &larr; Înapoi
          </button>
          <p className="text-center text-gray-600 text-lg">
            Anunțul nu a fost găsit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />

      <div className="max-w-4xl mx-auto mt-6 px-4 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          &larr; Înapoi la listă
        </button>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-80 overflow-hidden">
            <img
              src={listing.image || "/placeholder.jpg"}
              alt={listing.cleanTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">
              {listing.cleanTitle}
            </h1>

            {listing.propertyType && (
              <p className="text-sm text-gray-500 mb-2">
                Tip proprietate: <b>{listing.propertyType}</b>
              </p>
            )}

            {(listing.rooms || listing.surface) && (
              <div className="flex gap-4 text-sm text-gray-700 mb-4">
                {listing.rooms && <span>🛏️ {listing.rooms} camere</span>}
                {listing.surface && <span>📐 {listing.surface} m²</span>}
              </div>
            )}

            <p className="text-blue-600 font-bold text-2xl mb-4">
              {listing.priceEUR
                ? `${listing.priceEUR.toLocaleString()} EUR`
                : listing.priceRON
                ? `${listing.priceRON.toLocaleString()} RON`
                : "Preț necunoscut"}
            </p>

            <p className="text-gray-700 mb-4">
              {listing.summary || "Fără descriere detaliată."}
            </p>

            <p className="text-sm text-gray-500 mb-2">
              {listing.isOwner === true
                ? "Proprietar"
                : listing.isOwner === false
                ? "Agenție"
                : "Tip vânzător necunoscut"}
            </p>

            {listing.link && (
              <a
                href={listing.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Vezi anunțul original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}