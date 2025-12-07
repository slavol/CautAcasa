// src/pages/AdminIncompleteListings.jsx
import { useEffect, useState } from "react";
import {
  getAdminListingsAI,
  deleteListingAI,
  updateListingAI,
} from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";

export default function AdminIncompleteListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // stare pentru modal de editare
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    cleanTitle: "",
    propertyType: "",
    transaction: "",
    rooms: "",
    summary: "",
    priceEUR: "",
    city: "",
    zone: "",
    image: "",
    link: "",
    isOwner: false,
    qualityScore: 0,
  });
  const [saving, setSaving] = useState(false);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest anunț?")) return;

    try {
      await deleteListingAI(id);
      await loadIncomplete();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const missingFields = (item) => {
    const fields = [];

    if (!item.cleanTitle && !item.Listing?.title) fields.push("Titlu");
    if (!item.propertyType) fields.push("Tip Proprietate");
    if (!item.transaction) fields.push("Tranzacție");
    if (!item.rooms) fields.push("Camere");
    if (!item.summary && !item.Listing?.description) fields.push("Descriere");
    if (!item.priceEUR) fields.push("Preț EUR");
    if (!item.city) fields.push("Oraș");
    if (!item.image && !item.Listing?.image) fields.push("Imagine");

    return fields;
  };

 

  const openEditModal = (item) => {
    setEditingItem(item);

    setForm({
      cleanTitle: item.cleanTitle || item.Listing?.title || "",
      propertyType: item.propertyType || "",
      transaction: item.transaction || item.Listing?.transaction || "",
      rooms: item.rooms ?? "",
      summary: item.summary || item.Listing?.description || "",
      priceEUR:
        item.priceEUR ??
        (item.Listing?.convertedPrice ?? item.Listing?.price ?? ""),
      city: item.city || item.Listing?.city || "",
      zone: item.zone || "",
      image: item.image || item.Listing?.image || "",
      link: item.link || item.Listing?.link || "",
      isOwner: typeof item.isOwner === "boolean" ? item.isOwner : false,
      qualityScore: item.qualityScore ?? 0,
    });
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setSaving(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const payload = {
        cleanTitle: form.cleanTitle || null,
        propertyType: form.propertyType || null,
        transaction: form.transaction || null,
        rooms: form.rooms !== "" ? Number(form.rooms) : null,
        summary: form.summary || null,
        priceEUR: form.priceEUR !== "" ? Number(form.priceEUR) : null,
        city: form.city || null,
        zone: form.zone || null,
        image: form.image || null,
        link: form.link || null,
        isOwner: form.isOwner,
        qualityScore:
          form.qualityScore !== "" ? Number(form.qualityScore) : 0,
      };

      await updateListingAI(editingItem.id, payload);
      await loadIncomplete();
      closeEditModal();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Anunțuri Incomplete</h1>
        <p className="text-gray-600 mt-1">
          Aici vezi toate anunțurile care au câmpuri esențiale lipsă.
        </p>

        <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Titlu</th>
                <th className="p-3">Lipsuri</th>
                <th className="p-3">Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center">
                    Se încarcă…
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center">
                    🎉 Nu există anunțuri incomplete!
                  </td>
                </tr>
              ) : (
                listings.map((item) => {
                  const missing = missingFields(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{item.id}</td>

                      <td className="p-3 font-medium">
                        {item.cleanTitle ||
                          item.Listing?.title || (
                            <span className="italic text-red-600">
                              Fără titlu
                            </span>
                          )}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {missing.map((f) => (
                            <span
                              key={f}
                              className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 flex gap-3">
                        <button
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                          onClick={() => openEditModal(item)}
                        >
                          Editează
                        </button>

                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Editează anunț #{editingItem.id}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                onClick={closeEditModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {editingItem.Listing && (
              <div className="mb-4 text-xs text-gray-500 border rounded-lg p-3 bg-gray-50">
                <p>
                  <span className="font-semibold">Titlu original:</span>{" "}
                  {editingItem.Listing.title}
                </p>
                <p>
                  <span className="font-semibold">Oraș original:</span>{" "}
                  {editingItem.Listing.city}
                </p>
                {editingItem.Listing.link && (
                  <p>
                    <span className="font-semibold">Link:</span>{" "}
                    <a
                      href={editingItem.Listing.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Deschide anunțul
                    </a>
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titlu curățat
                  </label>
                  <input
                    type="text"
                    name="cleanTitle"
                    value={form.cleanTitle}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Titlu anunț"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tip Proprietate
                  </label>
                  <input
                    type="text"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="ex: APARTMENT / HOUSE / STUDIO / LAND"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tranzacție
                  </label>
                  <select
                    name="transaction"
                    value={form.transaction}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">(necunoscut)</option>
                    <option value="RENT">RENT (Închiriere)</option>
                    <option value="SALE">SALE (Vânzare)</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Camere
                  </label>
                  <input
                    type="number"
                    name="rooms"
                    value={form.rooms}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preț EUR
                  </label>
                  <input
                    type="number"
                    name="priceEUR"
                    value={form.priceEUR}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Oraș
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="ex: Timișoara"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Zonă / Cartie
                  </label>
                  <input
                    type="text"
                    name="zone"
                    value={form.zone}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="ex: Zorilor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={form.link}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="URL anunț"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    URL Imagine
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="URL imagine"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Descriere / Rezumat
                  </label>
                  <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Rezumat curățat al descrierii"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOwner"
                    name="isOwner"
                    checked={form.isOwner}
                    onChange={handleFormChange}
                    className="rounded"
                  />
                  <label htmlFor="isOwner" className="text-sm">
                    Proprietar (nu agenție)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Scor Calitate (0-100)
                  </label>
                  <input
                    type="number"
                    name="qualityScore"
                    value={form.qualityScore}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Se salvează..." : "Salvează modificările"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}