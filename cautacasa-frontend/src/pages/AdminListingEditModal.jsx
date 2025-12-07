import { useState, useEffect } from "react";

export default function AdminListingEditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...item });
  }, [item]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Editează Anunț #{item.id}</h2>
          <button
            className="text-gray-500 hover:text-red-500 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">

          {/* TITLE */}
          <div className="col-span-2">
            <label className="font-semibold">Titlu Curățat</label>
            <input
              className="w-full border rounded p-2"
              value={form.cleanTitle || ""}
              onChange={(e) => updateField("cleanTitle", e.target.value)}
            />
          </div>

          {/* PROPERTY TYPE */}
          <div>
            <label className="font-semibold">Tip proprietate</label>
            <select
              className="w-full border rounded p-2"
              value={form.propertyType || ""}
              onChange={(e) => updateField("propertyType", e.target.value)}
            >
              <option value="">Selectează...</option>
              <option value="APARTMENT">Apartament</option>
              <option value="STUDIO">Garsonieră</option>
              <option value="HOUSE">Casă</option>
              <option value="VILLA">Vila</option>
              <option value="DUPLEX">Duplex</option>
              <option value="PENTHOUSE">Penthouse</option>
            </select>
          </div>

          {/* TRANSACTION */}
          <div>
            <label className="font-semibold">Tranzacție</label>
            <select
              className="w-full border rounded p-2"
              value={form.transaction || ""}
              onChange={(e) => updateField("transaction", e.target.value)}
            >
              <option value="">Selectează...</option>
              <option value="RENT">Închiriere</option>
              <option value="SALE">Vânzare</option>
            </select>
          </div>

          {/* ROOMS */}
          <div>
            <label className="font-semibold">Număr camere</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={form.rooms || ""}
              onChange={(e) => updateField("rooms", Number(e.target.value))}
            />
          </div>

          {/* CITY */}
          <div>
            <label className="font-semibold">Oraș</label>
            <input
              className="w-full border rounded p-2"
              value={form.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>

          {/* ZONE */}
          <div>
            <label className="font-semibold">Zonă</label>
            <input
              className="w-full border rounded p-2"
              value={form.zone || ""}
              onChange={(e) => updateField("zone", e.target.value)}
            />
          </div>

          {/* PRICE RON */}
          <div>
            <label className="font-semibold">Preț (RON)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={form.priceRON || ""}
              onChange={(e) =>
                updateField("priceRON", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>

          {/* PRICE EUR */}
          <div>
            <label className="font-semibold">Preț (EUR)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={form.priceEUR || ""}
              onChange={(e) =>
                updateField("priceEUR", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>

          {/* IMAGE */}
          <div className="col-span-2">
            <label className="font-semibold">Imagine (URL)</label>
            <input
              className="w-full border rounded p-2"
              value={form.image || ""}
              onChange={(e) => updateField("image", e.target.value)}
            />
            {form.image && (
              <img
                src={form.image}
                className="w-32 h-32 object-cover rounded mt-2 border"
              />
            )}
          </div>

          {/* LINK */}
          <div className="col-span-2">
            <label className="font-semibold">Link</label>
            <input
              className="w-full border rounded p-2"
              value={form.link || ""}
              onChange={(e) => updateField("link", e.target.value)}
            />
          </div>

          {/* SUMMARY */}
          <div className="col-span-2">
            <label className="font-semibold">Descriere</label>
            <textarea
              rows="4"
              className="w-full border rounded p-2"
              value={form.summary || ""}
              onChange={(e) => updateField("summary", e.target.value)}
            />
          </div>

          {/* OWNER */}
          <div>
            <label className="font-semibold">Este proprietar?</label>
            <select
              className="w-full border rounded p-2"
              value={form.isOwner ?? ""}
              onChange={(e) =>
                updateField("isOwner", e.target.value === "true" ? true : false)
              }
            >
              <option value="">Necunoscut</option>
              <option value="true">Da</option>
              <option value="false">Nu</option>
            </select>
          </div>

          {/* QUALITY SCORE */}
          <div>
            <label className="font-semibold">Scor Calitate AI</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={form.qualityScore || 0}
              onChange={(e) =>
                updateField("qualityScore", Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Anulează
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Se salvează..." : "Salvează modificările"}
          </button>
        </div>
      </div>
    </div>
  );
}