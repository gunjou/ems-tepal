import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RealtimeLoadChart = ({ activeMetric, activeTab, historyData = [] }) => {
  const isRealtime = activeTab === "Realtime" || activeTab === "Waktu Nyata";
  const isDaily = activeTab === "Harian";
  const isMonthly = activeTab === "Bulanan";
  const isYearly = activeTab === "Tahunan";

  // 1. Konfigurasi Warna & Unit
  const config = useMemo(
    () => ({
      power: { color: "#FBC02D", unit: isRealtime ? "kW" : "kWh" },
      voltage: { color: "#2B5797", unit: "V" },
      current: { color: "#EF4444", unit: "A" },
      frequency: { color: "#438241", unit: "Hz" },
    }),
    [isRealtime],
  );

  const currentConfig = config[activeMetric] || config.power;

  // 2. Custom Tooltip dengan Logika Multi-Filter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let headerLabel = "";

      if (isRealtime) {
        headerLabel = `Pukul ${label}`;
      } else if (isDaily) {
        headerLabel = `Jam ${label}`; // bisa ditambahkan :00 jika perlu
      } else if (isMonthly) {
        headerLabel = `${label}`; // Untuk bulanan, label biasanya sudah berisi "Tgl 1", "Tgl 2", dst dari API
      } else if (isYearly) {
        // Untuk tahunan, label biasanya sudah berisi "Jan", "Feb", dst dari API
        headerLabel = `${label}`; // Untuk tahunan, label biasanya sudah berisi "Jan", "Feb", dst dari API
      }

      return (
        <div className="bg-white dark:bg-slate-800 p-2 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            {headerLabel}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentConfig.color }}
            ></div>
            <p className="text-sm font-black dark:text-white">
              {payload[0].value.toLocaleString("id-ID")}{" "}
              <span className="text-xs font-normal text-slate-500">
                {currentConfig.unit}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // TAMPILAN AREA CHART (Realtime)
  if (isRealtime) {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={currentConfig.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={currentConfig.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.05}
            />
            <XAxis
              dataKey="label"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              domain={["auto", "auto"]}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={currentConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMetric)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // TAMPILAN BAR CHART (Harian, Bulanan, & Tahunan)
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={historyData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            strokeOpacity={0.1}
          />
          <XAxis
            dataKey="label"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8" }}
            // Jika bulanan (30 data) interval lebih besar, tahunan (12 data) tampilkan semua
            interval={isMonthly ? 4 : isYearly ? 0 : 2}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8" }}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {historyData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={currentConfig.color}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealtimeLoadChart;
