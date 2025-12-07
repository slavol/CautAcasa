import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { sendChatMessage, getChatMessages } from "../api/chat";

export default function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatId && !isNaN(Number(chatId))) {
      loadChat();
    }
  }, [chatId]);

  useEffect(() => scrollToBottom(), [messages]);

  const loadChat = async () => {
    try {
      const res = await getChatMessages(chatId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("LOAD CHAT ERROR:", err);
    }
  };

  const sendMessageHandler = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "USER",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage({
        message: userMsg.content,
        chatId: chatId || null,
      });

      if (!chatId && res.data.chatId) {
        window.history.replaceState(null, "", `/chat/${res.data.chatId}`);
      }

      const aiMsg = {
        role: "ASSISTANT",
        content: res.data.replyText,
        listings: res.data.listings || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("SEND ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <UserNavbar />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} />
          ))}

          {loading && (
            <div className="text-center text-gray-500 animate-pulse">
              AI scrie...
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>
      </div>

      <div className="border-t bg-white p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Scrie un mesaj..."
            className="flex-1 p-3 border rounded-full shadow-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
          />
          <button
            onClick={sendMessageHandler}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] p-3 rounded-2xl shadow text-sm whitespace-pre-wrap ${isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
      >
        {message.content}

        {message.listings?.length > 0 && (
          <div className="mt-4 space-y-3">
            {message.listings.map((l) => (
              <a
                key={l.id}
                href={l.link}
                target="_blank"
                rel="noreferrer"
                className="block bg-white border rounded-xl p-3 shadow hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={l.image}
                    alt={l.cleanTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {l.cleanTitle}
                    </p>
                    <p className="text-blue-600 text-sm font-medium">
                      {l.priceEUR
                        ? `${l.priceEUR} EUR`
                        : "Preț necunoscut"}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}