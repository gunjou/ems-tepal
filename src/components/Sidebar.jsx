import React from "react";
import { Link, useLocation } from "react-router-dom";
import MyLogo from "../images/logo_energitimur.png";
import {
  LayoutDashboard,
  Activity,
  Banknote,
  Leaf,
  Settings,
  History,
  MapPin,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menus = [
    {
      id: "power",
      name: "Kualitas Daya", // Power Quality
      icon: <History size={20} />,
      path: "/dashboard/power",
    },
    {
      id: "energy",
      name: "Analisis Energi", // Energy Analysis
      icon: <Activity size={20} />,
      path: "/dashboard/energy",
    },
    // {
    //   id: "cost",
    //   name: "Biaya & Prediksi", // Cost & Forecast
    //   icon: <Banknote size={20} />,
    //   path: "/dashboard/cost",
    // },
    // {
    //   id: "sustainability",
    //   name: "Keberlanjutan", // Sustainability
    //   icon: <Leaf size={20} />,
    //   path: "/dashboard/sustainability",
    // },
    {
      id: "settings",
      name: "Pengaturan", // Settings
      icon: <Settings size={20} />,
      path: "/dashboard/settings",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-et-blue dark:bg-slate-900 text-white p-6 shadow-xl z-30 flex flex-col">
      {/* Area Logo Brand */}
      <div className="flex items-center gap-3 mb-10 px-1">
        <div className="relative shrink-0">
          <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shadow-md">
            <img
              src={MyLogo}
              alt="Logo"
              className="w-full h-full object-cover scale-125"
            />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="font-black text-[14px] text-white leading-tight uppercase tracking-tighter">
            EMS - <span className="text-et-yellow">TEPAL (SUMBAWA)</span>
          </h1>
          <p className="text-[9px] text-blue-200/60 font-bold tracking-widest uppercase truncate">
            Energi Timur Nusa Power
          </p>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* BAGIAN: RINGKASAN (Overview) */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentPath === "/dashboard"
                ? "bg-white text-et-blue shadow-lg"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} />
            <span
              className={`text-sm tracking-wide ${currentPath === "/dashboard" ? "font-black" : "font-bold"}`}
            >
              OVERVIEW
            </span>
          </Link>

          {/* Sub Menu - Wilayah Dusun */}
          <div className="mt-1 space-y-1">
            <Link
              to="/dashboard/overview/tepal"
              className={`flex items-center gap-3 ml-6 px-4 py-2.5 rounded-xl transition-all ${
                currentPath === "/dashboard/overview/tepal"
                  ? "bg-white/20 text-white border-l-4 border-et-yellow"
                  : "text-blue-100/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Dusun Tepal
              </span>
            </Link>

            <Link
              to="/dashboard/overview/pusu"
              className={`flex items-center gap-3 ml-6 px-4 py-2.5 rounded-xl transition-all ${
                currentPath === "/dashboard/overview/pusu"
                  ? "bg-white/20 text-white border-l-4 border-et-yellow"
                  : "text-blue-100/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Dusun Pusu
              </span>
            </Link>
          </div>
        </div>

        {/* Pemisah (Separator) */}
        <div className="py-2 flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="px-3 text-[10px] font-black text-white/20 tracking-[0.2em]">
            ANALITIK
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* MENU UTAMA */}
        {menus.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentPath === item.path
                ? "bg-white text-et-blue shadow-lg translate-x-1"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={
                currentPath === item.path ? "text-et-blue" : "opacity-70"
              }
            >
              {item.icon}
            </span>
            <span
              className={`text-sm tracking-wide ${
                currentPath === item.path ? "font-black" : "font-semibold"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-200/50 uppercase">
            STATUS STASIUN
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-et-green uppercase">
              Terhubung
            </span>
            <div className="w-2 h-2 bg-et-green rounded-full animate-pulse shadow-[0_0_8px_rgba(67,130,65,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
