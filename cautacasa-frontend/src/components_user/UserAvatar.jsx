export default function UserAvatar({ name }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow">
      {initial}
    </div>
  );
}