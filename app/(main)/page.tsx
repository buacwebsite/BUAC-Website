import { connection } from "next/server";
import HomeClient from "./HomeClient";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function HomePage() {
  /*
   * This tells Next.js:
   * Do not attempt to statically pre-render this page during build.
   * Render it only after an actual user request arrives.
   *
   * Required because Upstash Redis uses no-store fetch calls.
   */
  await connection();

  const [
    heroImagesResult,
    aboutTextResult,
    statsResult,
    quotesResult,
    visionTextResult,
    objectivesResult,
    sectionOrderResult,
  ] = await Promise.allSettled([
    kv.get<HeroImage[]>("hero-images"),
    kv.get<string>("about:text"),
    kv.get<Stat[]>("about:stats"),
    kv.get<Quote[]>("quotes"),
    kv.get<string>("vision:text"),
    kv.get<Objective[]>("vision:objectives"),
    kv.get<string[]>("home:section-order"),
  ]);

  const heroImages =
    heroImagesResult.status === "fulfilled"
      ? asArray<HeroImage>(heroImagesResult.value)
      : [];

  const aboutText =
    aboutTextResult.status === "fulfilled" &&
    typeof aboutTextResult.value === "string"
      ? aboutTextResult.value
      : "";

  const stats =
    statsResult.status === "fulfilled"
      ? asArray<Stat>(statsResult.value)
      : [];

  const quotes =
    quotesResult.status === "fulfilled"
      ? asArray<Quote>(quotesResult.value)
      : [];

  const visionText =
    visionTextResult.status === "fulfilled" &&
    typeof visionTextResult.value === "string"
      ? visionTextResult.value
      : "";

  const objectives =
    objectivesResult.status === "fulfilled"
      ? asArray<Objective>(objectivesResult.value)
      : [];

  const sectionOrder =
    sectionOrderResult.status === "fulfilled" &&
    Array.isArray(sectionOrderResult.value) &&
    sectionOrderResult.value.length > 0
      ? sectionOrderResult.value
      : defaultSectionOrder;

  return (
    <HomeClient
      initialHeroImages={heroImages}
      initialAboutText={aboutText}
      initialStats={stats}
      initialQuotes={quotes}
      initialVisionText={visionText}
      initialObjectives={objectives}
      initialSectionOrder={sectionOrder}
    />
  );
}