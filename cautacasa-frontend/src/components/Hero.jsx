import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative py-10 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white text-center overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-6xl font-extrabold tracking-tight"
      >
        CautAcasă
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-xl opacity-90 max-w-2xl mx-auto"
      >
        Găsește locuința ideală cu ajutorul AI — rapid, simplu și inteligent.
      </motion.p>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/20 rounded-full blur-[150px] opacity-20"></div>
    </section>
  );
}