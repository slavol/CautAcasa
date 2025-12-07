import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { filterListings } from "../api/listings";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    q: "",
    priceMin: "",
    priceMax: "",
    roomsMin: "",
    roomsMax: "",
    propertyType: "",
    transaction: "",
    isOwner: "",
  });

  useEffect(() => {
    applyFilters(1);
  }, []);

  const getPaginationButtons = () => {
    const buttons = new Set();

    buttons.add(1);

    if (page > 4) buttons.add("leftDots");

    for (let i = page - 2; i <= page + 2; i++) {
      if (i > 1 && i < totalPages) {
        buttons.add(i);
      }
    }

    if (page < totalPages - 3) buttons.add("rightDots");

    if (totalPages > 1) buttons.add(totalPages);

    return Array.from(buttons);
  };

  const applyFilters = async (newPage = 1) => {
    try {
      setLoading(true);

      const payload = {
        page: newPage,
        limit: 9,
      };

      if (filters.q) payload.q = filters.q;
      if (filters.priceMin) payload.priceMin = Number(filters.priceMin);
      if (filters.priceMax) payload.priceMax = Number(filters.priceMax);
      if (filters.roomsMin) payload.roomsMin = Number(filters.roomsMin);
      if (filters.roomsMax) payload.roomsMax = Number(filters.roomsMax);
      if (filters.propertyType) payload.propertyType = filters.propertyType;
      if (filters.transaction) payload.transaction = filters.transaction;
      if (filters.isOwner !== "") payload.isOwner = filters.isOwner;

      const res = await filterListings(payload);

      setListings(res.data.listings || []);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("FILTER ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      priceMin: "",
      priceMax: "",
      roomsMin: "",
      roomsMax: "",
      propertyType: "",
      transaction: "",
      isOwner: "",
    });
    applyFilters(1);
  };

  const FiltersUI = () => (
    <div className="bg-white p-6 shadow rounded-xl mb-6">
      <h3 className="text-xl font-bold mb-4">Filtre</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="text-sm font-medium">Căutare</label>
          <input
            type="text"
            value={filters.q}
            placeholder="Titlu..."
            className="w-full p-2 border rounded-lg"
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Preț minim</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg"
            value={filters.priceMin}
            onChange={(e) =>
              setFilters({ ...filters, priceMin: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Preț maxim</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg"
            value={filters.priceMax}
            onChange={(e) =>
              setFilters({ ...filters, priceMax: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Camere minime</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg"
            value={filters.roomsMin}
            onChange={(e) =>
              setFilters({ ...filters, roomsMin: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Camere maxime</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg"
            value={filters.roomsMax}
            onChange={(e) =>
              setFilters({ ...filters, roomsMax: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tip proprietate</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.propertyType}
            onChange={(e) =>
              setFilters({ ...filters, propertyType: e.target.value })
            }
          >
            <option value="">Oricare</option>
            <option value="apartament">Apartament</option>
            <option value="garsoniera">Garsonieră</option>
            <option value="casa">Casă</option>
            <option value="vila">Vilă</option>
            <option value="teren">Teren</option>
            <option value="spatiu">Spațiu</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Tranzacție</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.transaction}
            onChange={(e) =>
              setFilters({ ...filters, transaction: e.target.value })
            }
          >
            <option value="">Oricare</option>
            <option value="RENT">Închiriere</option>
            <option value="SALE">Vânzare</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Vânzător</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={filters.isOwner}
            onChange={(e) =>
              setFilters({ ...filters, isOwner: e.target.value })
            }
          >
            <option value="">Oricare</option>
            <option value="true">Proprietar</option>
            <option value="false">Agenție</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => applyFilters(1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Aplică filtrele
        </button>

        <button
          onClick={resetFilters}
          className="bg-gray-300 px-4 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />

      <div className="max-w-7xl mx-auto mt-6 px-4 pb-10">
        {FiltersUI()}

        {loading ? (
          <p className="text-center text-gray-500 mt-10">Se încarcă...</p>
        ) : listings.length === 0 ? (
          <p className="text-center text-gray-600 mt-10 text-lg">
            Nu s-a găsit niciun anunț.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <div
                  key={l.id}
                  onClick={() => navigate(`/listings/${l.id}`)}
                  className="bg-white rounded-xl shadow hover:shadow-xl transition cursor-pointer overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={l.image || l.Listing?.image || "/placeholder.jpg"}
                      alt={l.cleanTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {l.cleanTitle}
                    </h3>

                    <p className="text-blue-600 font-bold text-xl mt-2">
                      {l.priceEUR
                        ? `${l.priceEUR.toLocaleString()} EUR`
                        : "Preț necunoscut"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-10 justify-center items-center flex-wrap">

              <button
                disabled={page === 1}
                onClick={() => page > 1 && applyFilters(page - 1)}
                className={`px-4 py-2 rounded-lg border transition ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Previous
              </button>

              {getPaginationButtons().map((p, index) => {
                if (p === "leftDots" || p === "rightDots") {
                  return (
                    <span key={index} className="px-3 py-1 text-gray-500">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => applyFilters(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      p === page
                        ? "bg-blue-600 text-white shadow scale-105"
                        : "bg-white border text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => page < totalPages && applyFilters(page + 1)}
                className={`px-4 py-2 rounded-lg border transition ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Next
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}