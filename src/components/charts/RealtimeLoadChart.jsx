import React, { useState, useEffect, useMemo } from "react";
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

const RealtimeLoadChart = ({
  activeMetric,
  latestValue,
  activeTab,
  historyData,
  subLocation,
}) => {
  const [realtimeData, setRealtimeData] = useState([]);

  // Multiplier internal tetap dipertahankan untuk sinkronisasi data
  const multiplier = useMemo(() => {
    if (subLocation === "tepal") return 0.75;
    if (subLocation === "pusu") return 0.25;
    return 1.0;
  }, [subLocation]);

  const config = useMemo(
    () => ({
      watt: { color: "#FBC02D", unit: "W" },
      voltage: { color: "#2B5797", unit: "V" },
      current: { color: "#EF4444", unit: "A" },
      frequency: { color: "#438241", unit: "Hz" },
    }),
    [subLocation],
  );

  const currentConfig = config[activeMetric] || config.watt;

  useEffect(() => {
    if (activeTab === "Realtime") {
      setRealtimeData((prev) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        if (
          prev.length === 0 ||
          activeMetric !== prev.metricId ||
          subLocation !== prev.currentLoc
        ) {
          const init = Array(20)
            .fill(0)
            .map((_, i) => {
              const pastTime = new Date(now.getTime() - (20 - i) * 3000);
              const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
              const initialValue = latestValue * randomFactor;

              return {
                time: pastTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                value: parseFloat(initialValue.toFixed(2)),
              };
            });

          init.metricId = activeMetric;
          init.currentLoc = subLocation;
          return init;
        }

        const newData = [...prev.slice(1)];
        newData.push({
          time: timeString,
          value: latestValue,
        });
        newData.metricId = activeMetric;
        newData.currentLoc = subLocation;
        return newData;
      });
    }
  }, [latestValue, activeTab, activeMetric, subLocation]);

  // CUSTOM TOOLTIP: Mengubah "Live Monitoring" menjadi "Pemantauan Langsung"
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            {label ? `Pukul ${label}` : "Pemantauan Langsung"}
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

  if (activeTab === "Realtime") {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={realtimeData} key={`${activeMetric}-${subLocation}`}>
            <defs>
              <linearGradient
                id={`colorMetric-${activeMetric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
            <XAxis dataKey="time" hide />
            <YAxis
              domain={["auto", "auto"]}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: currentConfig.color, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={currentConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#colorMetric-${activeMetric})`}
              animationDuration={500}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={historyData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            strokeOpacity={0.1}
          />
          <XAxis
            dataKey="time"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8" }}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8" }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {historyData &&
              historyData.map((entry, index) => (
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
