import { useState } from "react";
import { createListingAI } from "../api/admin";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components_admin/AdminNavbar";

export default function AdminNewListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cleanTitle: "",
    summary: "",
    city: "",
    zone: "",
    rooms: "",
    transaction: "",
    propertyType: "",
    priceRON: "",
    priceEUR: "",
    link: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await createListingAI(form);
      setSuccess("Anunțul a fost adăugat cu succes!");
      setForm({
        cleanTitle: "",
        summary: "",
        city: "",
        zone: "",
        rooms: "",
        transaction: "",
        propertyType: "",
        priceRON: "",
        priceEUR: "",
        link: "",
        image: "",
      });

      setTimeout(() => navigate("/admin/listings"), 1200);
    } catch (err) {
      setError("Eroare la salvare. Verifică datele.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto px-6 mt-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          ➕ Adaugă Anunț Nou
        </h1>
        <p className="text-gray-600 mb-6">
          Completează informațiile principale ale proprietății.
        </p>

        {/* ALERTS */}
        {success && (
          <p className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg shadow">
            {success}
          </p>
        )}
        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg shadow">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl space-y-8 border border-gray-200"
        >
          {/* ------------------------------ */}
          {/* SECTION: DATE GENERALE */}
          {/* ------------------------------ */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📌 Informații Generale
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* TITLU */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Titlu Anunț
                </label>
                <input
                  type="text"
                  name="cleanTitle"
                  value={form.cleanTitle}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Apartament 2 camere..."
                />
              </div>

              {/* ORAȘ */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Oraș
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ZONĂ */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Zonă
                </label>
                <input
                  type="text"
                  name="zone"
                  value={form.zone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CAMERE */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Nr. Camere
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={form.rooms}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TRANZACȚIE */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Tranzacție
                </label>
                <select
                  name="transaction"
                  value={form.transaction}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează</option>
                  <option value="RENT">Închiriere</option>
                  <option value="SALE">Vânzare</option>
                </select>
              </div>

              {/* TIP PROPRIETATE */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Tip Proprietate
                </label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectează</option>
                  <option value="apartament">Apartament</option>
                  <option value="garsoniera">Garsonieră</option>
                  <option value="casa">Casă</option>
                  <option value="vila">Vilă</option>
                  <option value="teren">Teren</option>
                  <option value="spatiu">Spațiu comercial</option>
                </select>
              </div>
            </div>
          </div>

          {/* ------------------------------ */}
          {/* SECTION: PREȚURI */}
          {/* ------------------------------ */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💵 Prețuri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PREȚ EUR */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Preț EUR
                </label>
                <input
                  type="number"
                  name="priceEUR"
                  value={form.priceEUR}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PREȚ RON */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Preț RON
                </label>
                <input
                  type="number"
                  name="priceRON"
                  value={form.priceRON}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------ */}
          {/* SECTION: LINK & IMAGINE */}
          {/* ------------------------------ */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔗 Link & Media
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Link original anunț
                </label>
                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  URL Imagine
                </label>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://exemplu.ro/poza.jpg"
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------ */}
          {/* SECTION: DESCRIERE */}
          {/* ------------------------------ */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📝 Descriere
            </h2>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg shadow-sm h-32 resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrierea proprietății…"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Se salvează..." : "Adaugă Anunț"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}