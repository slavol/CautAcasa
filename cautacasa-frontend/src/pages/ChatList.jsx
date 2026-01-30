import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { getChatSessions, deleteChatSession } from "../api/chat";
import { 
  RiAddLine, 
  RiMessage3Line, 
  RiDeleteBinLine, 
  RiErrorWarningLine, 
  RiChat1Line,
  RiArrowRightSLine,
  RiTimeLine
} from "react-icons/ri";

export default function ChatList() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Stare pentru încărcare
  const navigate = useNavigate();

  // STARE PENTRU MODAL
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    chatId: null,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const res = await getChatSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("ERROR LOADING SESSIONS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (e, sessionId) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, chatId: sessionId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, chatId: null });
  };

  const confirmDelete = async () => {
    const idToDelete = deleteModal.chatId;
    if (!idToDelete) return;

    try {
      await deleteChatSession(idToDelete);
      setSessions((prev) => prev.filter((s) => s.id !== idToDelete));
      closeDeleteModal();
    } catch (err) {
      console.error("DELETE FAILED:", err);
      alert("Eroare la ștergere.");
      closeDeleteModal();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <UserNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* HEADER CU GRADIENT TEXT */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Conversațiile Mele
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Gestionează istoricul căutărilor tale imobiliare
              </p>
            </div>
            
            <button 
                onClick={() => navigate('/chat/new')}
                className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
                <RiAddLine className="mr-2 text-xl" />
                Conversație Nouă
            </button>
        </div>

        {/* LISTA SAU LOADING SAU EMPTY STATE */}
        {isLoading ? (
          <div className="space-y-4">
             {/* Schelet de încărcare (Skeleton UI) */}
             {[1, 2, 3].map((i) => (
               <div key={i} className="h-24 bg-white rounded-2xl shadow-sm animate-pulse"></div>
             ))}
          </div>
        ) : sessions.length === 0 ? (
          
          /* EMPTY STATE FRUMOS */
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
             <div className="bg-blue-50 p-6 rounded-full mb-4 animate-bounce-slow">
                <RiMessage3Line size={48} className="text-blue-500" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Nu ai nicio conversație</h3>
             <p className="text-gray-500 text-center max-w-sm mb-6">
               Începe o căutare nouă pentru a găsi apartamentul sau casa visurilor tale cu ajutorul AI-ului.
             </p>
             <button 
                onClick={() => navigate('/chat/new')}
                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
             >
                Începe acum &rarr;
             </button>
          </div>

        ) : (
          
          /* LISTA CARDURI MODERNE */
          <div className="grid gap-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/chat/${s.id}`)}
                className="group relative bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 cursor-pointer flex items-center justify-between overflow-hidden"
              >
                {/* Accent stânga la hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Iconița rotundă */}
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <RiChat1Line size={24} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                      {s.title || "Conversație Nouă"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <RiTimeLine />
                      <span>{new Date(s.createdAt).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Acțiuni (Dreapta) */}
                <div className="flex items-center gap-2 ml-4">
                    {/* Buton Ștergere (Apare la hover) */}
                    <button 
                        onClick={(e) => openDeleteModal(e, s.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                        title="Șterge conversația"
                    >
                        <RiDeleteBinLine size={20} />
                    </button>
                    
                    {/* Săgeată */}
                    <div className="p-2 text-gray-300 group-hover:text-blue-600 transition-colors">
                      <RiArrowRightSLine size={24} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE ȘTERGERE --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop cu blur */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeDeleteModal}
          ></div>

          {/* Fereastra Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fadeInUp">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-4 animate-pulse">
                <RiErrorWarningLine className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Ștergi conversația?
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Istoricul și mesajele vor fi șterse permanent. Ești sigur că vrei să continui?
              </p>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-95"
              >
                Da, Șterge
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-full inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none transition-all active:scale-95"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}