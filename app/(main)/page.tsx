import HomeClient from "./HomeClient";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

interface Quote {
  name: string;
  designation: string;
  quote: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Objective {
  title: string;
  description: string;
}

interface HeroImage {
  place: string;
  image: string;
  description?: string;
  country?: string;
  tag?: string;
  id?: string;
}

const defaultSectionOrder = ["about", "campfire", "vision"];

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function HomePage() {
  const [
    heroImages,
    aboutText,
    stats,
    quotes,
    visionText,
    objectives,
    sectionOrder,
  ] = await Promise.all([
    kv.get<HeroImage[]>("hero-images"),
    kv.get<string>("about:text"),
    kv.get<Stat[]>("about:stats"),
    kv.get<Quote[]>("quotes"),
    kv.get<string>("vision:text"),
    kv.get<Objective[]>("vision:objectives"),
    kv.get<string[]>("home:section-order"),
  ]);

  return (
    <HomeClient
      initialHeroImages={normalizeArray<HeroImage>(heroImages)}
      initialAboutText={typeof aboutText === "string" ? aboutText : ""}
      initialStats={normalizeArray<Stat>(stats)}
      initialQuotes={normalizeArray<Quote>(quotes)}
      initialVisionText={typeof visionText === "string" ? visionText : ""}
      initialObjectives={normalizeArray<Objective>(objectives)}
      initialSectionOrder={
        Array.isArray(sectionOrder) && sectionOrder.length
          ? sectionOrder
          : defaultSectionOrder
      }
    />
  );
}