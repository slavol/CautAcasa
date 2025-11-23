export default function Button({ children, onClick, className = "", type="button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg ${className}`}
    >
      {children}
    </button>
  );
}