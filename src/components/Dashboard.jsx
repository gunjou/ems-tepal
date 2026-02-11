import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Clock } from "lucide-react";

// Import Halaman Menu
import Overview from "../views/Overview";
import EnergyAnalysis from "../views/EnergyAnalysis";
// import CostForecast from "../views/CostForecast";
// import Sustainability from "../views/Sustainability";
import PowerQuality from "../views/PowerQuality";
import Settings from "../views/Settings";

const Dashboard = ({ isDarkMode, toggleDarkMode, onLogout }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Realtime");

  // Inisialisasi filterValue sesuai dengan tab default
  const [filterValue, setFilterValue] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Daftar Nama Bulan untuk Label
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Reset filter saat ganti tab agar sinkron dengan waktu sekarang
  useEffect(() => {
    const now = new Date();
    if (activeTab === "Harian") {
      setFilterValue(now.toISOString().split("T")[0]);
    } else if (activeTab === "Bulanan") {
      setFilterValue(now.getMonth() + 1);
    } else if (activeTab === "Tahunan") {
      setFilterValue(now.getFullYear());
    }
  }, [activeTab]);

  const getTitle = () => {
    if (activeTab === "Realtime") return "Monitoring Real-time";

    try {
      if (activeTab === "Harian") {
        const d = new Date(filterValue);
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }

      if (activeTab === "Bulanan") {
        // filterValue adalah angka 1-12
        return `${months[filterValue - 1]} ${new Date().getFullYear()}`;
      }

      if (activeTab === "Tahunan") {
        return `Tahun ${filterValue}`;
      }
    } catch (e) {
      return "Monitoring Laporan";
    }
  };

  // Fungsi Render Filter Dinamis
  const renderDynamicFilter = () => {
    if (activeTab === "Realtime") return null;

    const baseClass =
      "bg-transparent text-xs font-bold text-et-blue dark:text-et-yellow outline-none px-2 cursor-pointer";

    return (
      <div className="flex items-center border-r border-slate-200 dark:border-slate-700 mr-1 pr-1">
        {activeTab === "Harian" && (
          <input
            type="date"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className={baseClass}
          />
        )}

        {activeTab === "Bulanan" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(parseInt(e.target.value))}
            className={baseClass}
          >
            {months.map((month, index) => (
              <option
                key={index}
                value={index + 1}
                className="dark:bg-slate-900 text-slate-800 dark:text-white"
              >
                {month}
              </option>
            ))}
          </select>
        )}

        {activeTab === "Tahunan" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(parseInt(e.target.value))}
            className={baseClass}
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i,
            ).map((year) => (
              <option
                key={year}
                value={year}
                className="dark:bg-slate-900 text-slate-800 dark:text-white"
              >
                {year}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  // Mendapatkan activeMenu dari URL Path
  // Jika path adalah "/dashboard", maka menu-nya "overview"
  const currentPath = location.pathname.split("/").filter(Boolean).pop();
  const activeMenu = currentPath === "dashboard" ? "overview" : currentPath;

  // Logic Rule Tab: Sinkronkan tab saat pindah menu via URL
  useEffect(() => {
    // RULE 1: Jika masuk ke menu yang mendukung Realtime, paksa aktifkan tab Realtime
    if (
      activeMenu === "overview" ||
      activeMenu === "tepal" ||
      activeMenu === "pusu" ||
      activeMenu === "power"
    ) {
      setActiveTab("Realtime");
    }
    // RULE 2: Jika masuk ke menu yang TIDAK mendukung Realtime (Energy, Cost, dll)
    // dan saat itu tab sedang di Realtime, paksa pindah ke Harian
    else if (activeTab === "Realtime") {
      setActiveTab("Harian");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]); // Hanya trigger saat menu berubah

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <Navbar
          title={activeMenu}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={onLogout}
        />

        <main className="p-8 space-y-4">
          {activeMenu !== "settings" && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-500">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {getTitle()}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                  <Clock size={14} /> Terakhir diperbarui:{" "}
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>

              {/* Kelompok Filter yang Disatukan */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {/* Selector Tanggal/Bulan/Tahun di sebelah kiri tombol tab */}
                {renderDynamicFilter()}

                <div className="flex gap-1">
                  {["Realtime", "Harian", "Bulanan", "Tahunan"]
                    .filter(
                      (tab) =>
                        activeMenu === "overview" ||
                        activeMenu === "tepal" ||
                        activeMenu === "pusu" ||
                        activeMenu === "power" ||
                        tab !== "Realtime",
                    )
                    .map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                          activeTab === tab
                            ? "bg-et-blue text-white shadow-md"
                            : "text-slate-500 dark:text-slate-400 hover:text-et-blue"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ROUTING KONTEN DINAMIS */}
          <div className="mt-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Overview
                    activeTab={activeTab}
                    subLocation="total"
                    filterValue={filterValue}
                  />
                }
              />
              <Route
                path="/overview/tepal"
                element={
                  <Overview
                    activeTab={activeTab}
                    subLocation="tepal"
                    filterValue={filterValue}
                  />
                }
              />
              <Route
                path="/overview/pusu"
                element={
                  <Overview
                    activeTab={activeTab}
                    subLocation="pusu"
                    filterValue={filterValue}
                  />
                }
              />
              <Route
                path="energy"
                element={
                  <EnergyAnalysis
                    activeTab={activeTab}
                    filterValue={filterValue}
                  />
                }
              />
              {/* <Route
                path="cost"
                element={<CostForecast activeTab={activeTab} />}
              /> */}
              {/* <Route
                path="sustainability"
                element={<Sustainability activeTab={activeTab} />}
              /> */}
              <Route
                path="power"
                element={
                  <PowerQuality
                    activeTab={activeTab}
                    filterValue={filterValue}
                  />
                }
              />
              <Route
                path="settings"
                element={
                  <Settings activeTab={activeTab} filterValue={filterValue} />
                }
              />
              {/* Fallback jika path tidak dikenal */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
