import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingDown, Zap, Leaf, Target } from "lucide-react";
import Api from "../Api";

const EnergyAnalysis = ({ activeTab, filterValue, deviceId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDaily = activeTab === "Harian";
  const isMonthly = activeTab === "Bulanan";
  const isYearly = activeTab === "Tahunan";

  const fetchEnergyData = useCallback(async () => {
    try {
      let endpoint = "/analysis-energy/daily";
      let params = {};

      if (deviceId) {
        params.device_id = deviceId;
      }

      if (isDaily) {
        endpoint = "/analysis-energy/daily";
        params.date = filterValue;
      } else if (isMonthly) {
        endpoint = "/analysis-energy/monthly";
        params.month = filterValue;
        params.year = new Date().getFullYear();
      } else if (isYearly) {
        endpoint = "/analysis-energy/yearly";
        params.year = filterValue;
      }

      const response = await Api.get(endpoint, { params });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data energy analysis:", err);
    }
  }, [isDaily, isMonthly, isYearly, filterValue, deviceId]);

  useEffect(() => {
    setIsLoading(true);

    fetchEnergyData().finally(() => {
      setTimeout(() => setIsLoading(false), 300);
    });
  }, [fetchEnergyData]);

  const getPeriodLabel = () => {
    if (isDaily) return "Per Jam (Hari ini vs Kemarin)";
    if (isMonthly) return "Per Minggu (Bulan ini vs Bulan lalu)";
    if (isYearly) return "Per Bulan (Tahun ini vs Tahun lalu)";
    return "";
  };

  const getCardPeriodLabel = () => {
    if (isDaily) return "Total Harian";
    if (isMonthly) return "Total Bulanan";
    if (isYearly) return "Total Tahunan";
    return "Total";
  };

  const formatXAxis = (value) => {
    if (!value) return "";

    if (isDaily) {
      return value;
    }

    if (isMonthly) {
      return value.replace("Minggu ", "M");
    }

    if (isYearly) {
      return value.substring(0, 3);
    }

    return value;
  };

  if (isLoading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-et-blue/20 border-t-et-blue rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
          Menyusun Analisis Energi...
        </p>
      </div>
    );
  }

  const cardData = data?.card || {};
  const chartData = data?.chart || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalysisCard
          title="Total Konsumsi"
          value={cardData?.total_consumption?.value}
          unit={cardData?.total_consumption?.unit || "kWh"}
          sub={getCardPeriodLabel()}
          icon={<Zap size={20} />}
          color="text-et-blue"
        />

        <AnalysisCard
          title="Emisi Terhindar"
          value={cardData?.avoided_emissions?.value}
          unit={cardData?.avoided_emissions?.unit || "kgCO2"}
          sub="Dampak Lingkungan"
          icon={<Leaf size={20} />}
          color="text-et-green"
        />

        <AnalysisCard
          title="Efisiensi Sistem"
          value={cardData?.system_efficiency?.value}
          unit={cardData?.system_efficiency?.unit || "%"}
          sub="Skor Performa"
          icon={<Target size={20} />}
          color="text-et-yellow"
        />

        <AnalysisCard
          title="Energi Terbuang"
          value={cardData?.wasted_energy?.value}
          unit={cardData?.wasted_energy?.unit || "kWh"}
          sub="Estimasi Rugi-rugi"
          icon={<TrendingDown size={20} />}
          color="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                Analisis Perbandingan Konsumsi
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                {getPeriodLabel()}
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={formatXAxis}
                  interval={isDaily ? 3 : 0}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => `${value} kWh`}
                />

                <Tooltip
                  content={<EnergyTooltip activeTab={activeTab} />}
                  cursor={{ fill: "rgba(40, 40, 40, 0.09)" }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "10px", paddingBottom: "20px" }}
                  formatter={(value) => (
                    <span className="text-slate-600 font-bold uppercase">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  name="Periode Lalu"
                  dataKey="previous.value"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  name="Periode Ini"
                  dataKey="current.value"
                  fill="#2B5797"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnergyTooltip = ({ active, payload, label, activeTab }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const currentItem = payload.find((item) => item.dataKey === "current.value");
  const previousItem = payload.find(
    (item) => item.dataKey === "previous.value",
  );

  let periodLabel = label;

  if (activeTab === "Harian") {
    periodLabel = `Pukul ${label}`;
  } else if (activeTab === "Bulanan") {
    periodLabel = label;
  } else if (activeTab === "Tahunan") {
    periodLabel = label;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-3 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl min-w-[150px]">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
        {periodLabel}
      </p>

      <div className="space-y-1.5">
        {currentItem && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-et-blue">
              Periode Ini
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-white">
              {Number(currentItem.value || 0).toLocaleString("id-ID")} kWh
            </span>
          </div>
        )}

        {previousItem && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-400">
              Periode Lalu
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-white">
              {Number(previousItem.value || 0).toLocaleString("id-ID")} kWh
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, value, unit, sub, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between mb-2">
      <div className="flex flex-col gap-0.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-80">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">
            {typeof value === "number"
              ? value.toLocaleString("id-ID")
              : (value ?? "0")}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            {unit}
          </span>
        </div>
      </div>

      <div
        className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color} shrink-0`}
      >
        {React.cloneElement(icon, { size: 16 })}
      </div>
    </div>

    <p className="text-[9px] font-bold text-slate-500/70 dark:text-slate-400/60 capitalize leading-tight">
      {sub}
    </p>
  </div>
);

export default EnergyAnalysis;
