"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  HiMiniBolt,
  HiMiniCloud,
  HiMiniSun,
  HiMiniMapPin,
} from "react-icons/hi2";
import ClassicLoader from "@/app/components/ui/ClassicLoader";

interface WeatherResponse {
  source: string;
  detectedIp: string | null;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localtime: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  precipMm: number;
  uv: number;
  suggestion: {
    status: string;
    color: string;
    advice: string;
  };
  updatedAt: string;
}

function getIcon(condition: string) {
  const text = condition.toLowerCase();

  if (text.includes("clear") || text.includes("sunny")) {
    return <HiMiniSun className="h-8 w-8" />;
  }

  if (text.includes("storm") || text.includes("thunder")) {
    return <HiMiniBolt className="h-8 w-8" />;
  }

  return <HiMiniCloud className="h-8 w-8" />;
}

function getStatusClasses(color: string) {
  switch (color) {
    case "green":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    case "yellow":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "orange":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "red":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }
}

export default function BangladeshWeatherCard() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingGps, setUsingGps] = useState(false);

  const fetchWeather = async (query?: string) => {
    setLoading(true);

    try {
      const url = query
        ? `/api/weather/bangladesh?q=${encodeURIComponent(query)}`
        : "/api/weather/bangladesh";

      const res = await axios.get(url);
      setWeather(res.data);
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const useMyPreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location access.");
      return;
    }

    setUsingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const q = `${position.coords.latitude},${position.coords.longitude}`;
        await fetchWeather(q);
        setUsingGps(false);
      },
      () => {
        alert("Location permission denied. Showing IP-based location instead.");
        setUsingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  if (loading) {
    return (
      <div className="w-full rounded-3xl border border-white/10 bg-black/35 p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center gap-4 min-h-[260px]">
        <ClassicLoader size="md" />
        <p className="text-text-muted text-sm tracking-widest uppercase">
          Loading your weather update...
        </p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="w-full rounded-3xl border border-white/10 bg-black/35 p-8 backdrop-blur-xl shadow-2xl min-h-[260px] flex items-center justify-center">
        <p className="text-text-muted text-sm">
          Unable to load weather update right now.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-black/35 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-2">
            Your Weather Update
          </p>

          <h3 className="font-bebasNeue text-4xl md:text-5xl tracking-wider text-white">
            {weather.city}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-white/60 text-sm">
            <HiMiniMapPin className="h-4 w-4 text-accent" />
            <span>
              {weather.region || weather.country} ·{" "}
              {weather.source === "ip"
                ? "Detected from IP"
                : weather.source === "manual-or-browser-location"
                  ? "Precise browser location"
                  : "Fallback location"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="text-accent">{getIcon(weather.condition)}</div>
          <div>
            <div className="text-3xl font-bold text-white">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-sm text-white/60">{weather.condition}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/45 mb-1">
            Feels Like
          </p>
          <p className="text-xl font-semibold text-white">
            {Math.round(weather.feelsLike)}°C
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/45 mb-1">
            Wind
          </p>
          <p className="text-xl font-semibold text-white">
            {Math.round(weather.windSpeed)} km/h
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/45 mb-1">
            Humidity
          </p>
          <p className="text-xl font-semibold text-white">
            {weather.humidity}%
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${getStatusClasses(
            weather.suggestion.color,
          )}`}
        >
          <p className="text-xs uppercase tracking-widest mb-1">Trip Status</p>
          <p className="text-xl font-semibold">{weather.suggestion.status}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/10 p-5">
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          BUAC Suggestion
        </p>
        <p className="text-sm md:text-base text-white/80 leading-relaxed">
          {weather.suggestion.advice}
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={useMyPreciseLocation}
          disabled={usingGps}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60 cursor-pointer"
        >
          {usingGps ? "Getting location..." : "Use My Precise Location"}
        </button>

        <Link
          href="/weather"
          className="rounded-full border border-accent/50 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white text-center"
        >
          View Bangladesh Weather Map
        </Link>
      </div>

      <p className="mt-4 text-xs text-white/35">
        Location is used only to show weather and tour suggestions. It is not
        stored by BUAC.
      </p>
    </div>
  );
}