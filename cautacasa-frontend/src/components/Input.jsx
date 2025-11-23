export default function Input({ label, name, type, value, onChange }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-gray-700 font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
      />
    </div>
  );
}