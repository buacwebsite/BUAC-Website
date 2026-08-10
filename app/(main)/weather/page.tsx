"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import PageLoader from "@/app/components/ui/PageLoader";
import {
  HiMiniBolt,
  HiMiniCloud,
  HiMiniMapPin,
  HiMiniSun,
  HiMagnifyingGlass,
  HiCursorArrowRays,
} from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";

interface DistrictWeatherLocation {
  id: string;
  name: string;
  division: string;
  lat: number;
  lon: number;
  tourType: string;
  error?: boolean;
  weather?: {
    temperature: number;
    feelsLike: number;
    condition: string;
    windSpeed: number;
    humidity: number;
    precipMm: number;
    uv: number;
    localtime: string;
  };
  suggestion?: {
    status: string;
    color: string;
    advice: string;
  };
}

interface BangladeshWeatherResponse {
  country: string;
  totalDistricts: number;
  updatedAt: string;
  locations: DistrictWeatherLocation[];
}

interface MyWeatherResponse {
  source: string;
  detectedIp: string | null;
  location: {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    localtime: string;
  };
  current: {
    lastUpdated: string;
    temperatureC: number;
    temperatureF: number;
    feelsLikeC: number;
    feelsLikeF: number;
    isDay: boolean;
    condition: string;
    icon: string;
    windKph: number;
    windMph: number;
    windDegree: number;
    windDirection: string;
    gustKph: number;
    pressureMb: number;
    precipitationMm: number;
    humidity: number;
    cloud: number;
    visibilityKm: number;
    uv: number;
  };
  airQuality: {
    pm25: number | null;
    pm10: number | null;
    co: number | null;
    no2: number | null;
    o3: number | null;
    so2: number | null;
    usEpaIndex: number | null;
    text: string;
  };
  astro: {
    sunrise: string;
    sunset: string;
  };
  hourly: Array<{
    time: string;
    temperatureC: number;
    feelsLikeC: number;
    condition: string;
    icon: string;
    windKph: number;
    humidity: number;
    cloud: number;
    chanceOfRain: number;
    precipMm: number;
    uv: number;
  }>;
  forecast: Array<{
    date: string;
    maxTempC: number;
    minTempC: number;
    avgTempC: number;
    condition: string;
    icon: string;
    chanceOfRain: number;
    maxWindKph: number;
    totalPrecipMm: number;
    avgHumidity: number;
    avgVisibilityKm: number;
    uv: number;
    sunrise: string;
    sunset: string;
    moonPhase: string;
  }>;
  suggestion: {
    status: string;
    color: string;
    advice: string;
  };
  updatedAt: string;
}

type StatusFilter =
  | "all"
  | "Recommended"
  | "Caution"
  | "Hot"
  | "Avoid"
  | "Moderate";

const statusFilters: StatusFilter[] = [
  "all",
  "Recommended",
  "Caution",
  "Hot",
  "Avoid",
  "Moderate",
];

function getIcon(
  condition?: string,
  className = "h-5 w-5",
) {
  const text =
    condition?.toLowerCase() || "";

  if (
    text.includes("clear") ||
    text.includes("sunny")
  ) {
    return (
      <HiMiniSun className={className} />
    );
  }

  if (
    text.includes("storm") ||
    text.includes("thunder")
  ) {
    return (
      <HiMiniBolt className={className} />
    );
  }

  return (
    <HiMiniCloud className={className} />
  );
}

function getStatusClasses(color?: string) {
  switch (color) {
    case "green":
      return {
        text: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/25",
        bar: "bg-green-500",
      };

    case "yellow":
      return {
        text: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/25",
        bar: "bg-yellow-500",
      };

    case "orange":
      return {
        text: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/25",
        bar: "bg-orange-500",
      };

    case "red":
      return {
        text: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/25",
        bar: "bg-red-500",
      };

    default:
      return {
        text: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/25",
        bar: "bg-blue-500",
      };
  }
}

function getStatusPriority(status?: string) {
  switch (status) {
    case "Recommended":
      return 1;

    case "Moderate":
      return 2;

    case "Hot":
      return 3;

    case "Caution":
      return 4;

    case "Avoid":
      return 5;

    default:
      return 6;
  }
}

function formatTime(value: string) {
  const time =
    value.split(" ")[1] || value;

  const [hourRaw, minute = "00"] =
    time.split(":");

  const hour = Number(hourRaw);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function formatDay(value: string) {
  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-text-secondary">
        {value}
      </p>
    </div>
  );
}

function InlineLocationLoader() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
  );
}

export default function WeatherPage() {
  const [myWeather, setMyWeather] =
    useState<MyWeatherResponse | null>(null);

  const [districtData, setDistrictData] =
    useState<BangladeshWeatherResponse | null>(
      null,
    );

  const [
    detectingLocation,
    setDetectingLocation,
  ] = useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [
    loadingDistricts,
    setLoadingDistricts,
  ] = useState(true);

  const [searchText, setSearchText] =
    useState("");

  const [searchError, setSearchError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  useEffect(() => {
    const fetchDistrictWeather = async () => {
      try {
        const response = await axios.get(
          "/api/weather/bangladesh-map",
        );

        setDistrictData(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch district weather:",
          error,
        );
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistrictWeather();
  }, []);

  const detectMyLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location detection.",
      );

      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const {
            latitude,
            longitude,
          } = position.coords;

          const query = `${latitude},${longitude}`;

          const response = await axios.get(
            `/api/weather/bangladesh?q=${encodeURIComponent(
              query,
            )}`,
          );

          setMyWeather(response.data);
        } catch (error) {
          console.error(
            "Failed to fetch detected location weather:",
            error,
          );

          setLocationError(
            "Could not load weather for your location.",
          );
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error(
          "Location permission error:",
          error,
        );

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setLocationError(
            "Location permission denied.",
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            "Location information is unavailable.",
          );
        } else if (
          error.code === error.TIMEOUT
        ) {
          setLocationError(
            "Location request timed out.",
          );
        } else {
          setLocationError(
            "Could not detect your location.",
          );
        }

        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const allDistricts = useMemo(() => {
    return districtData?.locations || [];
  }, [districtData]);

  const filteredDistricts = useMemo(() => {
    const query =
      searchText.trim().toLowerCase();

    return allDistricts
      .filter((district) => {
        const condition =
          district.weather?.condition || "";

        const matchesSearch =
          !query ||
          district.name
            .toLowerCase()
            .includes(query) ||
          district.division
            .toLowerCase()
            .includes(query) ||
          district.tourType
            .toLowerCase()
            .includes(query) ||
          condition
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          district.suggestion?.status ===
            statusFilter;

        return (
          matchesSearch && matchesStatus
        );
      })
      .sort((first, second) => {
        const statusDifference =
          getStatusPriority(
            first.suggestion?.status,
          ) -
          getStatusPriority(
            second.suggestion?.status,
          );

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return first.name.localeCompare(
          second.name,
        );
      });
  }, [
    allDistricts,
    searchText,
    statusFilter,
  ]);

  const groupedDistricts = useMemo(() => {
    return filteredDistricts.reduce<
      Record<
        string,
        DistrictWeatherLocation[]
      >
    >((groups, district) => {
      if (!groups[district.division]) {
        groups[district.division] = [];
      }

      groups[district.division].push(
        district,
      );

      return groups;
    }, {});
  }, [filteredDistricts]);

  const divisionNames = useMemo(() => {
    return Object.keys(
      groupedDistricts,
    ).sort();
  }, [groupedDistricts]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setSearchError(
        "Type a district, division, weather condition, or tour type.",
      );

      return;
    }

    if (!filteredDistricts.length) {
      setSearchError(
        "No matching district found.",
      );

      return;
    }

    setSearchError("");

    window.requestAnimationFrame(() => {
      document
        .getElementById(
          "district-weather-results",
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  const clearSearch = () => {
    setSearchText("");
    setStatusFilter("all");
    setSearchError("");
  };

  if (loadingDistricts) {
    return (
      <PageLoader label="Loading weather" />
    );
  }

  const locationClasses =
    getStatusClasses(
      myWeather?.suggestion.color,
    );

  return (
    <main className="min-h-screen bg-background px-3 py-20 font-poppins text-text-secondary">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-text-muted transition hover:text-accent"
        >
          <IoArrowBack />
          Back
        </Link>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="bg-linear-to-r from-accent via-orange-500 to-accent px-4 py-3 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold">
                  Bangladesh Weather
                </p>

                <p className="text-[10px] text-white/80">
                  Location-based update
                </p>
              </div>

              <button
                type="button"
                onClick={detectMyLocation}
                disabled={detectingLocation}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-[10px] font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {detectingLocation ? (
                  <>
                    <InlineLocationLoader />
                    Detecting...
                  </>
                ) : (
                  <>
                    <HiCursorArrowRays className="h-4 w-4" />
                    Detect My Location
                  </>
                )}
              </button>
            </div>

            {locationError && (
              <p className="mt-3 rounded-lg border border-red-300/30 bg-red-500/20 px-3 py-2 text-xs text-white">
                {locationError}
              </p>
            )}

            {myWeather && (
              <div className="mt-3 rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold">
                <HiMiniMapPin className="mr-1 inline text-white" />

                {myWeather.location.city}

                {myWeather.location.region
                  ? `, ${myWeather.location.region}`
                  : ""}

                {`, ${myWeather.location.country}`}
              </div>
            )}
          </div>

          {!myWeather ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <HiCursorArrowRays className="h-7 w-7" />
              </div>

              <h1 className="font-bebasNeue text-4xl tracking-wide text-text-secondary">
                Detect Your Weather
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
                Click the button above and allow
                location permission to see your
                current weather and tour
                suggestion.
              </p>
            </div>
          ) : (
            <>
              <div className="relative bg-linear-to-br from-slate-700 to-slate-900 px-5 py-5 text-white">
                <div>
                  <div className="flex items-end gap-2">
                    <h1 className="text-7xl font-light leading-none">
                      {Math.round(
                        myWeather.current
                          .temperatureC,
                      )}
                      °
                    </h1>

                    <span className="mb-2 text-2xl">
                      C
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold">
                    {
                      myWeather.current
                        .condition
                    }
                  </p>

                  <p className="text-xs text-white/80">
                    Feels like{" "}
                    {Math.round(
                      myWeather.current
                        .feelsLikeC,
                    )}
                    ° · H:
                    {Math.round(
                      myWeather.forecast[0]
                        ?.maxTempC || 0,
                    )}
                    ° L:
                    {Math.round(
                      myWeather.forecast[0]
                        ?.minTempC || 0,
                    )}
                    °
                  </p>

                  <p className="mt-1 text-[11px] text-white/75">
                    {myWeather.location.city},{" "}
                    {
                      myWeather.location
                        .country
                    }{" "}
                    ·{" "}
                    {
                      myWeather.location
                        .timezone
                    }
                  </p>
                </div>

                <div className="absolute top-12 right-8 text-white/90">
                  {getIcon(
                    myWeather.current
                      .condition,
                    "h-16 w-16",
                  )}
                </div>

                <div
                  className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${locationClasses.border} ${locationClasses.bg}`}
                >
                  <span
                    className={
                      locationClasses.text
                    }
                  >
                    {
                      myWeather.suggestion
                        .status
                    }
                    :{" "}
                    {
                      myWeather.suggestion
                        .advice
                    }
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-border p-3 sm:grid-cols-4">
                <MiniMetric
                  label="Humidity"
                  value={`${myWeather.current.humidity}%`}
                />

                <MiniMetric
                  label="Wind"
                  value={`${Math.round(
                    myWeather.current.windKph,
                  )} km/h`}
                />

                <MiniMetric
                  label="Visibility"
                  value={`${myWeather.current.visibilityKm} km`}
                />

                <MiniMetric
                  label="Pressure"
                  value={`${myWeather.current.pressureMb} mb`}
                />
              </div>

              <div className="px-4 py-3">
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>Cloud Cover</span>
                  <span>
                    {
                      myWeather.current
                        .cloud
                    }
                    %
                  </span>
                </div>

                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          myWeather.current
                            .cloud,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                  <p className="text-[10px] text-text-muted">
                    Sunrise
                  </p>

                  <p className="text-sm font-bold text-text-secondary">
                    {
                      myWeather.astro
                        .sunrise
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
                  <p className="text-[10px] text-text-muted">
                    Sunset
                  </p>

                  <p className="text-sm font-bold text-text-secondary">
                    {
                      myWeather.astro
                        .sunset
                    }
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Hourly
                </p>

                {myWeather.hourly.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {myWeather.hourly.map(
                      (hour) => (
                        <div
                          key={hour.time}
                          className="rounded-xl border border-border bg-surface-secondary p-2 text-center"
                        >
                          <p className="text-[10px] text-text-muted">
                            {formatTime(
                              hour.time,
                            )}
                          </p>

                          <div className="my-1 flex justify-center text-accent">
                            {getIcon(
                              hour.condition,
                              "h-4 w-4",
                            )}
                          </div>

                          <p className="text-sm font-bold text-text-secondary">
                            {Math.round(
                              hour.temperatureC,
                            )}
                            °
                          </p>

                          <p className="text-[9px] text-blue-500">
                            {
                              hour.chanceOfRain
                            }
                            %
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="rounded-xl border border-border bg-surface-secondary p-4 text-center text-xs text-text-muted">
                    Hourly weather is not
                    available.
                  </p>
                )}
              </div>

              <div className="px-4 pb-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Forecast
                </p>

                <div className="space-y-2">
                  {myWeather.forecast.map(
                    (day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-accent">
                            {getIcon(
                              day.condition,
                              "h-5 w-5",
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-text-secondary">
                              {formatDay(
                                day.date,
                              )}
                            </p>

                            <p className="text-[10px] text-text-muted">
                              {
                                day.condition
                              }
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-text-secondary">
                            {Math.round(
                              day.maxTempC,
                            )}
                            ° /{" "}
                            {Math.round(
                              day.minTempC,
                            )}
                            °
                          </p>

                          <p className="text-[10px] text-blue-500">
                            Rain{" "}
                            {
                              day.chanceOfRain
                            }
                            %
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-2 border-t border-border px-4 py-3 text-[10px] text-text-muted sm:flex-row">
                <span>
                  <HiMiniMapPin className="mr-1 inline text-red-500" />

                  {
                    myWeather.location
                      .city
                  }
                  ,{" "}
                  {
                    myWeather.location
                      .country
                  }
                </span>

                <span>
                  {
                    myWeather.current
                      .lastUpdated
                  }
                </span>
              </div>
            </>
          )}
        </section>

        <section
          id="district-weather-results"
          className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-surface p-4 shadow-xl"
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bebasNeue text-4xl tracking-wide text-text-secondary">
                64 Districts
              </h2>

              <p className="text-xs text-text-muted">
                Quick district weather and
                tour status
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <HiMagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />

                <input
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(
                      event.target.value,
                    );

                    setSearchError("");
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleSearch();
                    }
                  }}
                  placeholder="Search district..."
                  className="w-full rounded-full border border-input-border bg-input-bg py-2 pr-3 pl-9 text-xs text-text-secondary outline-none placeholder:text-text-muted focus:border-accent sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="cursor-pointer rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent/90"
              >
                Search
              </button>

              <button
                type="button"
                onClick={clearSearch}
                className="cursor-pointer rounded-full border border-border bg-surface-secondary px-4 py-2 text-xs font-bold text-text-muted transition hover:border-accent hover:text-accent"
              >
                Clear
              </button>
            </div>
          </div>

          <AnimatePresence>
            {searchError && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-500"
              >
                {searchError}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mb-4 flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatusFilter(filter);
                  setSearchError("");
                }}
                className={`cursor-pointer rounded-full px-3 py-1 text-[10px] font-bold transition ${
                  statusFilter === filter
                    ? "bg-accent text-white"
                    : "border border-border bg-surface-secondary text-text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {filter === "all"
                  ? "All"
                  : filter}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {divisionNames.map(
              (division) => (
                <div key={division}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-secondary">
                      {division}
                    </h3>

                    <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent">
                      {
                        groupedDistricts[
                          division
                        ].length
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedDistricts[
                      division
                    ].map((district) => {
                      const colors =
                        getStatusClasses(
                          district
                            .suggestion
                            ?.color,
                        );

                      return (
                        <motion.div
                          key={district.id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          className="rounded-xl border border-border bg-surface-secondary p-3 transition hover:border-accent/40 hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-text-secondary">
                                {
                                  district.name
                                }
                              </p>

                              <p className="text-[10px] text-text-muted">
                                {district
                                  .weather
                                  ?.condition ||
                                  "Weather unavailable"}
                              </p>
                            </div>

                            <div
                              className={
                                colors.text
                              }
                            >
                              {getIcon(
                                district
                                  .weather
                                  ?.condition,
                                "h-5 w-5",
                              )}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-background/60 p-2">
                              <p className="text-[9px] text-text-muted">
                                Temp
                              </p>

                              <p className="text-xs font-bold text-text-secondary">
                                {district.weather
                                  ? `${Math.round(
                                      district
                                        .weather
                                        .temperature,
                                    )}°`
                                  : "--"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-background/60 p-2">
                              <p className="text-[9px] text-text-muted">
                                Wind
                              </p>

                              <p className="text-xs font-bold text-text-secondary">
                                {district.weather
                                  ? `${Math.round(
                                      district
                                        .weather
                                        .windSpeed,
                                    )}`
                                  : "--"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-background/60 p-2">
                              <p className="text-[9px] text-text-muted">
                                UV
                              </p>

                              <p className="text-xs font-bold text-text-secondary">
                                {district
                                  .weather
                                  ?.uv ?? "--"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`mt-3 rounded-full border px-3 py-1 text-center text-[10px] font-bold ${colors.bg} ${colors.border} ${colors.text}`}
                          >
                            {district
                              .suggestion
                              ?.status ||
                              "N/A"}
                          </div>

                          <p className="mt-3 line-clamp-2 text-[10px] leading-relaxed text-text-muted">
                            {
                              district
                                .tourType
                            }
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}

            {!filteredDistricts.length && (
              <div className="rounded-xl border border-border bg-surface-secondary p-8 text-center">
                <HiMiniCloud className="mx-auto mb-3 h-10 w-10 text-text-muted/40" />

                <p className="text-sm font-semibold text-text-secondary">
                  No districts found
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Try another search or clear
                  the selected filters.
                </p>
              </div>
            )}
          </div>

          {districtData?.updatedAt && (
            <p className="mt-6 border-t border-border pt-4 text-center text-[10px] text-text-muted">
              Updated{" "}
              {new Date(
                districtData.updatedAt,
              ).toLocaleString()}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}