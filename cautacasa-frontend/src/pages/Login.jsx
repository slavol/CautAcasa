import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();               // 🔥 FIX: folosim hook-ul direct
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
  try {
    const res = await loginUser(form);

    if (!res.data?.user || !res.data?.token) {
      alert("Răspuns invalid de la server.");
      return;
    }

    // salvăm user + token în context
    login(res.data.user, res.data.token);

    // 👇 Verificăm câmpul trimis de backend
    if (!res.data.user.phoneVerified) {
      // Dacă telefonul NU e verificat → mergem la pagina de verificare
      navigate("/verify-phone");
      return;
    }

    // Dacă telefonul este verificat → mergem la listings
    navigate("/listings");
  } catch (err) {
    alert(err.response?.data?.message || "Eroare de autentificare.");
  }
};

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Autentificare
        </h2>

        <div className="flex flex-col gap-5">
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Parolă"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <Button onClick={handleLogin} className="w-full mt-6">
          Autentificare
        </Button>

        <p className="text-center text-gray-600 mt-4">
          Nu ai cont?{" "}
          <a href="/register" className="text-blue-600 font-semibold">
            Creează cont
          </a>
        </p>
      </motion.div>
    </div>
  );
}