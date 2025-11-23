export default function CTAButtons() {
  return (
    <section className="py-24 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold text-gray-900">
        Continuă pentru a accesa aplicația
      </h2>

      <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
        Creează un cont sau autentifică-te pentru a utiliza toate funcționalitățile.
      </p>

      <div className="flex justify-center gap-8 mt-12">
        <a href="/login" className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-lg font-semibold hover:bg-black transition">
          Login
        </a>

        <a href="/register" className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 transition">
          Register
        </a>
      </div>
    </section>
  );
}