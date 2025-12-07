import { motion } from "framer-motion";

export default function FeatureCards() {
  const features = [
    {
      title: "Căutare Inteligentă cu AI",
      desc: "Scrii ce cauți în limbaj natural, sistemul înțelege automat tot.",
      icon: (
        <svg
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: "Anunțuri Agregate",
      desc: "Toate platformele într-un singur loc, actualizate automat.",
      icon: (
        <svg
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: "Direct Proprietar",
      desc: "Filtru dedicat pentru eliminarea agențiilor dacă dorești.",
      icon: (
        <svg
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 12l9-7 9 7v7a2 2 0 01-2 2h-4a2 2 0 01-2-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
        Funcționalități principale
      </h2>

      <div className="max-w-6xl mx-auto grid gap-12 grid-cols-1 md:grid-cols-3 px-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
            className="p-10 bg-gray-50 border border-gray-200 rounded-3xl shadow hover:shadow-xl transition flex flex-col items-center"
          >
            <div className="w-24 h-24 flex items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 shadow-sm mb-6">
              {feature.icon}
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              {feature.title}
            </h3>

            <p className="mt-3 text-gray-600 text-center">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}