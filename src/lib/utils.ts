import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Unit conversion functions
export const unitConversions = {
  // Distance conversions
  kmToMiles: (km: number): number => km * 0.621371,
  milesToKm: (miles: number): number => miles * 1.60934,

  // Elevation conversions
  metersToFeet: (meters: number): number => meters * 3.28084,
  feetToMeters: (feet: number): number => feet * 0.3048,

  // Fluid conversions
  mlToOz: (ml: number): number => ml * 0.033814,
  ozToMl: (oz: number): number => oz * 29.5735,

  // Weight conversions
  gramsToOz: (grams: number): number => grams * 0.035274,
  ozToGrams: (oz: number): number => oz * 28.3495,
};

export type UnitSystem = "metric" | "imperial";

export interface UnitPreferences {
  distance: UnitSystem;
  elevation: UnitSystem;
  fluid: UnitSystem;
  weight: UnitSystem;
}

export const defaultUnitPreferences: UnitPreferences = {
  distance: "metric",
  elevation: "metric",
  fluid: "metric",
  weight: "metric",
};

export const formatDistance = (value: number, unit: UnitSystem): string => {
  if (unit === "imperial") {
    return `${value.toFixed(1)} mi`;
  }
  return `${value.toFixed(1)} km`;
};

export const formatElevation = (value: number, unit: UnitSystem): string => {
  if (unit === "imperial") {
    return `${Math.round(value)} ft`;
  }
  return `${Math.round(value)} m`;
};

export const formatFluid = (value: number, unit: UnitSystem): string => {
  if (unit === "imperial") {
    return `${value.toFixed(1)} oz`;
  }
  return `${value.toFixed(0)} ml`;
};

export const formatWeight = (value: number, unit: UnitSystem): string => {
  if (unit === "imperial") {
    return `${value.toFixed(1)} oz`;
  }
  return `${value.toFixed(0)} g`;
};
