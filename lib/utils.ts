export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
    }
  };

  inputs.forEach(walk);

  return classes.join(" ").replace(/\s+/g, " ").trim();
}