import { useEffect, useState } from "react";
import {
  getAdminListingsAI,
  deleteListingAI,
  updateListingAI,
} from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";
import AdminListingEditModal from "./AdminListingEditModal";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState(null);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await getAdminListingsAI({
        page,
        limit,
        onlyIncomplete: false,
      });

      setListings(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("LOAD LISTINGS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [page]);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest anunț?")) return;

    try {
      await deleteListingAI(id);
      loadListings();
    } catch (err) {
      console.error("DELETE LISTING ERROR:", err);
    }
  };

  const saveListing = async (updatedItem) => {
    try {
      await updateListingAI(updatedItem.id, updatedItem);
      await loadListings();
      setEditingItem(null);
    } catch (err) {
      console.error("UPDATE LISTING ERROR:", err);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();

  const visibleListings =
    normalizedQuery.length === 0
      ? listings
      : listings.filter((item) => {
          const title =
            item.cleanTitle || item.Listing?.title || "";
          return title.toLowerCase().includes(normalizedQuery);
        });

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Administrare Anunțuri (ListingAI)</h1>
        <p className="text-gray-600 mb-6">
          Aici vezi toate anunțurile din <span className="font-semibold">ListingAI</span>, cu
          posibilitatea de ștergere, editare și filtrare locală după titlu.
        </p>

        <div className="mt-2 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Caută după titlu..."
            value={query}
            onChange={handleSearchChange}
            className="border rounded-lg p-3 w-80 shadow-sm"
          />
          <span className="text-sm text-gray-500">
            Filtrarea se aplică doar pe pagina curentă.
          </span>
        </div>

        <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Titlu</th>
                <th className="p-3">Preț</th>
                <th className="p-3">Oraș</th>
                <th className="p-3">Camere</th>
                <th className="p-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    Se încarcă...
                  </td>
                </tr>
              ) : visibleListings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    Nu există anunțuri pentru filtrele curente.
                  </td>
                </tr>
              ) : (
                visibleListings.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.id}</td>
                    <td className="p-3 font-medium">
                      {item.cleanTitle ?? item.Listing?.title ?? "(fără titlu)"}
                    </td>
                    <td className="p-3 text-blue-600 font-bold">
                      {item.priceEUR ? `${item.priceEUR} €` : "-"}
                    </td>
                    <td className="p-3">{item.city || "-"}</td>
                    <td className="p-3">{item.rooms ?? "-"}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 text-sm"
                        onClick={() => setEditingItem(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md shadow hover:bg-red-700 text-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Înapoi
          </button>

          <span className="font-medium text-lg">
            Pagina {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Înainte →
          </button>
        </div>
      </div>

      {editingItem && (
        <AdminListingEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={saveListing}
        />
      )}
    </div>
  );
}