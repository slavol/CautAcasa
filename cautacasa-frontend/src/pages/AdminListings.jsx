import { useEffect, useState, useRef } from "react";
import {
  getAdminListingsAI,
  deleteListingAI,
  updateListingAI,
} from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";
import AdminListingEditModal from "./AdminListingEditModal";
// IMPORTAM MODALUL DE STERGERE
import AdminDeleteModal from "../components_admin/AdminDeleteModal"; 

import { 
  RiSearchLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiMapPinLine, 
  RiHomeSmileLine,
  RiCloseLine
} from "react-icons/ri";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  
  // Paginare & Căutare
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // Stări UI
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  // Stare Ștergere (NOU)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    isDeleting: false
  });

  const debounceRef = useRef(null);

  // 1. Încărcare Date
  const loadListings = async (currentPage = 1, search = "") => {
    setLoading(true);
    try {
      const res = await getAdminListingsAI({
        page: currentPage,
        limit,
        search,
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
    loadListings(1, "");
  }, []);

  // 2. Search Logic
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadListings(1, val);
    }, 500);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setPage(1);
    loadListings(1, "");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadListings(newPage, searchTerm);
    }
  };

  // 3. Logică Ștergere (Cu Modal)
  const requestDelete = (id) => {
    setDeleteModal({ isOpen: true, itemId: id, isDeleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteModal.itemId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await deleteListingAI(deleteModal.itemId);
      // Reîncărcăm lista curentă
      loadListings(page, searchTerm);
      setDeleteModal({ isOpen: false, itemId: null, isDeleting: false });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Eroare la ștergere!");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // 4. Logică Salvare
  const saveListing = async (updatedItem) => {
    try {
      await updateListingAI(updatedItem.id, updatedItem);
      loadListings(page, searchTerm);
      setEditingItem(null);
    } catch (err) {
      console.error("UPDATE LISTING ERROR:", err);
      alert("Eroare la salvare.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Toate anunțurile
            </h1>
            <p className="text-gray-500 mt-1">
              Gestionează baza de date AI completă.
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiSearchLine className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            
            <input
              type="text"
              placeholder="Caută titlu, oraș..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />

            {searchTerm && (
              <button 
                onClick={handleResetSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Resetează"
              >
                <RiCloseLine size={20} />
              </button>
            )}
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Titlu</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preț / Transacție</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Locație</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm">Se încarcă datele...</p>
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Nu am găsit niciun anunț care să corespundă căutării "{searchTerm}".
                      <br/>
                      <button 
                        onClick={handleResetSearch}
                        className="mt-2 text-blue-600 hover:underline text-sm font-medium"
                      >
                        Resetează filtrele
                      </button>
                    </td>
                  </tr>
                ) : (
                  listings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-400">
                        #{item.id}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate font-medium text-gray-900" title={item.cleanTitle || item.Listing?.title}>
                          {item.cleanTitle || item.Listing?.title || <span className="italic text-gray-400">Fără titlu</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                           <RiHomeSmileLine /> {item.rooms ? `${item.rooms} camere` : 'N/A'} • {item.propertyType || 'Tip necunoscut'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {item.priceEUR ? `${item.priceEUR.toLocaleString()} €` : "-"}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                          ${item.transaction === 'RENT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.transaction === 'RENT' ? 'Chirie' : 'Vânzare'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <RiMapPinLine className="text-gray-400" />
                          {item.city || "Necunoscut"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                            title="Editează"
                          >
                            <RiEditLine size={18} />
                          </button>
                          
                          {/* BUTON STERGERE CU MODAL */}
                          <button
                            onClick={() => requestDelete(item.id)}
                            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                            title="Șterge"
                          >
                            <RiDeleteBinLine size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {!loading && listings.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Pagina <span className="font-semibold text-gray-900">{page}</span> din <span className="font-semibold">{totalPages}</span>
              </span>
              
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Înapoi
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Înainte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDITARE */}
      {editingItem && (
        <AdminListingEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={saveListing}
        />
      )}

      {/* MODAL STERGERE */}
      <AdminDeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Ștergi acest anunț?"
        message="Anunțul va fi șters definitiv din baza de date. Ești sigur?"
        isDeleting={deleteModal.isDeleting}
      />

    </div>
  );
}