import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function FiltersDrawer({ open, onClose, filters, setFilters, reload }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    setFilters(localFilters);
    reload();
    onClose();
  };

  const clearFilters = () => {
    const empty = {
      q: "",
      propertyType: "",
      transaction: "",
      roomsMin: "",
      roomsMax: "",
      priceMin: "",
      priceMax: "",
      zone: "",
      isOwner: undefined
    };
    setLocalFilters(empty);
    setFilters(empty);
    reload();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="
              fixed right-0 top-0 h-full w-80 max-w-full 
              bg-white shadow-2xl z-50 p-6 overflow-y-auto
            "
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <h2 className="text-xl font-bold mb-4">Filtre</h2>

            <div className="flex flex-col gap-4">

              <div>
                <label className="font-semibold text-sm">Căutare</label>
                <input
                  type="text"
                  placeholder="Caută..."
                  value={localFilters.q}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, q: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Tip proprietate</label>
                <select
                  value={localFilters.propertyType}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, propertyType: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                >
                  <option value="">Toate</option>
                  <option value="apartament">Apartament</option>
                  <option value="garsoniera">Garsonieră</option>
                  <option value="casa">Casă</option>
                  <option value="vila">Vilă</option>
                  <option value="teren">Teren</option>
                  <option value="hala">Hală</option>
                  <option value="spatiu">Spațiu</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-sm">Tranzacție</label>
                <select
                  value={localFilters.transaction}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, transaction: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                >
                  <option value="">Toate</option>
                  <option value="SALE">Vânzare</option>
                  <option value="RENT">Închiriere</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-sm">Număr camere</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.roomsMin}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, roomsMin: e.target.value })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.roomsMax}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, roomsMax: e.target.value })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-sm">Preț (RON)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.priceMin}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, priceMin: e.target.value })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.priceMax}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, priceMax: e.target.value })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-sm">Zonă</label>
                <input
                  type="text"
                  placeholder="Ex: Militari"
                  value={localFilters.zone}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, zone: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </div>

              <div className="mt-2">
                <label className="font-semibold text-sm">Proprietar</label>

                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="checkbox"
                    checked={localFilters.isOwner === true}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        isOwner: e.target.checked ? true : undefined,
                      })
                    }
                  />
                  <span>Doar proprietar</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={applyFilters}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700"
                >
                  Aplică filtre
                </button>

                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Resetează filtre
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}