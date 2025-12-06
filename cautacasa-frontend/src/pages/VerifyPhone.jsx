// src/pages/VerifyPhone.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { verifyPhone } from "../api/auth";
import { motion } from "framer-motion";

export default function VerifyPhone() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await verifyPhone({ otp });
      navigate("/listings");
    } catch (err) {
      alert(err.response?.data?.message || "Cod invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Verifică numărul de telefon
        </h2>

        <Input
          label="Cod OTP"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button onClick={handleVerify} className="w-full mt-6" disabled={loading}>
          Confirmă
        </Button>
      </motion.div>
    </div>
  );
}