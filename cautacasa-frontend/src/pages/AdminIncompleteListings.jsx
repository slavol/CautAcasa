import { useEffect, useState } from "react";
import {
  getAdminListingsAI,
  deleteListingAI,
  updateListingAI,
} from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";
// Importăm ambele modale
import AdminListingEditModal from "./AdminListingEditModal";
import AdminDeleteModal from "../components_admin/AdminDeleteModal"; // <-- NOU

import { 
  RiErrorWarningLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiExternalLinkLine, 
  RiSave3Line 
} from "react-icons/ri";

export default function AdminIncompleteListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stare Editare
  const [editingItem, setEditingItem] = useState(null);

  // Stare Ștergere (NOU)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    isDeleting: false
  });

  const loadIncomplete = async () => {
    setLoading(true);
    try {
      const res = await getAdminListingsAI({ onlyIncomplete: true });
      setListings(res.data.items || []);
    } catch (err) {
      console.error("LOAD INCOMPLETE ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadIncomplete();
  }, []);

  // 1. Deschide Modalul de Ștergere
  const requestDelete = (id) => {
    setDeleteModal({ isOpen: true, itemId: id, isDeleting: false });
  };

  // 2. Confirmă Ștergerea (Apelează API)
  const confirmDelete = async () => {
    if (!deleteModal.itemId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true })); // Arată spinner
    try {
      await deleteListingAI(deleteModal.itemId);
      await loadIncomplete(); // Refresh listă
      setDeleteModal({ isOpen: false, itemId: null, isDeleting: false }); // Închide
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Eroare la ștergere!");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSaveListing = async (originalItem, updatedData) => {
    try {
        await updateListingAI(originalItem.id, updatedData);
        await loadIncomplete();
        setEditingItem(null);
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        alert("Eroare la salvare!");
    }
  };

  const missingFields = (item) => {
    const fields = [];
    if (!item.cleanTitle && !item.Listing?.title) fields.push("Titlu");
    if (!item.propertyType) fields.push("Tip");
    if (!item.transaction) fields.push("Tranzacție");
    if (!item.rooms) fields.push("Camere");
    if (!item.priceEUR) fields.push("Preț");
    if (!item.city) fields.push("Oraș");
    if (!item.image && !item.Listing?.image) fields.push("Imagine");
    return fields;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-red-100 text-red-600 rounded-lg shadow-sm">
                <RiErrorWarningLine />
              </span>
              Anunțuri Incomplete
            </h1>
            <p className="text-gray-500 mt-2 ml-1">
              Anunțuri care necesită completare manuală (AI-ul nu a găsit toate datele).
            </p>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
             Probleme active: <span className="text-red-600 font-bold ml-1">{listings.length}</span>
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info Sursă</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ce lipsește?</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm">Se verifică baza de date...</p>
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <RiSave3Line className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">Nicio eroare!</p>
                      <p className="text-sm">Toate anunțurile au datele complete.</p>
                    </td>
                  </tr>
                ) : (
                  listings.map((item) => {
                    const missing = missingFields(item);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                          #{item.id}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 truncate max-w-xs" title={item.Listing?.title}>
                                {item.cleanTitle || item.Listing?.title || <span className="italic text-gray-400">Titlu indisponibil</span>}
                            </span>
                            
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 mt-1 w-fit">
                                    <RiExternalLinkLine /> Link Original
                                </a>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-sm">
                            {missing.map((f) => (
                              <span key={f} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                              title="Completează datele"
                            >
                              <RiEditLine size={18} />
                            </button>
                            
                            {/* Butonul care deschide MODALUL DE ȘTERGERE */}
                            <button
                              onClick={() => requestDelete(item.id)}
                              className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                              title="Șterge"
                            >
                              <RiDeleteBinLine size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RENDERIZĂM MODALUL DE EDITARE */}
      {editingItem && (
        <AdminListingEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveListing}
        />
      )}

      {/* RENDERIZĂM MODALUL DE ȘTERGERE (NOU) */}
      <AdminDeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Ștergi acest anunț?"
        message="Dacă ștergi anunțul, acesta va dispărea permanent din lista AI. Ești sigur?"
        isDeleting={deleteModal.isDeleting}
      />

    </div>
  );
}