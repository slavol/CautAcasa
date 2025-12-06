import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { verifyPhone } from "../api/auth";
import { motion } from "framer-motion";

export default function VerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = new URLSearchParams(location.search).get("userId");

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      await verifyPhone({ otp });
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Cod invalid.");
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

        <Button onClick={handleVerify} className="w-full mt-6">
          Confirmă
        </Button>
      </motion.div>
    </div>
  );
}