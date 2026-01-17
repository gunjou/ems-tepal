import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import { Zap, ShieldCheck, Activity, AlertOctagon, Info } from "lucide-react";

const PowerQuality = ({ activeTab }) => {
  // 1. Logika Data Real-time
  const [realtimeData, setRealtimeData] = useState(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const time = new Date();
      time.setSeconds(time.getSeconds() - (20 - i) * 3);
      return {
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        voltage: parseFloat((219 + Math.random() * 4).toFixed(1)),
        pf: parseFloat((0.96 + Math.random() * 0.03).toFixed(2)),
        frequency: parseFloat((49.9 + Math.random() * 0.2).toFixed(2)),
      };
    });
  });

  // 2. Data Riwayat
  const historyData = useMemo(() => {
    const generateHistory = (len, vMin, vMax, fMin, fMax) =>
      Array.from({ length: len }, (_, i) => ({
        time: `${i}:00`,
        voltage: parseFloat((Math.random() * (vMax - vMin) + vMin).toFixed(1)),
        pf: parseFloat((0.94 + Math.random() * 0.05).toFixed(2)),
        frequency: parseFloat(
          (Math.random() * (fMax - fMin) + fMin).toFixed(2),
        ),
      }));

    return {
      Harian: generateHistory(24, 218, 224, 49.95, 50.05),
      Bulanan: Array.from({ length: 30 }, (_, i) => ({
        time: `Tgl ${i + 1}`,
        voltage: 220.2,
        pf: parseFloat((0.92 + Math.random() * 0.06).toFixed(2)),
        frequency: 50.0,
      })),
      Tahunan: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ].map((m) => ({
        time: m,
        voltage: 220.5,
        pf: 0.97,
        frequency: 50.0,
      })),
    };
  }, []);

  // 3. Interval Update
  useEffect(() => {
    if (activeTab === "Realtime") {
      const interval = setInterval(() => {
        setRealtimeData((prev) => {
          const newData = [...prev.slice(1)];
          newData.push({
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            voltage: parseFloat((219 + Math.random() * 4).toFixed(1)),
            pf: parseFloat((0.96 + Math.random() * 0.03).toFixed(2)),
            frequency: parseFloat((49.9 + Math.random() * 0.2).toFixed(2)),
          });
          return newData;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const activeData =
    activeTab === "Realtime" ? realtimeData : historyData[activeTab];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* KARTU METRIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PQCard
          title="Tegangan"
          value={activeData[activeData.length - 1]?.voltage}
          unit="V"
          icon={<Zap />}
          color="text-et-yellow"
          sub="Stabilisasi 220V"
        />
        <PQCard
          title="Faktor Daya"
          value={activeData[activeData.length - 1]?.pf}
          unit="cos φ"
          icon={<ShieldCheck />}
          color="text-et-blue"
          sub="Efisiensi Sistem"
        />
        <PQCard
          title="Frekuensi"
          value={activeData[activeData.length - 1]?.frequency}
          unit="Hz"
          icon={<Activity />}
          color="text-et-green"
          sub="Sinkronisasi Turbin"
        />
        <PQCard
          title="Anomali"
          value={activeTab === "Realtime" ? "0" : "1"}
          unit="Kejadian"
          icon={<AlertOctagon />}
          color="text-red-500"
          sub={`Log ${activeTab}`}
        />
      </div>

      {/* AREA DIAGRAM UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION KIRI: TEGANGAN (Tampil Sendiri - Lebih Luas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[370px]">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">
              Pemantauan Tegangan
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Stabilitas Voltase Fase Tunggal ({activeTab})
            </p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData}>
                <defs>
                  <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBC02D" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FBC02D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.05}
                />
                <XAxis
                  dataKey="time"
                  hide={activeTab === "Realtime"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[200, 240]}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip />
                <ReferenceLine
                  y={220}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  label={{
                    value: "220V",
                    position: "right",
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="voltage"
                  stroke="#FBC02D"
                  strokeWidth={3}
                  fill="url(#colorVoltage)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION KANAN: STACK FAKTOR DAYA & FREKUENSI */}
        <div className="flex flex-col gap-6 h-[370px]">
          {/* FAKTOR DAYA (Atas - Setengah Tinggi) */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-4">
              Tren Faktor Daya
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.05}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    domain={[0.8, 1]}
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip />
                  <ReferenceLine
                    y={0.85}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="pf"
                    stroke="#2B5797"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <ShieldCheck size={12} className="text-et-blue" />
              <span>Kualitas PF stabil di atas ambang batas 0.85</span>
            </div>
          </div>

          {/* FREKUENSI (Bawah - Setengah Tinggi) */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-4">
              Stabilitas Frekuensi
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeData}>
                  <defs>
                    <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#438241" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#438241" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.05}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    domain={[48, 52]}
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip />
                  <ReferenceLine
                    y={50}
                    stroke="#438241"
                    strokeDasharray="3 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="frequency"
                    stroke="#438241"
                    strokeWidth={2}
                    fill="url(#colorFreq)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <Info size={12} className="text-et-green" />
              <span>Sinkronisasi turbin saat ini: 50.0 Hz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Kecil untuk Kartu Statistik
const PQCard = ({ title, value, unit, icon, color, sub }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${color}`}
      >
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1">
        <h4 className="text-xl font-black text-slate-800 dark:text-white tabular-nums">
          {value || "0.0"}
        </h4>
        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase opacity-70">
        {sub}
      </p>
    </div>
  </div>
);

export default PowerQuality;
