import { RiErrorWarningLine } from "react-icons/ri";

export default function AdminDeleteModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      
      {/* Backdrop cu Blur */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      ></div>

      {/* Fereastra Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fadeInUp">
        
        <div className="p-6 text-center">
          {/* Iconiță Animată */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-5 animate-pulse">
            <RiErrorWarningLine className="h-8 w-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title || "Ești sigur?"}
          </h3>
          
          <p className="text-sm text-gray-500 leading-relaxed">
            {message || "Această acțiune este ireversibilă. Datele vor fi șterse permanent din baza de date."}
          </p>
        </div>

        {/* Butoane */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isDeleting ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Se șterge...
                </span>
            ) : "Da, Șterge"}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none transition-all active:scale-95"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}