import React, { useState } from "react";
import { TrendingUp, Info } from "lucide-react";

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
  // eslint-disable-next-line no-unused-vars
  const [showTooltip, setShowTooltip] = useState(false);

  // Deteksi jika warna adalah kuning untuk penyesuaian kontras teks
  const isYellow = color.includes("yellow");
  const bgActiveBase = color.replace(/^text-/, "bg-");

  // Teks utama saat aktif: Jika kuning gunakan slate-900, selain itu putih
  const activeTextClass = isYellow ? "text-slate-900" : "text-white";
  // Teks sekunder/label saat aktif: Jika kuning gunakan slate-900/70, selain itu putih/70
  const activeSubTextClass = isYellow ? "text-slate-900/70" : "text-white/70";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer bg-white dark:bg-slate-900 rounded-xl shadow-sm border transition-all duration-300 relative flex flex-col h-full min-h-[155px] overflow-hidden ${
        isActive
          ? `border-et-blue ring-4 ring-et-blue/10 scale-[1.01]`
          : `border-slate-100 dark:border-slate-800 hover:border-et-blue/30`
      }`}
    >
      {/* 1. Upper Section tetap sama */}
      <div className="p-3 flex flex-col flex-grow">
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

      {/* 2. Bottom Section dengan Kontras yang Diperbaiki */}
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
                  className={`text-[7px] font-bold uppercase leading-none mb-1 ${isActive ? activeSubTextClass : "text-slate-400"}`}
                >
                  Fasa {p.label}
                </p>
                <p
                  className={`text-[10px] font-black leading-none ${isActive ? activeTextClass : "text-slate-700 dark:text-slate-200"}`}
                >
                  {p.value}
                  <span
                    className={`text-[7px] ml-0.5 font-medium ${isActive ? activeSubTextClass : "text-slate-400"}`}
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
                className={`text-[7px] font-bold uppercase leading-none mb-1 ${isActive ? activeSubTextClass : "text-slate-400"}`}
              >
                {extraInfo.label}
              </p>
              <p
                className={`text-xs font-black flex items-center gap-1 leading-none ${isActive ? activeTextClass : "text-red-600 dark:text-red-400"}`}
              >
                {extraInfo.value}
                {extraInfo.unit}
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`transition-colors ${isActive ? (isYellow ? "text-slate-900/40 hover:text-slate-900" : "text-white/60 hover:text-white") : "text-slate-300 hover:text-et-blue"}`}
                >
                  <Info size={10} />
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <p
              className={`text-[8px] font-bold uppercase tracking-widest italic ${isActive ? activeSubTextClass : "text-slate-300 dark:text-slate-600"}`}
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
