import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { filterListings } from "../api/listings";

// --- ICONIȚE SVG ---
const IconMapPin = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const IconBed = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-1"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>);
const IconFilter = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 absolute left-3 top-2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);

export default function Listings() {
  const navigate = useNavigate();

  // --- STATE ---
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Valori inițiale curate
  const initialFilters = {
    q: "",
    priceMin: "",
    priceMax: "",
    roomsMin: "",
    roomsMax: "",
    propertyType: "",
    transaction: "",
    isOwner: "", // string gol = inactiv
  };

  const [filters, setFilters] = useState(initialFilters);

  // --- INIT ---
  useEffect(() => {
    // La prima încărcare, folosim filtrele inițiale (goale)
    fetchData(1, initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CORE LOGIC ---

  // Această funcție primește 'filtersToUse' ca argument. 
  // Asta rezolvă problema de sincronizare (Reset vs State).
  const fetchData = async (newPage, filtersToUse) => {
    try {
      setLoading(true);

      const payload = {
        page: newPage,
        limit: 9,
      };

      // Construire Payload strictă
      if (filtersToUse.q && filtersToUse.q.trim()) payload.q = filtersToUse.q.trim();
      if (filtersToUse.priceMin) payload.priceMin = parseInt(filtersToUse.priceMin);
      if (filtersToUse.priceMax) payload.priceMax = parseInt(filtersToUse.priceMax);
      if (filtersToUse.roomsMin) payload.roomsMin = parseInt(filtersToUse.roomsMin);
      if (filtersToUse.roomsMax) payload.roomsMax = parseInt(filtersToUse.roomsMax);
      if (filtersToUse.propertyType) payload.propertyType = filtersToUse.propertyType;
      if (filtersToUse.transaction) payload.transaction = filtersToUse.transaction;

      // Logică strictă pentru Boolean
      if (filtersToUse.isOwner === "true") {
        payload.isOwner = true;
      } else if (filtersToUse.isOwner === "false") {
        payload.isOwner = false;
      }
      // Dacă e "", nu trimitem nimic -> backend-ul returnează tot.

      console.log("📡 Se trimite la API:", payload);

      const res = await filterListings(payload);

      setListings(res.data.listings || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalResults(res.data.total || 0);

    } catch (err) {
      console.error("Eroare filtrare:", err);
    } finally {
      setLoading(false);
    }
  };

  // Butonul "Aplică Filtrele" folosește state-ul curent din UI
  const handleApply = () => {
    fetchData(1, filters);
  };

  // Butonul "Șterge Tot" forțează obiectul gol, ignorând state-ul lent
  const handleReset = () => {
    setFilters(initialFilters); // Resetează UI-ul
    fetchData(1, initialFilters); // Resetează datele INSTANT cu obiectul curat
  };

  // Handler pentru input-uri
  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // --- PAGINATION COMPONENT ---
  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Simplificare logică paginare
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages = [1];
      if (page > 2) pages.push("...");
      if (page > 1 && page < totalPages) pages.push(page);
      if (page < totalPages - 1) pages.push("...");
      pages.push(totalPages);
      pages = [...new Set(pages)];
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-10 mb-6">
        <button
          disabled={page === 1}
          onClick={() => fetchData(page - 1, filters)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-100"
        >
          &laquo; Prev
        </button>
        {pages.map((p, idx) =>
          p === "..." ? <span key={idx} className="px-2 text-gray-400">...</span> : (
            <button
              key={idx}
              onClick={() => fetchData(p, filters)}
              className={`px-3 py-1 rounded border ${page === p ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100"}`}
            >
              {p}
            </button>
          ))}
        <button
          disabled={page === totalPages}
          onClick={() => fetchData(page + 1, filters)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-100"
        >
          Next &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <IconFilter />
                <h3 className="font-bold text-lg text-gray-800">Filtrează</h3>
              </div>

              {/* SEARCH */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cuvinte cheie</label>
                <div className="relative">
                  <IconSearch />
                  <input
                    type="text"
                    value={filters.q}
                    onChange={(e) => handleInputChange("q", e.target.value)}
                    placeholder="Titlu, zonă..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* TIP & TRANZACTIE */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tip</label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={filters.propertyType}
                    onChange={(e) => handleInputChange("propertyType", e.target.value)}
                  >
                    <option value="">Toate</option>
                    <option value="apartament">Apartament</option>
                    <option value="garsoniera">Garsonieră</option>
                    <option value="casa">Casă</option>
                    <option value="teren">Teren</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Acțiune</label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={filters.transaction}
                    onChange={(e) => handleInputChange("transaction", e.target.value)}
                  >
                    <option value="">Toate</option>
                    <option value="RENT">Chirie</option>
                    <option value="SALE">Vânzare</option>
                  </select>
                </div>
              </div>

              {/* PRICE */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Preț (EUR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.priceMin}
                    onChange={(e) => handleInputChange("priceMin", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.priceMax}
                    onChange={(e) => handleInputChange("priceMax", e.target.value)}
                  />
                </div>
              </div>

              {/* CAMERE */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Camere</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.roomsMin}
                    onChange={(e) => handleInputChange("roomsMin", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.roomsMax}
                    onChange={(e) => handleInputChange("roomsMax", e.target.value)}
                  />
                </div>
              </div>

              {/* PROPRIETAR / AGENTIE */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Vânzător</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="isOwner"
                      checked={filters.isOwner === ""}
                      onChange={() => handleInputChange("isOwner", "")}
                      className="text-blue-600"
                    />
                    Oricare
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="isOwner"
                      checked={filters.isOwner === "true"}
                      onChange={() => handleInputChange("isOwner", "true")}
                      className="text-blue-600"
                    />
                    Doar Proprietari
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="radio"
                      name="isOwner"
                      checked={filters.isOwner === "false"}
                      onChange={() => handleInputChange("isOwner", "false")}
                      className="text-blue-600"
                    />
                    Doar Agenții
                  </label>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApply}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition"
                >
                  Aplică Filtrele
                </button>
                <button
                  onClick={handleReset}
                  className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  Șterge tot
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Rezultate <span className="text-gray-400 font-normal text-lg">({totalResults})</span>
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-xl shadow-sm h-80 animate-pulse border border-gray-100">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconSearch />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Niciun rezultat găsit</h3>
                <p className="text-gray-500 mt-2">Încearcă să relaxezi filtrele.</p>
                <button onClick={handleReset} className="mt-6 text-blue-600 font-medium hover:underline">Resetează filtrele</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((l) => {
                  const mainImage = l.image || l.Listing?.image || "https://placehold.co/600x400?text=Fara+Imagine";
                  const price = l.priceEUR ? `€${l.priceEUR.toLocaleString()}` : "Preț nespecificat";
                  const isOwner = l.isOwner === true;
                  const zone = l.zone || l.city || "Locație necunoscută";

                  return (
                    <div
                      key={l.id}
                      onClick={() => navigate(`/listings/${l.id}`)}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                    >
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        <img
                          src={mainImage}
                          alt={l.cleanTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          // AICI ESTE SECRETUL:
                          onError={(e) => {
                            e.target.onerror = null; // Previne bucla infinită dacă și placeholderul e stricat
                            e.target.src = "https://placehold.co/600x400?text=Imagine+Indisponibilă"; // Pune o imagine gri
                          }}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {isOwner ? (
                            <span className="bg-green-600/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Proprietar</span>
                          ) : (
                            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Agenție</span>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                          <p className="text-white font-bold text-xl">{price}</p>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 h-12 text-sm leading-relaxed group-hover:text-blue-600 transition-colors">
                          {l.cleanTitle || "Titlu indisponibil"}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-auto gap-4 pb-2">
                          <div className="flex items-center">
                            <IconMapPin />
                            <span className="truncate max-w-[120px]">{zone}</span>
                          </div>
                          {l.rooms && l.rooms > 0 && (
                            <div className="flex items-center">
                              <IconBed />
                              <span>{l.rooms} cam.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Pagination />
          </main>
        </div>
      </div>
    </div>
  );
}