import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      const res = await registerUser(form);

      // SALVĂM TOKEN-UL primit de la backend!!!
      localStorage.setItem("token", res.data.token);

      // DUPĂ register → mergem direct la verify-phone
      navigate("/verify-phone");
    } catch (err) {
      alert(err.response?.data?.message || "Eroare server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Creează cont
        </h1>

        <div className="flex flex-col gap-5">
          <Input label="Nume" type="text" name="name" value={form.name} onChange={handleChange} />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Telefon" type="text" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Parolă" type="password" name="password" value={form.password} onChange={handleChange} />
        </div>

        <Button onClick={handleRegister} className="w-full mt-6">
          Creează cont
        </Button>

        <p className="text-center text-gray-600 mt-4">
          Ai deja cont?{" "}
          <a href="/login" className="text-blue-600 font-semibold">Autentifică-te</a>
        </p>
      </motion.div>
    </div>
  );
}