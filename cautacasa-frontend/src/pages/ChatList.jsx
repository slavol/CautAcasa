import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components_user/NavbarUser";
import { getChatSessions } from "../api/chat";

export default function ChatList() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await getChatSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("ERROR LOADING SESSIONS:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Conversațiile mele AI</h1>

        {sessions.length === 0 ? (
          <p className="text-gray-500">Nu ai conversații create încă.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/chat/${s.id}`)}
                className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-blue-600 font-bold text-sm">
                  ➜
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}