import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Zap, Activity, TrendingUp, Waves, AlertTriangle } from "lucide-react";
import RealtimeLoadChart from "../components/charts/RealtimeLoadChart";
import StatCard from "../components/charts/StatCard";

const Overview = ({ activeTab, subLocation = "total" }) => {
  // 1. Ubah default activeMetric ke 'power' sesuai database
  const [activeMetric, setActiveMetric] = useState("power");

  // Logika Deteksi Satuan Dinamis
  const isRealtime = activeTab === "Realtime" || activeTab === "Waktu Nyata";
  const dynamicUnit = isRealtime ? "kW" : "kWh";

  const loadDistributionData = [
    { name: "Dusun Tepal", value: 75, color: "#F59E0B" },
    { name: "Dusun Pusu", value: 25, color: "#10B981" },
  ];

  // Logic Multiplier berdasarkan lokasi
  const multiplier = useMemo(() => {
    if (subLocation === "tepal") return 0.75;
    if (subLocation === "pusu") return 0.25;
    return 1.0;
  }, [subLocation]);

  // 2. State untuk menampung seluruh field dari tabel database
  const [liveValues, setLiveValues] = useState({
    power: 0,
    power_r: 0,
    power_s: 0,
    power_t: 0,
    voltage: 220,
    current: 0,
    u_current: 0,
    frequency: 50,
  });

  const [trends, setTrends] = useState({});
  const [powerQuality, setPowerQuality] = useState(0.98);

  // Simulasi Update Data Realtime
  useEffect(() => {
    if (isRealtime) {
      const updateData = () => {
        setLiveValues((prev) => {
          // Simulasi nilai dengan 1 desimal
          const rawNext = {
            power: parseFloat((Math.random() * 5 + 5).toFixed(1)), // ex: 7.8
            power_r: parseFloat((Math.random() * 2 + 1).toFixed(1)), // ex: 2.5
            power_s: parseFloat((Math.random() * 2 + 1).toFixed(1)), // ex: 1.9
            power_t: parseFloat((Math.random() * 2 + 1).toFixed(1)), // ex: 3.4
            voltage: parseFloat((Math.random() * 10 + 230).toFixed(1)), // ex: 239.5
            current: parseFloat((Math.random() * 10 + 10).toFixed(1)), // ex: 14.7
            u_current: Math.floor(Math.random() * 30 + 30), // ex: 59%
            frequency: parseFloat((Math.random() * 0.4 + 49.8).toFixed(1)), // ex: 50.1
          };

          const scaled = {
            ...rawNext,
            power: parseFloat((rawNext.power * multiplier).toFixed(1)),
            current: parseFloat((rawNext.current * multiplier).toFixed(1)),
          };

          // Trend logic (hanya di realtime)
          const newTrends = {};
          Object.keys(scaled).forEach((key) => {
            const diff = scaled[key] - prev[key];
            newTrends[key] =
              `${diff >= 0 ? "+" : ""}${((diff / prev[key]) * 100 || 0).toFixed(1)}%`;
          });
          setTrends(newTrends);
          return scaled;
        });
      };
      const interval = setInterval(updateData, 3000);
      return () => clearInterval(interval);
    } else {
      // Logika sederhana untuk data history (kW -> kWh)
      setLiveValues({
        power: (124.5).toFixed(1),
        power_r: (40.2).toFixed(1),
        power_s: (42.1).toFixed(1),
        power_t: (42.2).toFixed(1),
        voltage: "220.0",
        current: "12.5",
        u_current: "15",
        frequency: "50.0",
      });
    }
  }, [isRealtime, multiplier]);

  const metrics = [
    {
      id: "power",
      label: "Daya Aktif",
      unit: dynamicUnit,
      icon: <TrendingUp />,
      color: "text-et-yellow",
    },
    {
      id: "voltage",
      label: "Tegangan",
      unit: "V",
      icon: <Zap />,
      color: "text-blue-500",
    },
    {
      id: "current",
      label: "Arus",
      unit: "A",
      icon: <Activity />,
      color: "text-red-500",
    },
    {
      id: "frequency",
      label: "Frekuensi",
      unit: "Hz",
      icon: <Waves />,
      color: "text-et-green",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          // Logic data fasa R,S,T untuk Daya
          const phasesData =
            m.id === "power"
              ? [
                  { label: "R", value: liveValues.power_r },
                  { label: "S", value: liveValues.power_s },
                  { label: "T", value: liveValues.power_t },
                ]
              : null;

          // Logic data Unbalance untuk Arus
          const extraInfoData =
            m.id === "current"
              ? {
                  label: "Persentase Unbalance",
                  value: liveValues.u_current,
                  unit: "%",
                }
              : null;

          return (
            <StatCard
              key={m.id}
              {...m}
              value={liveValues[m.id]}
              trend={trends[m.id]} // Trend tetap ada di semua card
              isActive={activeMetric === m.id}
              onClick={() => setActiveMetric(m.id)}
              phases={phasesData}
              extraInfo={extraInfoData}
              isHistory={!isRealtime}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kontainer Grafik Utama */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white capitalize">
                {subLocation === "total"
                  ? "Seluruh Wilayah"
                  : `Dusun ${subLocation}`}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Grafik {activeMetric} - {activeTab}
              </p>
            </div>
            <span className="text-[10px] bg-et-blue/5 text-et-blue px-3 py-1 rounded-full font-black uppercase">
              Beban: {Math.round(multiplier * 100)}%
            </span>
          </div>

          <div className="h-[270px]">
            <RealtimeLoadChart
              activeMetric={activeMetric}
              latestValue={liveValues[activeMetric]}
              activeTab={activeTab}
              subLocation={subLocation}
              // Data history bisa ditambahkan di sini jika sudah ada API
            />
          </div>
        </div>

        {/* Sidebar Info - Power Quality & Distribution */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">
              Kualitas Daya (Cos Phi)
            </h3>
            <div className="text-5xl font-black text-et-green text-center tracking-tighter mb-2">
              {powerQuality}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-et-green h-full transition-all duration-1000"
                style={{ width: `${powerQuality * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
              Distribusi Beban
            </h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loadDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {loadDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {loadDistributionData.map((item) => (
                <div
                  key={item.name}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <p className="text-[8px] font-bold text-slate-400 uppercase">
                    {item.name}
                  </p>
                  <p className="text-xs font-black text-slate-700 dark:text-white">
                    {item.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
