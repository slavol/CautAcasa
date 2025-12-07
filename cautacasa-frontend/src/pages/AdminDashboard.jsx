import { useEffect, useState } from "react";
import { getAdminAiStats } from "../api/admin";
import AdminNavbar from "../components_admin/AdminNavbar";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await getAdminAiStats();
      setStats(res.data);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📊 Panou de Administrare – Statistici AI
        </h1>

        {loading && <LoadingSkeleton />}

        {!loading && stats && (
          <>
            {/* ------------------------ */}
            {/*       TOP CARDS          */}
            {/* ------------------------ */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <StatCard
                title="Total Interogări AI"
                value={stats.totalQueries}
                icon="💬"
                color="bg-blue-600"
              />

              <StatCard
                title="Cele mai căutate camere"
                value={
                  stats.topRooms.length
                    ? `${stats.topRooms[0].rooms} camere`
                    : "N/A"
                }
                icon="🏠"
                color="bg-purple-600"
              />

              <StatCard
                title="Tip proprietate preferat"
                value={
                  stats.topPropertyTypes.length
                    ? stats.topPropertyTypes[0].propertyType
                    : "N/A"
                }
                icon="📦"
                color="bg-green-600"
              />

              <StatCard
                title="Oraș cel mai căutat"
                value={
                  stats.topCities.length ? stats.topCities[0].city : "N/A"
                }
                icon="📍"
                color="bg-red-600"
              />
            </div>

            {/* ------------------------ */}
            {/*        CHARTS            */}
            {/* ------------------------ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <ChartCard title="Distribuție cereri pe camere">
                <PieOrEmpty data={stats.topRooms} nameKey="rooms" />
              </ChartCard>

              <ChartCard title="Cele mai populare orașe">
                <BarOrEmpty data={stats.topCities} dataKey="city" />
              </ChartCard>

              <ChartCard title="Tipuri de proprietate căutate">
                <PieOrEmpty
                  data={stats.topPropertyTypes}
                  nameKey="propertyType"
                />
              </ChartCard>

              <ChartCard title="Preferințe tranzacție (Închiriere / Vânzare)">
                <BarOrEmpty data={stats.topTransactions} dataKey="transaction" />
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ====================================================== */
/* COMPONENTE                                              */
/* ====================================================== */

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function ChartCard({ title, children }) {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

/* PIE CHART – CU LEGENDĂ (corect vizual) */
function PieOrEmpty({ data, nameKey }) {
  if (!data.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey={nameKey}
          innerRadius={40}
          outerRadius={90}
          paddingAngle={4}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* BAR CHART – FĂRĂ LEGENDĂ (ca să nu mai apară text prost) */
function BarOrEmpty({ data, dataKey }) {
  if (!data.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#4F46E5" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
      Nu există date suficiente
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
      ))}
    </div>
  );
}