import { useState } from "react";
import { createListingAI } from "../api/admin";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components_admin/AdminNavbar";
import { 
  RiHome4Line, 
  RiMoneyDollarCircleLine, 
  RiLinkM, 
  RiFileTextLine, 
  RiSave3Line,
  RiImageAddLine,
  RiMapPinLine,
  RiBuilding2Line,
  RiPriceTag3Line
} from "react-icons/ri";

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
  const [status, setStatus] = useState({ type: null, msg: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      await createListingAI(form);
      setStatus({ type: "success", msg: "Anunțul a fost adăugat cu succes!" });
      
      // Resetare formular
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

      // Redirect după scurt timp
      setTimeout(() => navigate("/admin/listings"), 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Eroare la salvare. Verifică datele introduse." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
             <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-sm">
                <RiHome4Line />
             </div>
             Adaugă Anunț Nou
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Introdu detaliile proprietății pentru a o adăuga manual în baza de date AI.
          </p>
        </div>

        {/* FEEDBACK MESAJE */}
        {status.msg && (
          <div className={`mb-8 p-4 rounded-xl shadow-sm text-center font-medium animate-fadeIn
            ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTIUNEA 1: INFO PRINCIPALE */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            
            <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold text-lg uppercase tracking-wider">
               <RiBuilding2Line size={24} /> Informații Proprietate
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titlu Anunț</label>
                <input
                  type="text"
                  name="cleanTitle"
                  value={form.cleanTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="ex: Apartament 2 camere modern, zona centrală..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Oraș</label>
                <div className="relative">
                    <RiMapPinLine className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="ex: Timișoara"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zonă / Cartier</label>
                <input
                  type="text"
                  name="zone"
                  value={form.zone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="ex: Complex Studențesc"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tip Proprietate</label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                >
                  <option value="">Alege tipul...</option>
                  <option value="apartament">Apartament</option>
                  <option value="garsoniera">Garsonieră</option>
                  <option value="casa">Casă</option>
                  <option value="vila">Vilă</option>
                  <option value="teren">Teren</option>
                  <option value="spatiu">Spațiu Comercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Camere</label>
                    <input
                      type="number"
                      name="rooms"
                      value={form.rooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tranzacție</label>
                    <select
                      name="transaction"
                      value={form.transaction}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    >
                      <option value="">Alege...</option>
                      <option value="RENT">Chirie</option>
                      <option value="SALE">Vânzare</option>
                    </select>
                 </div>
              </div>

            </div>
          </div>

          {/* SECTIUNEA 2: PRETURI */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>

            <div className="flex items-center gap-2 mb-6 text-green-600 font-bold text-lg uppercase tracking-wider">
               <RiMoneyDollarCircleLine size={24} /> Detalii Financiare
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preț (EUR)</label>
                <div className="relative">
                   <span className="absolute left-4 top-3.5 text-gray-400 font-bold">€</span>
                   <input
                    type="number"
                    name="priceEUR"
                    value={form.priceEUR}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preț (RON)</label>
                <div className="relative">
                   <span className="absolute left-4 top-3.5 text-gray-400 font-bold">RON</span>
                   <input
                    type="number"
                    name="priceRON"
                    value={form.priceRON}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTIUNEA 3: MEDIA & LINKURI */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>

             <div className="flex items-center gap-2 mb-6 text-purple-600 font-bold text-lg uppercase tracking-wider">
               <RiLinkM size={24} /> Media & Resurse
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Imagine</label>
                <div className="relative">
                    <RiImageAddLine className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://exemplu.ro/imagine.jpg"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    />
                </div>
                {form.image && (
                    <div className="mt-4 w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link Original Anunț</label>
                <div className="relative">
                    <RiLinkM className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                    type="text"
                    name="link"
                    value={form.link}
                    onChange={handleChange}
                    placeholder="https://olx.ro/..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all outline-none text-blue-600"
                    />
                </div>
              </div>
            </div>
          </div>

          {/* SECTIUNEA 4: DESCRIERE */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>

             <div className="flex items-center gap-2 mb-6 text-yellow-600 font-bold text-lg uppercase tracking-wider">
               <RiFileTextLine size={24} /> Descriere Detaliată
            </div>

            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              rows="5"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none resize-none leading-relaxed"
              placeholder="Adaugă o descriere completă sau un rezumat generat de AI..."
            />
          </div>

          {/* BUTON ACTIUNE */}
          <div className="flex justify-end pt-6">
            <button
              disabled={loading}
              className="group relative flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Se procesează...
                  </>
              ) : (
                  <>
                    <RiSave3Line size={24} />
                    Salvează Anunțul
                  </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}