import { NextResponse } from "next/server";
import { env } from "@/env";

const bangladeshDistricts = [
  // Dhaka Division
  { id: "dhaka", name: "Dhaka", division: "Dhaka", lat: 23.8103, lon: 90.4125 },
  { id: "faridpur", name: "Faridpur", division: "Dhaka", lat: 23.607, lon: 89.842 },
  { id: "gazipur", name: "Gazipur", division: "Dhaka", lat: 23.9999, lon: 90.4203 },
  { id: "gopalganj", name: "Gopalganj", division: "Dhaka", lat: 23.0051, lon: 89.8266 },
  { id: "kishoreganj", name: "Kishoreganj", division: "Dhaka", lat: 24.4449, lon: 90.7766 },
  { id: "madaripur", name: "Madaripur", division: "Dhaka", lat: 23.1641, lon: 90.1897 },
  { id: "manikganj", name: "Manikganj", division: "Dhaka", lat: 23.8617, lon: 90.0003 },
  { id: "munshiganj", name: "Munshiganj", division: "Dhaka", lat: 23.5422, lon: 90.5305 },
  { id: "narayanganj", name: "Narayanganj", division: "Dhaka", lat: 23.6238, lon: 90.5 },
  { id: "narsingdi", name: "Narsingdi", division: "Dhaka", lat: 23.9322, lon: 90.7154 },
  { id: "rajbari", name: "Rajbari", division: "Dhaka", lat: 23.7574, lon: 89.644 },
  { id: "shariatpur", name: "Shariatpur", division: "Dhaka", lat: 23.2423, lon: 90.4348 },
  { id: "tangail", name: "Tangail", division: "Dhaka", lat: 24.2513, lon: 89.9167 },

  // Chattogram Division
  { id: "bandarban", name: "Bandarban", division: "Chattogram", lat: 22.1953, lon: 92.2184 },
  { id: "brahmanbaria", name: "Brahmanbaria", division: "Chattogram", lat: 23.9571, lon: 91.1116 },
  { id: "chandpur", name: "Chandpur", division: "Chattogram", lat: 23.2333, lon: 90.6713 },
  { id: "chattogram", name: "Chattogram", division: "Chattogram", lat: 22.3569, lon: 91.7832 },
  { id: "cumilla", name: "Cumilla", division: "Chattogram", lat: 23.4607, lon: 91.1809 },
  { id: "coxsbazar", name: "Cox's Bazar", division: "Chattogram", lat: 21.4272, lon: 92.0058 },
  { id: "feni", name: "Feni", division: "Chattogram", lat: 23.0159, lon: 91.3976 },
  { id: "khagrachari", name: "Khagrachari", division: "Chattogram", lat: 23.1193, lon: 91.9847 },
  { id: "lakshmipur", name: "Lakshmipur", division: "Chattogram", lat: 22.9447, lon: 90.8282 },
  { id: "noakhali", name: "Noakhali", division: "Chattogram", lat: 22.8246, lon: 91.1017 },
  { id: "rangamati", name: "Rangamati", division: "Chattogram", lat: 22.7324, lon: 92.2985 },

  // Rajshahi Division
  { id: "bogura", name: "Bogura", division: "Rajshahi", lat: 24.8465, lon: 89.3776 },
  { id: "chapainawabganj", name: "Chapai Nawabganj", division: "Rajshahi", lat: 24.5965, lon: 88.2775 },
  { id: "joypurhat", name: "Joypurhat", division: "Rajshahi", lat: 25.1015, lon: 89.0273 },
  { id: "naogaon", name: "Naogaon", division: "Rajshahi", lat: 24.7936, lon: 88.9318 },
  { id: "natore", name: "Natore", division: "Rajshahi", lat: 24.4206, lon: 89.0003 },
  { id: "pabna", name: "Pabna", division: "Rajshahi", lat: 24.0064, lon: 89.2372 },
  { id: "rajshahi", name: "Rajshahi", division: "Rajshahi", lat: 24.3745, lon: 88.6042 },
  { id: "sirajganj", name: "Sirajganj", division: "Rajshahi", lat: 24.4534, lon: 89.7007 },

  // Rangpur Division
  { id: "dinajpur", name: "Dinajpur", division: "Rangpur", lat: 25.6279, lon: 88.6332 },
  { id: "gaibandha", name: "Gaibandha", division: "Rangpur", lat: 25.3297, lon: 89.543 },
  { id: "kurigram", name: "Kurigram", division: "Rangpur", lat: 25.8054, lon: 89.6362 },
  { id: "lalmonirhat", name: "Lalmonirhat", division: "Rangpur", lat: 25.9923, lon: 89.2847 },
  { id: "nilphamari", name: "Nilphamari", division: "Rangpur", lat: 25.931, lon: 88.856 },
  { id: "panchagarh", name: "Panchagarh", division: "Rangpur", lat: 26.3354, lon: 88.5517 },
  { id: "rangpur", name: "Rangpur", division: "Rangpur", lat: 25.7439, lon: 89.2752 },
  { id: "thakurgaon", name: "Thakurgaon", division: "Rangpur", lat: 26.0337, lon: 88.4617 },

  // Khulna Division
  { id: "bagerhat", name: "Bagerhat", division: "Khulna", lat: 22.6602, lon: 89.7895 },
  { id: "chuadanga", name: "Chuadanga", division: "Khulna", lat: 23.6402, lon: 88.8418 },
  { id: "jashore", name: "Jashore", division: "Khulna", lat: 23.1667, lon: 89.2167 },
  { id: "jhenaidah", name: "Jhenaidah", division: "Khulna", lat: 23.545, lon: 89.1726 },
  { id: "khulna", name: "Khulna", division: "Khulna", lat: 22.8456, lon: 89.5403 },
  { id: "kushtia", name: "Kushtia", division: "Khulna", lat: 23.9013, lon: 89.1206 },
  { id: "magura", name: "Magura", division: "Khulna", lat: 23.4855, lon: 89.4198 },
  { id: "meherpur", name: "Meherpur", division: "Khulna", lat: 23.7622, lon: 88.6318 },
  { id: "narail", name: "Narail", division: "Khulna", lat: 23.1725, lon: 89.5127 },
  { id: "satkhira", name: "Satkhira", division: "Khulna", lat: 22.7185, lon: 89.0705 },

  // Barishal Division
  { id: "barguna", name: "Barguna", division: "Barishal", lat: 22.1596, lon: 90.1264 },
  { id: "barishal", name: "Barishal", division: "Barishal", lat: 22.701, lon: 90.3535 },
  { id: "bhola", name: "Bhola", division: "Barishal", lat: 22.6859, lon: 90.6482 },
  { id: "jhalokati", name: "Jhalokati", division: "Barishal", lat: 22.6406, lon: 90.1987 },
  { id: "patuakhali", name: "Patuakhali", division: "Barishal", lat: 22.3596, lon: 90.3299 },
  { id: "pirojpur", name: "Pirojpur", division: "Barishal", lat: 22.5841, lon: 89.972 },

  // Sylhet Division
  { id: "habiganj", name: "Habiganj", division: "Sylhet", lat: 24.3745, lon: 91.4155 },
  { id: "moulvibazar", name: "Moulvibazar", division: "Sylhet", lat: 24.4829, lon: 91.7774 },
  { id: "sunamganj", name: "Sunamganj", division: "Sylhet", lat: 25.0658, lon: 91.395 },
  { id: "sylhet", name: "Sylhet", division: "Sylhet", lat: 24.8949, lon: 91.8687 },

  // Mymensingh Division
  { id: "jamalpur", name: "Jamalpur", division: "Mymensingh", lat: 24.9375, lon: 89.937 },
  { id: "mymensingh", name: "Mymensingh", division: "Mymensingh", lat: 24.7471, lon: 90.4203 },
  { id: "netrokona", name: "Netrokona", division: "Mymensingh", lat: 24.8709, lon: 90.7279 },
  { id: "sherpur", name: "Sherpur", division: "Mymensingh", lat: 25.0205, lon: 90.0153 },
];

type District = (typeof bangladeshDistricts)[number];

type WeatherApiCurrentResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    precip_mm: number;
    uv: number;
  };
};

function getTourType(district: District) {
  const special: Record<string, string> = {
    bandarban: "Hill trekking, waterfalls, camping, mountain trails",
    rangamati: "Lake tour, kayaking, hill view, nature retreat",
    khagrachari: "Hill trails, waterfalls, caves, adventure hiking",
    coxsbazar: "Beach tour, marine drive, camping, coastal walk",
    chattogram: "Hill-beach mixed trip, Sitakunda, Patenga, day hiking",
    sylhet: "Tea gardens, waterfalls, forest trails",
    moulvibazar: "Sreemangal tea gardens, Lawachara forest, cycling",
    sunamganj: "Tanguar Haor, boat trip, wetland adventure",
    bagerhat: "Heritage tour, Sundarbans gateway, river route",
    khulna: "Sundarbans gateway, river cruise, mangrove trip",
    satkhira: "Sundarbans route, mangrove forest, river trip",
    dhaka: "Urban meetup, club activity, trip planning, day outing",
    rajshahi: "Heritage tour, Padma river, cycling, mango trail",
    dinajpur: "Heritage trip, Ramsagar, countryside tour",
    panchagarh: "Himalayan view, tea gardens, northern adventure",
  };

  if (special[district.id]) return special[district.id];

  switch (district.division) {
    case "Chattogram":
      return "Hill, beach, waterfall, and eco-tour route";
    case "Sylhet":
      return "Tea garden, haor, waterfall, and forest trip";
    case "Khulna":
      return "River, mangrove, heritage, and nature tour";
    case "Barishal":
      return "River cruise, coastal trip, and floating market route";
    case "Rajshahi":
      return "Heritage, river, cycling, and countryside trip";
    case "Rangpur":
      return "Northern countryside, heritage, and winter travel";
    case "Mymensingh":
      return "Forest, river, countryside, and day trip";
    default:
      return "Day trip, club activity, outdoor planning";
  }
}

function getSuggestion({
  temp,
  condition,
  wind,
  humidity,
  precip,
  uv,
  tourType,
}: {
  temp: number;
  condition: string;
  wind: number;
  humidity: number;
  precip: number;
  uv: number;
  tourType: string;
}) {
  const text = condition.toLowerCase();

  if (
    text.includes("thunder") ||
    text.includes("storm") ||
    text.includes("torrential")
  ) {
    return {
      status: "Avoid",
      color: "red",
      advice: `Not safe for ${tourType.toLowerCase()} due to storm risk. Avoid outdoor trips.`,
    };
  }

  if (
    text.includes("heavy rain") ||
    text.includes("rain") ||
    text.includes("drizzle") ||
    precip > 3 ||
    wind > 30
  ) {
    return {
      status: "Caution",
      color: "yellow",
      advice: `${tourType} is possible only with rain protection, waterproof bags, and backup transport.`,
    };
  }

  if (temp > 33 || uv >= 8) {
    return {
      status: "Hot",
      color: "orange",
      advice: `${tourType} is possible, but avoid midday heat. Carry water, saline, sunscreen, and head cover.`,
    };
  }

  if (temp >= 18 && temp <= 31 && humidity <= 82 && wind <= 24) {
    return {
      status: "Recommended",
      color: "green",
      advice: `Good conditions for ${tourType.toLowerCase()}. Still check local safety updates before leaving.`,
    };
  }

  return {
    status: "Moderate",
    color: "blue",
    advice: `${tourType} can be planned with basic precautions and local weather checking.`,
  };
}

async function fetchDistrictWeather(district: District) {
  const query = `${district.lat},${district.lon}`;

  const url = `https://api.weatherapi.com/v1/current.json?key=${
    env.WEATHERAPI_KEY
  }&q=${encodeURIComponent(query)}&aqi=no`;

  const res = await fetch(url, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    return {
      ...district,
      tourType: getTourType(district),
      error: true,
    };
  }

  const data = (await res.json()) as WeatherApiCurrentResponse;
  const tourType = getTourType(district);

  const suggestion = getSuggestion({
    temp: data.current.temp_c,
    condition: data.current.condition.text,
    wind: data.current.wind_kph,
    humidity: data.current.humidity,
    precip: data.current.precip_mm,
    uv: data.current.uv,
    tourType,
  });

  return {
    ...district,
    tourType,
    weather: {
      temperature: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      condition: data.current.condition.text,
      windSpeed: data.current.wind_kph,
      humidity: data.current.humidity,
      precipMm: data.current.precip_mm,
      uv: data.current.uv,
      localtime: data.location.localtime,
    },
    suggestion,
  };
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let index = 0;

  async function runner() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: limit }, runner));
  return results;
}

export async function GET() {
  try {
    const results = await runWithConcurrency(
      bangladeshDistricts,
      8,
      fetchDistrictWeather,
    );

    return NextResponse.json({
      country: "Bangladesh",
      totalDistricts: bangladeshDistricts.length,
      updatedAt: new Date().toISOString(),
      locations: results,
    });
  } catch (error) {
    console.error("Bangladesh district weather error:", error);

    return NextResponse.json(
      { error: "Failed to fetch Bangladesh district weather data" },
      { status: 500 },
    );
  }
}