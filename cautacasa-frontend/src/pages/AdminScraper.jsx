import { useState, useEffect, useRef } from "react";
import { startScraper, stopScraper, getScraperStatus } from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";
// 1. IMPORTĂM MODALUL NOU
import AdminStopModal from "../components_admin/AdminStopModal"; 
import { 
  RiRocketLine, 
  RiLoader4Line, 
  RiCheckDoubleLine, 
  RiTerminalBoxLine, 
  RiCpuLine,
  RiDownloadCloud2Line,
  RiRobot2Line,
  RiStopCircleLine
} from "react-icons/ri";

export default function AdminScraper() {
  const [status, setStatus] = useState({
    running: false,
    stage: "IDLE",
    progress: 0,
    total: 0,
    current: 0,
    logs: []
  });
  
  const [loadingBtn, setLoadingBtn] = useState(false);
  // 2. STARE PENTRU MODAL
  const [showStopModal, setShowStopModal] = useState(false);
  
  const logsEndRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await getScraperStatus();
      if (res.data) {
        setStatus(prev => ({
            ...res.data,
            logs: res.data.logs || []
        }));
      }
    } catch (err) {
      console.error("Status fetch error", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [status.logs]);

  // --- START ---
  const handleStart = async () => {
    setLoadingBtn(true);
    try {
      await startScraper();
      setStatus(prev => ({ 
          ...prev, 
          running: true, 
          logs: ["Command sent: START...", ...prev.logs] 
      }));
    } catch (err) {
      alert("Nu s-a putut porni scraperul. Verifică consola.");
    } finally {
      setLoadingBtn(false);
    }
  };

  // --- 3. DECLANȘARE MODAL STOP ---
  const handleStopClick = () => {
    setShowStopModal(true);
  };

  // --- 4. EXECUTARE STOP (După confirmare în modal) ---
  const executeStop = async () => {
    setLoadingBtn(true); // Folosim același loading state pentru butonul din modal
    try {
      await stopScraper();
      setStatus(prev => ({ 
          ...prev, 
          running: false,
          stage: "STOPPED",
          logs: ["Command sent: STOP...", ...prev.logs] 
      }));
      setShowStopModal(false); // Închidem modalul după succes
    } catch (err) {
      alert("Eroare la oprire.");
    } finally {
      setLoadingBtn(false);
    }
  };

  const getStageInfo = (stage) => {
    switch(stage) {
      case "SCRAPER": 
        return { label: "Faza 1: Colectare Date", icon: <RiDownloadCloud2Line />, color: "text-blue-600", bg: "bg-blue-600" };
      case "AI_START": 
        return { label: "Faza 2: Inițializare AI", icon: <RiCpuLine />, color: "text-purple-500", bg: "bg-purple-500" };
      case "AI_PROCESSING": 
        return { label: "Faza 2: Procesare Neurală", icon: <RiRobot2Line />, color: "text-purple-600", bg: "bg-purple-600" };
      case "COMPLETED": 
        return { label: "Finalizat cu Succes", icon: <RiCheckDoubleLine />, color: "text-green-600", bg: "bg-green-600" };
      case "STOPPED": 
        return { label: "Oprit de Utilizator", icon: <RiStopCircleLine />, color: "text-red-500", bg: "bg-red-500" };
      case "ERROR": 
        return { label: "Eroare Critică", icon: <RiTerminalBoxLine />, color: "text-red-600", bg: "bg-red-600" };
      default: 
        return { label: "În așteptare", icon: <RiCpuLine />, color: "text-gray-400", bg: "bg-gray-400" };
    }
  };

  const stageInfo = getStageInfo(status.stage);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <RiCpuLine className="text-blue-600" />
              Panou Control Scraper & AI
            </h1>
            <p className="text-gray-500 mt-2">
              Pipeline automatizat: OLX Scraper → Procesare Llama/Qwen → Bază de Date.
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* Buton STOP - Deschide Modalul */}
            {status.running && (
                <button
                onClick={handleStopClick}
                disabled={loadingBtn}
                className="px-6 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center gap-2 bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                >
                <RiStopCircleLine size={24} /> STOP
                </button>
            )}

            {/* Buton START */}
            <button
                onClick={handleStart}
                disabled={status.running || loadingBtn}
                className={`px-8 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95
                ${status.running 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30"
                }`}
            >
                {status.running ? (
                <>
                    <RiLoader4Line className="animate-spin" /> Sistemul Rulează...
                </>
                ) : (
                <>
                    <RiRocketLine /> Pornește Pipeline
                </>
                )}
            </button>
          </div>
        </div>

        {/* GRID DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* CARD 1: STATUS CURENT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progres Operațiune</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 ${stageInfo.color} flex items-center gap-2`}>
                        {stageInfo.icon} {stageInfo.label}
                    </span>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                    {/* STÂNGA: Procentul */}
                    <span className="text-blue-600 font-bold text-5xl tracking-tighter">
                        {status.progress}%
                    </span>

                    {/* DREAPTA: Contorul */}
                    <div className="text-right">
                        <span className="text-3xl font-extrabold text-gray-800">{status.current}</span>
                        <span className="text-gray-400 text-xl font-medium"> / {status.total}</span>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">itemi procesați</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-2">
                    <div 
                        className={`h-full transition-all duration-700 ease-out ${stageInfo.bg} ${status.running ? 'animate-pulse' : ''}`}
                        style={{ width: `${status.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* CARD 2: INDICATOR VIZUAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                 {status.stage === "COMPLETED" ? (
                     <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm">
                            <RiCheckDoubleLine size={40} />
                        </div>
                        <h4 className="text-green-700 font-bold text-lg">Proces Finalizat!</h4>
                     </>
                 ) : status.stage === "STOPPED" ? (
                    <>
                       <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-sm">
                           <RiStopCircleLine size={40} />
                       </div>
                       <h4 className="text-red-700 font-bold text-lg">Proces Oprit</h4>
                       <p className="text-xs text-gray-400 mt-1">Intervenție manuală</p>
                    </>
                ) : status.running ? (
                     <>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200 ${stageInfo.bg} animate-bounce-slow`}>
                            <div className="animate-spin">{stageInfo.icon}</div>
                        </div>
                        <h4 className="text-gray-800 font-bold">{stageInfo.label}</h4>
                        <p className="text-xs text-gray-400 mt-1">Nu închide pagina...</p>
                     </>
                 ) : (
                     <div className="text-gray-300 flex flex-col items-center">
                        <RiRocketLine size={48} className="mb-2 opacity-50"/>
                        <p>Sistem în așteptare</p>
                     </div>
                 )}
            </div>
        </div>

        {/* TERMINAL LOGS */}
        <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800 ring-4 ring-gray-100">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                <RiTerminalBoxLine className="text-gray-400" />
                <span className="text-xs font-mono text-gray-300 tracking-wider">LIVE SYSTEM LOGS</span>
                {status.running && <span className="flex h-2 w-2 relative ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>}
            </div>
            
            <div className="p-5 h-80 overflow-y-auto font-mono text-sm space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {status.logs && status.logs.length > 0 ? (
                    status.logs.map((log, index) => (
                        <div key={index} className="flex gap-3 text-gray-300 border-l-2 border-transparent hover:border-blue-500 pl-2 transition-colors">
                            <span className="text-gray-600 select-none">
                                {log.match(/^\[(.*?)\]/) ? log.match(/^\[(.*?)\]/)[0] : ">"}
                            </span>
                            <span className={
                                log.includes("ERROR") || log.includes("❌") ? "text-red-400 font-bold" : 
                                log.includes("✅") ? "text-green-400 font-medium" : 
                                log.includes("WARN") ? "text-yellow-400" :
                                log.includes("STOP") ? "text-orange-400" :
                                "text-gray-300"
                            }>
                                {log.replace(/^\[(.*?)\]/, "").trim()}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                        <RiTerminalBoxLine size={48} className="mb-2" />
                        <p>Waiting for pipeline output...</p>
                    </div>
                )}
                <div ref={logsEndRef} />
            </div>
        </div>

      </div>

      {/* 5. AICI INTRODUCEM MODALUL DE STOP */}
      <AdminStopModal 
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirm={executeStop}
        isStopping={loadingBtn}
      />

    </div>
  );
}