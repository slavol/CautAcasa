import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RiSearch2Line, RiSpeedLine, RiBrainLine, RiCommunityLine } from "react-icons/ri";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans relative">
      <Navbar />

      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80" 
            alt="Modern home interior" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center pt-20">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg animate-fadeInDown">
            Găsește-ți locuința ideală.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Simplu, cu ajutorul AI.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 drop-shadow-md animate-fadeIn animate-delay-200">
            Uită de filtrele complicate. Discută cu asistentul nostru inteligent exact așa cum ai vorbi cu un agent imobiliar și primești cele mai relevante oferte din piață.
          </p>

          <div className="animate-fadeInUp animate-delay-300">
            <button
              onClick={() => navigate('/register')}
              className="group relative inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-10 py-5 rounded-full transition-all duration-300 shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1"
            >
              <RiSearch2Line size={24} />
              <span>Începe Căutarea Inteligentă</span>
              <RiArrowRightLine size={20} className="group-hover:translate-x-1 transition-transform" />
              
              <div className="absolute inset-0 h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white/90 animate-fadeInUp animate-delay-500">
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
              <RiSpeedLine size={32} className="text-blue-400" />
              <span className="font-semibold">Rezultate Rapide</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
              <RiBrainLine size={32} className="text-indigo-400" />
              <span className="font-semibold">Înțelegere Naturală</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
              <RiCommunityLine size={32} className="text-purple-400" />
              <span className="font-semibold">Toată Piața</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

import { RiArrowRightLine } from "react-icons/ri";