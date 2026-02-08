import React, { useState } from "react";
import { TrendingUp, AlertCircle, Info } from "lucide-react";

const StatCard = ({
  label,
  value,
  unit,
  icon,
  color,
  trend,
  isActive,
  onClick,
  isHistory,
  phases,
  extraInfo,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Warna background area bawah saat aktif (diambil dari props color)
  const bgActiveBase = color.replace(/^text-/, "bg-");

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-white dark:bg-slate-900 rounded-xl shadow-sm border transition-all duration-300 relative flex flex-col h-full min-h-[155px] overflow-hidden ${
        isActive
          ? `border-et-blue ring-4 ring-et-blue/10 scale-[1.01]`
          : `border-slate-100 dark:border-slate-800 hover:border-et-blue/30`
      }`}
    >
      {/* Container Utama Atas (Selalu Warna Standar) */}
      <div className="p-3 flex flex-col flex-grow">
        {/* 1. Header (Icon & Trend) */}
        <div className="flex justify-between items-start h-8 mb-2">
          <div
            className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 ${color}`}
          >
            {React.cloneElement(icon, { size: 18 })}
          </div>

          {trend && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                isHistory
                  ? "bg-slate-100 text-slate-500"
                  : trend.startsWith("+")
                    ? "text-red-500 bg-red-50"
                    : "text-et-green bg-green-50"
              }`}
            >
              {!isHistory && (
                <TrendingUp
                  size={12}
                  className={trend.startsWith("+") ? "" : "rotate-180"}
                />
              )}
              {trend}
            </span>
          )}
        </div>

        {/* 2. Main Content Area (Warna Tetap/Konsisten) */}
        <div className="flex-grow flex flex-col justify-center mb-1">
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter leading-none">
              {value}
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {unit}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-1 opacity-70">
            {label}
          </p>
        </div>
      </div>

      {/* 3. Bottom Section (Hanya bagian ini yang berubah warna saat aktif) */}
      <div
        className={`mt-auto px-3 py-2 border-t transition-all duration-300 min-h-[45px] flex items-center ${
          isActive
            ? `${bgActiveBase} border-transparent`
            : "border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5"
        }`}
      >
        {phases ? (
          <div className="grid grid-cols-3 gap-1 w-full">
            {phases.map((p) => (
              <div key={p.label} className="text-left">
                <p
                  className={`text-[7px] font-bold uppercase leading-none mb-1 ${isActive ? "text-white/70" : "text-slate-400"}`}
                >
                  Fasa {p.label}
                </p>
                <p
                  className={`text-[10px] font-black leading-none ${isActive ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
                >
                  {p.value}
                  <span
                    className={`text-[7px] ml-0.5 font-medium ${isActive ? "text-white/70" : "text-slate-400"}`}
                  >
                    {unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : extraInfo ? (
          <div className="flex items-center justify-between relative w-full">
            <div className="flex flex-col">
              <p
                className={`text-[7px] font-bold uppercase leading-none mb-1 ${isActive ? "text-white/70" : "text-slate-400"}`}
              >
                {extraInfo.label}
              </p>
              <p
                className={`text-xs font-black flex items-center gap-1 leading-none ${isActive ? "text-white" : "text-red-600 dark:text-red-400"}`}
              >
                {extraInfo.value}
                {extraInfo.unit}
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`transition-colors ${isActive ? "text-white/60 hover:text-white" : "text-slate-300 hover:text-et-blue"}`}
                >
                  <Info size={10} />
                </button>
              </p>
            </div>

            {showTooltip && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 text-white text-[9px] p-2 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <p className="font-bold mb-1 text-et-yellow">
                  Ketidakseimbangan Arus
                </p>
                Persentase perbedaan beban antar fasa.
                <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <p
              className={`text-[8px] font-bold uppercase tracking-widest italic ${isActive ? "text-white/60" : "text-slate-300 dark:text-slate-600"}`}
            >
              Sistem Terpantau
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
