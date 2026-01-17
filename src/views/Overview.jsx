import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Zap,
  Activity,
  TrendingUp,
  Waves,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import RealtimeLoadChart from "../components/charts/RealtimeLoadChart";
import StatCard from "../components/charts/StatCard";

const Overview = ({ activeTab, subLocation = "total" }) => {
  const [activeMetric, setActiveMetric] = useState("watt");

  const loadDistributionData = [
    { name: "Dusun Tepal", value: 75, color: "#F59E0B" },
    { name: "Dusun Pusu", value: 25, color: "#10B981" },
  ];

  const getMultiplier = (loc) => {
    if (loc === "tepal") return 0.75;
    if (loc === "pusu") return 0.25;
    return 1.0;
  };

  const [liveValues, setLiveValues] = useState(() => {
    const mult = getMultiplier(subLocation);
    return {
      watt: 55 * mult,
      voltage: 224.5,
      current: 12.5 * mult,
      frequency: 50.02,
    };
  });

  const [trends, setTrends] = useState({
    watt: "0.0%",
    voltage: "0.0%",
    current: "0.0%",
    frequency: "0.0%",
  });

  const [powerQuality, setPowerQuality] = useState(0.98);

  const multiplier = useMemo(() => {
    if (subLocation === "tepal") return 0.75;
    if (subLocation === "pusu") return 0.25;
    return 1.0;
  }, [subLocation]);

  const getScaledValue = (key, rawValue) => {
    if (key === "watt" || key === "current") {
      return rawValue * multiplier;
    }
    return rawValue;
  };

  const historyData = {
    Harian: { watt: 45.2, voltage: 220.5, current: 12.1, frequency: 50.1 },
    Bulanan: { watt: 1250.8, voltage: 219.2, current: 11.5, frequency: 49.9 },
    Tahunan: { watt: 15420.5, voltage: 221.0, current: 12.4, frequency: 50.0 },
  };

  const historyChartData = useMemo(() => {
    const generateData = (length, min, max, labelPrefix = "") =>
      Array.from({ length }, (_, i) => ({
        time: labelPrefix ? `${labelPrefix} ${i + 1}` : `${i}:00`,
        value: getScaledValue(
          activeMetric,
          parseFloat((Math.random() * (max - min) + min).toFixed(2)),
        ),
      }));

    const ranges = {
      watt: { harian: [1000, 2000], bulanan: [30, 60], tahunan: [1000, 1500] },
      voltage: { harian: [215, 225], bulanan: [218, 222], tahunan: [219, 221] },
      current: { harian: [10, 15], bulanan: [8, 12], tahunan: [10, 13] },
      frequency: {
        harian: [49.5, 50.5],
        bulanan: [49.8, 50.2],
        tahunan: [49.9, 50.1],
      },
    };

    const r = ranges[activeMetric];
    return {
      Harian: generateData(24, r.harian[0], r.harian[1]),
      Bulanan: generateData(30, r.bulanan[0], r.bulanan[1], "Tgl"),
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
        value: getScaledValue(
          activeMetric,
          parseFloat(
            (
              Math.random() * (r.tahunan[1] - r.tahunan[0]) +
              r.tahunan[0]
            ).toFixed(2),
          ),
        ),
      })),
    };
  }, [activeMetric, multiplier]);

  useEffect(() => {
    if (activeTab === "Waktu Nyata" || activeTab === "Realtime") {
      const updateData = () => {
        setLiveValues((prev) => {
          const rawNext = {
            watt: Math.floor(Math.random() * (70 - 40) + 40),
            voltage: parseFloat((Math.random() * (245 - 210) + 210).toFixed(1)),
            current: parseFloat((Math.random() * (18 - 10) + 10).toFixed(2)),
            frequency: parseFloat(
              (Math.random() * (50.5 - 49.5) + 49.5).toFixed(2),
            ),
          };

          const scaledNext = {
            watt: getScaledValue("watt", rawNext.watt),
            voltage: getScaledValue("voltage", rawNext.voltage),
            current: getScaledValue("current", rawNext.current),
            frequency: getScaledValue("frequency", rawNext.frequency),
          };

          const newTrends = {};
          Object.keys(scaledNext).forEach((key) => {
            const diff = scaledNext[key] - prev[key];
            const percent = prev[key] !== 0 ? (diff / prev[key]) * 100 : 0;
            newTrends[key] = `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
          });
          setTrends(newTrends);
          setPowerQuality(parseFloat((0.96 + Math.random() * 0.03).toFixed(2)));
          return scaledNext;
        });
      };
      updateData();
      const interval = setInterval(updateData, 3000);
      return () => clearInterval(interval);
    } else {
      const baseKey =
        activeTab === "Harian"
          ? "Harian"
          : activeTab === "Bulanan"
            ? "Bulanan"
            : "Tahunan";
      const base = historyData[baseKey] || historyData.Harian;
      setLiveValues({
        watt: getScaledValue("watt", base.watt),
        voltage: getScaledValue("voltage", base.voltage),
        current: getScaledValue("current", base.current),
        frequency: getScaledValue("frequency", base.frequency),
      });
      setTrends({
        watt: "0.0%",
        voltage: "0.0%",
        current: "0.0%",
        frequency: "0.0%",
      });
    }
  }, [activeTab, multiplier]);

  // Perubahan Label Istilah Teknis
  const metrics = [
    {
      id: "watt",
      label: "Daya Aktif", // Pengganti Konsumsi/Watt
      unit: "kW",
      icon: <TrendingUp size={20} />,
      color: "text-et-yellow",
    },
    {
      id: "voltage",
      label: "Tegangan",
      unit: "V",
      icon: <Zap size={20} />,
      color: "text-blue-500",
    },
    {
      id: "current",
      label: "Arus",
      unit: "A",
      icon: <Activity size={20} />,
      color: "text-red-500",
    },
    {
      id: "frequency",
      label: "Frekuensi",
      unit: "Hz",
      icon: <Waves size={20} />,
      color: "text-et-green",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <StatCard
            key={m.id}
            {...m}
            value={liveValues[m.id]?.toLocaleString("id-ID") || "0"}
            trend={
              activeTab === "Realtime" || activeTab === "Waktu Nyata"
                ? trends[m.id]
                : m.id === "voltage" || m.id === "frequency"
                  ? "Sinkronisasi Sistem"
                  : `Unit: ${subLocation.toUpperCase()}`
            }
            isActive={activeMetric === m.id}
            onClick={() => setActiveMetric(m.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bagian Grafik Utama */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white capitalize leading-tight">
                {subLocation === "total"
                  ? "Seluruh Wilayah"
                  : `Dusun ${subLocation}`}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Pemantauan {activeMetric} - {activeTab}
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-slate-500">
              KONTRIBUSI BEBAN {multiplier * 100}%
            </span>
          </div>
          <div className="h-64">
            <RealtimeLoadChart
              activeMetric={activeMetric}
              latestValue={liveValues[activeMetric]}
              activeTab={activeTab}
              historyData={
                historyChartData[
                  activeTab === "Waktu Nyata" ? "Realtime" : activeTab
                ]
              }
              subLocation={subLocation}
            />
          </div>
        </div>

        {/* Bilah Samping Info Listrik */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
              Kualitas Daya
            </h3>
            <div className="text-4xl font-black text-et-green text-center">
              {powerQuality}
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-1">
              Faktor Daya (Cos Phi)
            </p>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-4">
              <div
                className="bg-et-green h-1 rounded-full transition-all duration-1000"
                style={{ width: `${powerQuality * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 h-[175px] flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Distribusi Beban
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Rasio Langsung
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loadDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
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

              <div className="w-1/2 space-y-2">
                {loadDistributionData.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 ml-3">
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {item.value}%
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                        Beban
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
