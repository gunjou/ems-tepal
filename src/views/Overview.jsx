import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Zap, Activity, TrendingUp, Waves } from "lucide-react";
import RealtimeLoadChart from "../components/charts/RealtimeLoadChart";
import StatCard from "../components/charts/StatCard";
import Api from "../Api";

const Overview = ({ activeTab, subLocation = "total", filterValue }) => {
  const [activeMetric, setActiveMetric] = useState("power");
  const [liveValues, setLiveValues] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataStale, setIsDataStale] = useState(false);
  const [lastSeen, setLastSeen] = useState("");

  const isRealtime = activeTab === "Realtime" || activeTab === "Waktu Nyata";
  const isDaily = activeTab === "Harian";
  const isMonthly = activeTab === "Bulanan";
  const isYearly = activeTab === "Tahunan";

  const getDeviceId = useCallback(() => {
    if (subLocation === "tepal") return "EMS-01";
    if (subLocation === "pusu") return "EMS-02";
    return null;
  }, [subLocation]);

  const checkDataFreshness = useCallback((timestamp) => {
    if (!timestamp) return;
    const dataTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - dataTime) / 1000 / 60;
    setIsDataStale(diffInMinutes > 2);

    const formattedDate = new Date(timestamp).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLastSeen(`${formattedDate}, ${formattedTime}`);
  }, []);

  // 1. FETCH SUMMARY (Cards)
  const fetchSummary = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      let endpoint = "/summary";
      let params = { device_id: deviceId };

      if (isDaily) {
        endpoint = "/summary/daily";
        params.date = filterValue; // Menggunakan YYYY-MM-DD
      } else if (isMonthly) {
        endpoint = "/summary/monthly";
        params.month = filterValue; // Menggunakan 1-12
        params.year = new Date().getFullYear(); // Bisa ditambah selector tahun juga jika perlu
      } else if (isYearly) {
        endpoint = "/summary/yearly";
        params.year = filterValue; // Menggunakan YYYY
      }

      const response = await Api.get(endpoint, { params });

      if (response.data.success) {
        // Daily, Monthly, dan Yearly membungkus data di dalam 'summary'
        const result = isRealtime
          ? response.data.data
          : response.data.data.summary;
        setLiveValues(result);

        if (isRealtime && response.data.meta?.timestamp) {
          checkDataFreshness(response.data.meta.timestamp);
        } else {
          setIsDataStale(false);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil summary:", err);
      if (isRealtime) setIsDataStale(true);
    }
  }, [
    getDeviceId,
    isRealtime,
    isDaily,
    isMonthly,
    isYearly,
    checkDataFreshness,
    filterValue,
  ]);

  // 2. FETCH CHART (Grafik)
  const fetchChart = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      let endpoint = "/chart";
      let params = { metric: activeMetric, device_id: deviceId };

      if (isDaily) {
        endpoint = "/chart/24h";
        params.date = filterValue;
      } else if (isMonthly) {
        endpoint = "/chart/monthly";
        params.month = filterValue;
        params.year = new Date().getFullYear();
      } else if (isYearly) {
        endpoint = "/chart/yearly";
        params.year = filterValue;
      }

      const response = await Api.get(endpoint, { params });

      if (response.data.success) {
        // Unboxing data untuk Monthly dan Yearly (yang memiliki field .data.data)
        const finalChartData = isYearly
          ? response.data.data[0] // Ambil indeks pertama yang berisi list bulan
          : response.data.data;

        setChartData(finalChartData);
      }
    } catch (err) {
      console.error("Gagal mengambil chart:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getDeviceId,
    activeMetric,
    isRealtime,
    isDaily,
    isMonthly,
    isYearly,
    filterValue,
  ]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchSummary(), fetchChart()]).finally(() =>
      setIsLoading(false),
    );

    let interval = null;
    if (isRealtime) {
      interval = setInterval(() => {
        fetchSummary();
        fetchChart();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchSummary, fetchChart, isRealtime, filterValue]);

  // Handle Power Factor
  const pfValue = useMemo(() => {
    if (!liveValues?.power_factor) return "0.00";
    const val =
      typeof liveValues.power_factor === "object"
        ? liveValues.power_factor.value
        : liveValues.power_factor;
    return parseFloat(val || 0).toFixed(2);
  }, [liveValues]);

  const metrics = [
    {
      id: "power",
      label: "Daya Aktif",
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

  if (isLoading && !liveValues) {
    return (
      <div className="h-96 flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">
        Menyinkronkan Data Tahunan...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* OVERLAY SPINNER */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-[1px] transition-all duration-300">
          <div className="relative">
            {/* Ring Spinner Luar */}
            <div className="w-16 h-16 border-4 border-et-blue/20 border-t-et-blue rounded-full animate-spin"></div>
            {/* Icon di tengah spinner */}
            <Zap
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-et-blue animate-pulse"
              size={24}
            />
          </div>
          <p className="mt-4 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] animate-pulse">
            Menyinkronkan Data...
          </p>
        </div>
      )}

      {/* 1. GRID KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const data = liveValues?.[m.id];
          const phasesData =
            m.id === "power"
              ? [
                  { label: "R", value: data?.phases?.r ?? data?.r ?? 0 },
                  { label: "S", value: data?.phases?.s ?? data?.s ?? 0 },
                  { label: "T", value: data?.phases?.t ?? data?.t ?? 0 },
                ]
              : null;

          const extraInfoData =
            m.id === "current"
              ? {
                  label: data?.extra?.label || "Unbalance",
                  value: data?.extra?.value ?? data?.unbalance ?? 0,
                  unit: data?.extra?.unit || "%",
                }
              : null;

          return (
            <StatCard
              key={m.id}
              {...m}
              value={
                m.id === "power" ? (data?.value ?? data?.total) : data?.value
              }
              unit={data?.unit || m.unit}
              trend={data?.trend || "0.0%"}
              isActive={activeMetric === m.id}
              onClick={() => setActiveMetric(m.id)}
              phases={phasesData}
              extraInfo={extraInfoData}
              isHistory={!isRealtime}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 2. GRAFIK UTAMA */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="h-[280px]">
            <RealtimeLoadChart
              activeMetric={activeMetric}
              activeTab={activeTab}
              historyData={chartData}
            />
          </div>
        </div>

        {/* 3. SIDEBAR INFO */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">
              Power Factor
            </h3>
            <div className="text-4xl font-black text-et-green tracking-tighter">
              {pfValue}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-grow">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">
              Status Koneksi Alat
            </h3>
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                  isRealtime
                    ? isDataStale
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "bg-et-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-blue-500"
                }`}
              ></div>
              <div>
                <p
                  className={`text-[11px] font-black leading-none uppercase tracking-tighter ${
                    isRealtime
                      ? isDataStale
                        ? "text-amber-600"
                        : "text-et-green"
                      : "text-blue-600"
                  }`}
                >
                  {isRealtime
                    ? isDataStale
                      ? "Data Tertahan (Delayed)"
                      : "Sistem Online"
                    : `${activeTab.toUpperCase()}`}
                </p>
                {isRealtime && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-black tabular-nums mt-1">
                    {lastSeen}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
