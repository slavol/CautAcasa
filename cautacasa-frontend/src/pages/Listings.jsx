import { useEffect, useState } from "react";
import axios from "axios";
import UserNavbar from "../components_user/NavbarUser";
import { FiFilter } from "react-icons/fi";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    q: "",
    propertyType: "",
    transaction: "",
    roomsMin: "",
    roomsMax: "",
    priceMin: "",
    priceMax: "",
    zone: "",
    isOwner: undefined,
  });
  const [currency, setCurrency] = useState("RON");

  // ============================
  // Load all listings at start
  // ============================
  useEffect(() => {
    loadAllListings();
  }, []);

  const loadAllListings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5050/api/listings/all");
      setListings(res.data);
      setTotalPages(1);
      setPage(1);
    } catch (err) {
      console.error("Error loading listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Apply filters (POST /filter)
  // ============================
  const applyFilters = async (newPage = 1) => {
    setLoading(true);
    setPage(newPage);

    try {
      const adjustedFilters = { ...filters };

      // normalize empty values
      if (!filters.priceMin) delete adjustedFilters.priceMin;
      else adjustedFilters.priceMin = Number(filters.priceMin);

      if (!filters.priceMax) delete adjustedFilters.priceMax;
      else adjustedFilters.priceMax = Number(filters.priceMax);

      // convert EUR → RON only for backend filtering
      if (currency === "EUR") {
        if (adjustedFilters.priceMin !== undefined) {
          adjustedFilters.priceMin = Number(adjustedFilters.priceMin) * 5;
        }
        if (adjustedFilters.priceMax !== undefined) {
          adjustedFilters.priceMax = Number(adjustedFilters.priceMax) * 5;
        }
      }

      const res = await axios.post("http://localhost:5050/api/listings/filter", {
        ...adjustedFilters,
        page: newPage,
        limit: 20,
      });

      setListings(res.data.listings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("FILTER ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage) => applyFilters(newPage);

  // ============================
  // FILTER COMPONENT (used mobile + desktop)
  // ============================
  const FiltersUI = () => (
    <div>
      {/* SEARCH */}
      <input
        type="text"
        value={filters.q}
        placeholder="Căutare titlu..."
        className="w-full p-2 border rounded-lg mb-4"
        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
      />

      {/* PROPERTY TYPE */}
      <label className="font-medium">Tip locuință</label>
      <select
        className="w-full p-2 mb-4 border rounded-lg"
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

      {/* TRANSACTION */}
      <label className="font-medium">Tranzacție</label>
      <select
        className="w-full p-2 mb-4 border rounded-lg"
        value={filters.transaction}
        onChange={(e) =>
          setFilters({ ...filters, transaction: e.target.value })
        }
      >
        <option value="">Oricare</option>
        <option value="RENT">Închiriere</option>
        <option value="SALE">Vânzare</option>
      </select>

      {/* ROOMS */}
      <label className="font-medium">Camere</label>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Min"
          value={filters.roomsMin}
          onChange={(e) =>
            setFilters({ ...filters, roomsMin: e.target.value })
          }
        />
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Max"
          value={filters.roomsMax}
          onChange={(e) =>
            setFilters({ ...filters, roomsMax: e.target.value })
          }
        />
      </div>

      {/* PRICE */}
      <label className="font-medium">Preț</label>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Min"
          value={filters.priceMin}
          onChange={(e) =>
            setFilters({ ...filters, priceMin: e.target.value })
          }
        />
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Max"
          value={filters.priceMax}
          onChange={(e) =>
            setFilters({ ...filters, priceMax: e.target.value })
          }
        />
      </div>

      {/* ZONE */}
      <label className="font-medium">Zonă</label>
      <input
        className="w-full p-2 mb-4 border rounded-lg"
        placeholder="Ex: Militari"
        value={filters.zone}
        onChange={(e) =>
          setFilters({ ...filters, zone: e.target.value })
        }
      />

      {/* OWNER */}
      <label className="font-medium">Tip vânzător</label>
      <select
        className="w-full p-2 mb-4 border rounded-lg"
        value={filters.isOwner === undefined ? "" : filters.isOwner ? "true" : "false"}
        onChange={(e) =>
          setFilters({
            ...filters,
            isOwner:
              e.target.value === ""
                ? undefined
                : e.target.value === "true",
          })
        }
      >
        <option value="">Oricare</option>
        <option value="true">Proprietar</option>
        <option value="false">Agenție</option>
      </select>

      {/* CURRENCY SWITCH */}
      <label className="font-medium">Monedă</label>
      <select
        className="w-full p-2 mb-4 border rounded-lg"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        <option value="RON">RON</option>
        <option value="EUR">EUR</option>
      </select>

      {/* RESET FILTERS BUTTON */}
      <button
        onClick={() => {
          const empty = {
            q: "",
            propertyType: "",
            transaction: "",
            roomsMin: "",
            roomsMax: "",
            priceMin: "",
            priceMax: "",
            zone: "",
            isOwner: undefined,
          };
          setFilters(empty);
          setPage(1);
          setTotalPages(1);
          setCurrency("RON");
          setPage(1);
          loadAllListings();
        }}
        className="w-full bg-gray-300 text-black py-2 rounded-lg mb-2"
      >
        Resetează filtrele
      </button>

      <button
        onClick={() => {
          applyFilters(1);
          setDrawerOpen(false);
        }}
        className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
      >
        Aplică filtrele
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar
        onSearch={(value) => {
          setFilters({ ...filters, q: value });
          applyFilters(1);
        }}
      />

      {/* MOBILE FILTER BUTTON */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <FiFilter size={22} />
      </button>

      <div className="max-w-7xl mx-auto mt-6 px-4 pb-10 grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block bg-white shadow p-6 rounded-xl h-fit sticky top-24 max-h-[85vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Filtre</h3>
          {FiltersUI()}
        </div>

        {/* MOBILE DRAWER */}
        <div
          className={`
            fixed top-0 left-0 h-full w-72 bg-white shadow-xl p-6 z-50
            transform transition-transform duration-300
            ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
            md:hidden
          `}
        >
          <button
            className="mb-4 text-gray-600"
            onClick={() => setDrawerOpen(false)}
          >
            Închide
          </button>

          <h3 className="text-xl font-bold mb-4">Filtre</h3>
          {FiltersUI()}
        </div>

        {/* LISTINGS */}
        <div className="md:col-span-3">
          {loading ? (
            <p className="text-center text-gray-600 mt-10">Se încarcă...</p>
          ) : listings.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-lg font-medium">
              Nu s-a găsit niciun anunț.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-lg"
                  >
                    <img
                      src={l.Listing?.image || "/placeholder.jpg"}
                      className="w-full h-40 object-cover rounded-md"
                    />

                    <h3 className="font-bold mt-3">
                      {l.cleanTitle || l.Listing?.title}
                    </h3>

                    <p className="text-blue-600 font-bold mt-2">
                      {currency === "RON" ? (
                        l.priceRON ? `${l.priceRON} RON` : "Fără preț"
                      ) : l.priceEUR ? (
                        `${l.priceEUR} EUR`
                      ) : l.priceRON ? (
                        `${Math.round(l.priceRON / 5)} EUR`
                      ) : (
                        "Fără preț"
                      )}
                    </p>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {l.summary || l.Listing?.description || "Fără descriere"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6 justify-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      i + 1 === page ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}