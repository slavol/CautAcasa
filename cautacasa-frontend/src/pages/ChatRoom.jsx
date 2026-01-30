import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { sendChatMessage, getChatMessages } from "../api/chat";
import { RiRobot2Line, RiSendPlaneFill, RiMapPinLine, RiHomeSmileLine } from "react-icons/ri";

export default function ChatRoom() {
  const { chatId } = useParams(); 
  const navigate = useNavigate();
  
  // STARE LOCALĂ PENTRU ID
  // Dacă suntem pe 'new' sau 'list', starea e null. Altfel e ID-ul din URL.
  const [activeId, setActiveId] = useState(
    (chatId && chatId !== "new" && chatId !== "list") ? chatId : null
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Scroll automat la ultimul mesaj
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Sincronizare URL -> Stare Locală
  useEffect(() => {
    // Dacă URL-ul se schimbă (ex: din 'new' devine '55'), actualizăm starea și încărcăm chatul
    if (chatId && chatId !== "new" && chatId !== "list" && !isNaN(Number(chatId))) {
      setActiveId(chatId);
      loadChat(chatId);
    } else if (chatId === "new") {
      // Dacă suntem pe chat nou, ne asigurăm că e gol
      setActiveId(null);
      setMessages([]);
    }
  }, [chatId]);

  const loadChat = async (id) => {
    try {
      const res = await getChatMessages(id);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("LOAD CHAT ERROR:", err);
    }
  };

  const sendMessageHandler = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    // 1. UI Optimistic
    const userMsg = { role: "USER", content: userText, listings: [] };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 2. Determinăm ce ID trimitem
      // Folosim 'activeId' care este starea locală (cea mai rapidă sursă de adevăr)
      const idToSend = activeId; 

      console.log(`📤 Trimit mesaj... ID Sesiune: ${idToSend || "SESIUNE NOUĂ"}`);

      const res = await sendChatMessage({
        message: userText,
        chatId: idToSend,
      });

      // 3. FIX CRITIC: MEMORIE INSTANTANEE
      // Dacă nu aveam ID (eram pe chat nou), dar serverul a creat unul:
      if (!idToSend && res.data.chatId) {
        console.log("✅ Sesiune creată! ID Nou:", res.data.chatId);
        
        // A. Setăm starea locală INSTANT (pentru următorul mesaj, ca să nu mai fie null)
        setActiveId(res.data.chatId);
        
        // B. Schimbăm URL-ul (vizual)
        navigate(`/chat/${res.data.chatId}`, { replace: true });
      }

      // 4. Adăugăm răspunsul AI
      const aiMsg = {
        role: "ASSISTANT",
        content: res.data.replyText,
        listings: res.data.listings || [],
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error("SEND ERROR:", err);
      setMessages((prev) => [...prev, { role: "ASSISTANT", content: "⚠️ Eroare conexiune.", listings: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <UserNavbar />

      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
                <RiRobot2Line size={64} />
                <p className="mt-4 text-lg">Scrie un mesaj pentru a începe căutarea...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm italic ml-4 animate-pulse">
               <RiRobot2Line /> AI scrie...
            </div>
          )}
          <div ref={scrollRef}></div>
        </div>
      </div>

      <div className="bg-white border-t p-4 sticky bottom-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Scrie aici (ex: Apartament 2 camere București...)"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 placeholder-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
            disabled={loading}
          />
          <button
            onClick={sendMessageHandler}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            <RiSendPlaneFill size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componenta Bubble (Carduri)
function ChatBubble({ message }) {
  const isUser = message.role === "USER";
  const isAi = !isUser;

  return (
    <div className={`flex w-full flex-col ${isAi ? "items-start" : "items-end"}`}>
      
      <div
        className={`relative px-6 py-4 max-w-[90%] md:max-w-[80%] text-[15px] shadow-sm leading-relaxed whitespace-pre-wrap rounded-2xl
          ${isUser
            ? "bg-blue-600 text-white rounded-tr-none shadow-md"
            : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
          }`}
      >
        {message.content}
      </div>

      {isAi && message.listings?.length > 0 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl animate-fadeIn">
          {message.listings.map((l, idx) => (
            <a
              key={idx}
              href={l.link || l.Listing?.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src={l.image || l.Listing?.image || "https://placehold.co/600x400?text=Fara+Imagine"}
                  alt={l.cleanTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                  {l.priceEUR || l.Listing?.priceEUR || "?"} €
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                   {l.transaction === 'RENT' ? 'De Închiriat' : 'De Vânzare'}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {l.cleanTitle || l.Listing?.cleanTitle || "Titlu indisponibil"}
                </h4>
                <div className="flex items-center text-gray-500 text-xs mb-3 gap-3">
                  <span className="flex items-center gap-1"><RiMapPinLine /> {l.city}</span>
                  <span className="flex items-center gap-1"><RiHomeSmileLine /> {l.rooms} camere</span>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs font-medium text-gray-600">
                    <span className="text-blue-600 flex items-center gap-1 group-hover:underline cursor-pointer">
                        Vezi detalii →
                    </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}