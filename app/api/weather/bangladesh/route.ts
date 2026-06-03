import { NextResponse } from "next/server";

type OpenMeteoResponse = {
  current?: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day?: number;
  };
};

function getWeatherText(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([85, 86].includes(code)) return "Snow Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function getTripSuggestion(temp: number, code: number, wind: number) {
  const weather = getWeatherText(code);

  if ([95, 96, 99].includes(code)) {
    return {
      status: "Not Recommended",
      color: "red",
      advice:
        "Thunderstorm conditions are risky for trekking or long outdoor tours. Avoid trips today.",
    };
  }

  if ([61, 63, 65, 80, 81, 82].includes(code) || wind > 28) {
    return {
      status: "Use Caution",
      color: "yellow",
      advice:
        "Rain or strong wind may affect trail safety. A short local trip may be okay with proper gear.",
    };
  }

  if (temp >= 18 && temp <= 31 && code <= 3 && wind <= 20) {
    return {
      status: "Great For Trip",
      color: "green",
      advice:
        "The weather looks comfortable for travel and outdoor activities in Bangladesh today.",
    };
  }

  if (temp > 31) {
    return {
      status: "Hot Weather",
      color: "orange",
      advice:
        "Travel is possible, but plan hydration, shade, and avoid heavy trekking during midday.",
    };
  }

  return {
    status: "Moderate",
    color: "blue",
    advice:
      "Conditions are manageable, but check route-specific forecasts before leaving.",
  };
}

export async function GET() {
  try {
    // Dhaka coordinates
    const lat = 23.8103;
    const lon = 90.4125;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day`;

    const res = await fetch(url, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather data" },
        { status: 500 },
      );
    }

    const data = (await res.json()) as OpenMeteoResponse;

    const temp = data.current?.temperature_2m ?? 0;
    const code = data.current?.weather_code ?? -1;
    const wind = data.current?.wind_speed_10m ?? 0;

    const condition = getWeatherText(code);
    const suggestion = getTripSuggestion(temp, code, wind);

    return NextResponse.json({
      city: "Dhaka, Bangladesh",
      temperature: temp,
      condition,
      windSpeed: wind,
      suggestion,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 },
    );
  }
}