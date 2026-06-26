import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

type WeatherApiForecastResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
    air_quality?: {
      co?: number;
      no2?: number;
      o3?: number;
      so2?: number;
      pm2_5?: number;
      pm10?: number;
      "us-epa-index"?: number;
      "gb-defra-index"?: number;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        avgvis_km: number;
        avghumidity: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        feelslike_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_kph: number;
        humidity: number;
        cloud: number;
        chance_of_rain: number;
        precip_mm: number;
        uv: number;
      }>;
    }>;
  };
};

function getClientIp(request: NextRequest) {
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const trueClientIp = request.headers.get("true-client-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const vercelIp = request.headers.get("x-vercel-forwarded-for");

  const ip =
    cloudflareIp ||
    trueClientIp ||
    forwardedFor?.split(",")[0]?.trim() ||
    vercelIp?.split(",")[0]?.trim() ||
    realIp ||
    "";

  if (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return null;
  }

  return ip;
}

function getAirQualityText(index?: number) {
  switch (index) {
    case 1:
      return "Good";
    case 2:
      return "Moderate";
    case 3:
      return "Sensitive";
    case 4:
      return "Unhealthy";
    case 5:
      return "Very Unhealthy";
    case 6:
      return "Hazardous";
    default:
      return "N/A";
  }
}

function getTripSuggestion({
  temp,
  condition,
  wind,
  precip,
  uv,
  visibility,
}: {
  temp: number;
  condition: string;
  wind: number;
  precip: number;
  uv: number;
  visibility: number;
}) {
  const text = condition.toLowerCase();

  if (
    text.includes("thunder") ||
    text.includes("storm") ||
    text.includes("heavy rain") ||
    text.includes("torrential")
  ) {
    return {
      status: "Avoid Trip",
      color: "red",
      advice: "Bad weather for outdoor tours. Better stay safe today.",
    };
  }

  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    precip > 3 ||
    wind > 30 ||
    visibility < 4
  ) {
    return {
      status: "Be Careful",
      color: "yellow",
      advice: "Possible trip, but carry rain gear and keep a backup plan.",
    };
  }

  if (temp > 33 || uv >= 8) {
    return {
      status: "Too Hot",
      color: "orange",
      advice: "Avoid noon. Carry water, cap, saline, and sunscreen.",
    };
  }

  if (temp >= 18 && temp <= 31 && wind <= 22) {
    return {
      status: "Good for Trip",
      color: "green",
      advice: "Nice weather for a short tour or outdoor activity.",
    };
  }

  return {
    status: "Okay",
    color: "blue",
    advice: "Weather is manageable. Check again before leaving.",
  };
}

function buildWeatherUrl(query: string, days: number) {
  return `https://api.weatherapi.com/v1/forecast.json?key=${
    env.WEATHERAPI_KEY
  }&q=${encodeURIComponent(query)}&days=${days}&aqi=yes&alerts=no`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const explicitQuery = searchParams.get("q");
    const clientIp = getClientIp(request);
    const query = explicitQuery || clientIp || "Dhaka";

    let res = await fetch(buildWeatherUrl(query, 7), {
      next: { revalidate: 900 },
    });

    // WeatherAPI free plan may not allow 7 days. Retry with 3 days.
    if (!res.ok) {
      res = await fetch(buildWeatherUrl(query, 3), {
        next: { revalidate: 900 },
      });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch WeatherAPI data" },
        { status: 500 },
      );
    }

    const data = (await res.json()) as WeatherApiForecastResponse;

    const suggestion = getTripSuggestion({
      temp: data.current.temp_c,
      condition: data.current.condition.text,
      wind: data.current.wind_kph,
      precip: data.current.precip_mm,
      uv: data.current.uv,
      visibility: data.current.vis_km,
    });

    const epaIndex = data.current.air_quality?.["us-epa-index"];

    const allHours = data.forecast.forecastday.flatMap((day) => day.hour);
    const upcomingHours = allHours
      .filter((hour) => hour.time_epoch >= data.current.last_updated_epoch)
      .slice(0, 8)
      .map((hour) => ({
        time: hour.time,
        temperatureC: hour.temp_c,
        feelsLikeC: hour.feelslike_c,
        condition: hour.condition.text,
        icon: hour.condition.icon,
        windKph: hour.wind_kph,
        humidity: hour.humidity,
        cloud: hour.cloud,
        chanceOfRain: hour.chance_of_rain,
        precipMm: hour.precip_mm,
        uv: hour.uv,
      }));

    const forecastDays = data.forecast.forecastday.map((day) => ({
      date: day.date,
      maxTempC: day.day.maxtemp_c,
      minTempC: day.day.mintemp_c,
      avgTempC: day.day.avgtemp_c,
      condition: day.day.condition.text,
      icon: day.day.condition.icon,
      chanceOfRain: day.day.daily_chance_of_rain,
      maxWindKph: day.day.maxwind_kph,
      totalPrecipMm: day.day.totalprecip_mm,
      avgHumidity: day.day.avghumidity,
      avgVisibilityKm: day.day.avgvis_km,
      uv: day.day.uv,
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      moonPhase: day.astro.moon_phase,
    }));

    return NextResponse.json({
      source: explicitQuery
        ? "manual"
        : clientIp
          ? "ip"
          : "fallback",
      detectedIp: clientIp,
      location: {
        city: data.location.name,
        region: data.location.region,
        country: data.location.country,
        latitude: data.location.lat,
        longitude: data.location.lon,
        timezone: data.location.tz_id,
        localtime: data.location.localtime,
      },
      current: {
        lastUpdated: data.current.last_updated,
        temperatureC: data.current.temp_c,
        temperatureF: data.current.temp_f,
        feelsLikeC: data.current.feelslike_c,
        feelsLikeF: data.current.feelslike_f,
        isDay: data.current.is_day === 1,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        windKph: data.current.wind_kph,
        windMph: data.current.wind_mph,
        windDegree: data.current.wind_degree,
        windDirection: data.current.wind_dir,
        gustKph: data.current.gust_kph,
        pressureMb: data.current.pressure_mb,
        precipitationMm: data.current.precip_mm,
        humidity: data.current.humidity,
        cloud: data.current.cloud,
        visibilityKm: data.current.vis_km,
        uv: data.current.uv,
      },
      airQuality: {
        pm25: data.current.air_quality?.pm2_5 ?? null,
        pm10: data.current.air_quality?.pm10 ?? null,
        co: data.current.air_quality?.co ?? null,
        no2: data.current.air_quality?.no2 ?? null,
        o3: data.current.air_quality?.o3 ?? null,
        so2: data.current.air_quality?.so2 ?? null,
        usEpaIndex: epaIndex ?? null,
        text: getAirQualityText(epaIndex),
      },
      astro: {
        sunrise: forecastDays[0]?.sunrise || "N/A",
        sunset: forecastDays[0]?.sunset || "N/A",
      },
      hourly: upcomingHours,
      forecast: forecastDays,
      suggestion,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("WeatherAPI error:", error);

    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 },
    );
  }
}