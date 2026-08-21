import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Zap, ShieldCheck, Activity, RotateCcw } from "lucide-react";
import Api from "../Api";

const PowerQuality = ({ activeTab, filterValue, deviceId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRealtime = activeTab === "Realtime" || activeTab === "Waktu Nyata";
  const isDaily = activeTab === "Harian";
  const isMonthly = activeTab === "Bulanan";
  const isYearly = activeTab === "Tahunan";

  const fetchPQData = useCallback(async () => {
    try {
      let endpoint = "/power-quality/realtime";
      let params = {};

      if (deviceId) {
        params.device_id = deviceId;
      }

      if (isDaily) {
        endpoint = "/power-quality/daily";
        params.date = filterValue;
      } else if (isMonthly) {
        endpoint = "/power-quality/monthly";
        params.month = filterValue;
        params.year = new Date().getFullYear();
      } else if (isYearly) {
        endpoint = "/power-quality/yearly";
        params.year = filterValue;
      }

      const response = await Api.get(endpoint, { params });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data PQ:", err);
    }
  }, [isDaily, isMonthly, isYearly, filterValue, deviceId]);

  useEffect(() => {
    setIsLoading(true);

    fetchPQData().finally(() => {
      setTimeout(() => setIsLoading(false), 300);
    });

    let interval = null;

    if (isRealtime) {
      interval = setInterval(() => {
        fetchPQData();
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchPQData, isRealtime, activeTab]);

  const formatXAxis = (tickItem) => {
    if (!tickItem) return "";

    if (isMonthly && tickItem.includes("-")) {
      return tickItem.split("-")[0];
    }

    if (isYearly) {
      return tickItem.substring(0, 3);
    }

    return tickItem;
  };

  const getPeriodLabel = () => {
    if (isRealtime) return "Nilai Terakhir";
    if (isDaily) return "Rata-rata Harian";
    if (isMonthly) return "Rata-rata Bulanan";
    if (isYearly) return "Rata-rata Tahunan";
    return "Rata-rata";
  };

  const getResetLabel = () => {
    if (isRealtime) return "Reset Hari Ini";
    if (isDaily) return "Reset Hari Ini";
    if (isMonthly) return "Reset Bulanan";
    if (isYearly) return "Reset Tahunan";
    return "Jumlah Restart";
  };

  const getChartPeriodLabel = () => {
    if (isRealtime) return "Realtime";
    if (isDaily) return "Harian";
    if (isMonthly) return "Bulanan";
    if (isYearly) return "Tahunan";
    return "";
  };

  const getChartDescription = () => {
    if (isRealtime) return "20 interval terakhir";
    if (isDaily) return `Hari ${filterValue || "ini"}`;
    if (isMonthly) return `Bulan ${filterValue || ""}`;
    if (isYearly) return `Tahun ${filterValue || ""}`;
    return "";
  };

  if (isLoading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-et-blue/20 border-t-et-blue rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
          Menyusun Laporan Power Quality...
        </p>
      </div>
    );
  }

  const chartData = data?.chart || [];
  const cardData = data?.card || {};

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PQCard
          title="Tegangan"
          value={cardData?.voltage?.value}
          unit={cardData?.voltage?.unit}
          icon={<Zap />}
          color="text-et-yellow"
          sub={getPeriodLabel()}
        />

        <PQCard
          title="Faktor Daya"
          value={cardData?.power_factor?.value}
          unit={cardData?.power_factor?.unit}
          icon={<ShieldCheck />}
          color="text-et-blue"
          sub="Rata-rata Faktor Daya"
        />

        <PQCard
          title="Frekuensi"
          value={cardData?.frequency?.value}
          unit={cardData?.frequency?.unit}
          icon={<Activity />}
          color="text-et-green"
          sub="Rata-rata Frekuensi"
        />

        <PQCard
          title="Restart Perangkat"
          value={cardData?.anomalies?.value}
          unit={cardData?.anomalies?.unit}
          icon={<RotateCcw />}
          color="text-red-500"
          sub={getResetLabel()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[370px]">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white leading-none">
              Analisis Tegangan {getChartPeriodLabel()}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              Voltase Sistem (V) - {getChartDescription()}
            </p>
          </div>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                  dataKey="label"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={formatXAxis}
                  interval={isYearly ? 0 : isMonthly ? 4 : 2}
                  hide={isRealtime}
                />

                <YAxis
                  domain={["auto", "auto"]}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />

                <Tooltip
                  content={<CustomPQTooltip unit="V" mode={activeTab} />}
                />

                <Area
                  type="monotone"
                  dataKey="voltage"
                  stroke="#FBC02D"
                  strokeWidth={3}
                  fill="url(#colorVoltage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-[370px]">
          <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-4">
              Tren Faktor Daya
            </h3>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.05}
                  />

                  <XAxis dataKey="label" hide />

                  <YAxis
                    domain={[0.5, 1]}
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />

                  <Tooltip
                    content={<CustomPQTooltip unit="cos φ" mode={activeTab} />}
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
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-4">
              Stabilitas Frekuensi
            </h3>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                    tickFormatter={formatXAxis}
                    interval={isYearly ? 0 : 4}
                    hide={isRealtime}
                  />

                  <YAxis
                    domain={[0, 60]}
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />

                  <Tooltip
                    content={<CustomPQTooltip unit="Hz" mode={activeTab} />}
                  />

                  <Area
                    type="monotone"
                    dataKey="frequency"
                    stroke="#438241"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#438241"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomPQTooltip = ({ active, payload, label, unit, mode }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  let contextLabel = label;

  if (mode === "Bulanan") {
    contextLabel = `Tanggal ${label}`;
  } else if (mode === "Tahunan") {
    contextLabel = `Bulan ${label}`;
  } else if (mode === "Harian") {
    contextLabel = `Pukul ${label}`;
  } else if (mode === "Realtime" || mode === "Waktu Nyata") {
    contextLabel = `Pukul ${label}`;
  }

  const value = Number(payload[0].value || 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-2 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
        {contextLabel}
      </p>
      <p className="text-sm font-black dark:text-white">
        {value.toLocaleString("id-ID")}{" "}
        <span className="text-[10px] font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  );
};

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
          {typeof value === "number"
            ? value.toLocaleString("id-ID")
            : (value ?? "0")}
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
