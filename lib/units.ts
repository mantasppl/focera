export type UnitCategoryId =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "area"
  | "speed"
  | "data";

export type UnitDefinition = {
  id: string;
  label: string;
  symbol: string;
  /** Multiplier to the category base unit (unused for temperature). */
  toBase: number;
};

export type UnitCategory = {
  id: UnitCategoryId;
  label: string;
  description: string;
  units: UnitDefinition[];
  defaultFrom: string;
  defaultTo: string;
};

const lengthUnits: UnitDefinition[] = [
  { id: "m", label: "Meters", symbol: "m", toBase: 1 },
  { id: "km", label: "Kilometers", symbol: "km", toBase: 1000 },
  { id: "cm", label: "Centimeters", symbol: "cm", toBase: 0.01 },
  { id: "mm", label: "Millimeters", symbol: "mm", toBase: 0.001 },
  { id: "mi", label: "Miles", symbol: "mi", toBase: 1609.344 },
  { id: "yd", label: "Yards", symbol: "yd", toBase: 0.9144 },
  { id: "ft", label: "Feet", symbol: "ft", toBase: 0.3048 },
  { id: "in", label: "Inches", symbol: "in", toBase: 0.0254 },
  { id: "nmi", label: "Nautical miles", symbol: "nmi", toBase: 1852 },
];

const weightUnits: UnitDefinition[] = [
  { id: "kg", label: "Kilograms", symbol: "kg", toBase: 1 },
  { id: "g", label: "Grams", symbol: "g", toBase: 0.001 },
  { id: "mg", label: "Milligrams", symbol: "mg", toBase: 0.000001 },
  { id: "t", label: "Metric tons", symbol: "t", toBase: 1000 },
  { id: "lb", label: "Pounds", symbol: "lb", toBase: 0.45359237 },
  { id: "oz", label: "Ounces", symbol: "oz", toBase: 0.028349523125 },
  { id: "st", label: "Stone", symbol: "st", toBase: 6.35029318 },
];

const temperatureUnits: UnitDefinition[] = [
  { id: "c", label: "Celsius", symbol: "°C", toBase: 1 },
  { id: "f", label: "Fahrenheit", symbol: "°F", toBase: 1 },
  { id: "k", label: "Kelvin", symbol: "K", toBase: 1 },
];

const volumeUnits: UnitDefinition[] = [
  { id: "l", label: "Liters", symbol: "L", toBase: 1 },
  { id: "ml", label: "Milliliters", symbol: "mL", toBase: 0.001 },
  { id: "m3", label: "Cubic meters", symbol: "m³", toBase: 1000 },
  { id: "gal", label: "US gallons", symbol: "gal", toBase: 3.785411784 },
  { id: "qt", label: "US quarts", symbol: "qt", toBase: 0.946352946 },
  { id: "pt", label: "US pints", symbol: "pt", toBase: 0.473176473 },
  { id: "cup", label: "US cups", symbol: "cup", toBase: 0.2365882365 },
  { id: "floz", label: "US fluid ounces", symbol: "fl oz", toBase: 0.0295735295625 },
  { id: "igal", label: "Imperial gallons", symbol: "imp gal", toBase: 4.54609 },
  { id: "ft3", label: "Cubic feet", symbol: "ft³", toBase: 28.316846592 },
  { id: "in3", label: "Cubic inches", symbol: "in³", toBase: 0.016387064 },
];

const areaUnits: UnitDefinition[] = [
  { id: "m2", label: "Square meters", symbol: "m²", toBase: 1 },
  { id: "km2", label: "Square kilometers", symbol: "km²", toBase: 1_000_000 },
  { id: "cm2", label: "Square centimeters", symbol: "cm²", toBase: 0.0001 },
  { id: "ha", label: "Hectares", symbol: "ha", toBase: 10_000 },
  { id: "acre", label: "Acres", symbol: "ac", toBase: 4046.8564224 },
  { id: "mi2", label: "Square miles", symbol: "mi²", toBase: 2_589_988.110336 },
  { id: "ft2", label: "Square feet", symbol: "ft²", toBase: 0.09290304 },
  { id: "yd2", label: "Square yards", symbol: "yd²", toBase: 0.83612736 },
  { id: "in2", label: "Square inches", symbol: "in²", toBase: 0.00064516 },
];

const speedUnits: UnitDefinition[] = [
  { id: "mps", label: "Meters per second", symbol: "m/s", toBase: 1 },
  { id: "kph", label: "Kilometers per hour", symbol: "km/h", toBase: 1 / 3.6 },
  { id: "mph", label: "Miles per hour", symbol: "mph", toBase: 0.44704 },
  { id: "fps", label: "Feet per second", symbol: "ft/s", toBase: 0.3048 },
  { id: "kn", label: "Knots", symbol: "kn", toBase: 0.514444 },
];

const dataUnits: UnitDefinition[] = [
  { id: "bit", label: "Bits", symbol: "bit", toBase: 1 / 8 },
  { id: "B", label: "Bytes", symbol: "B", toBase: 1 },
  { id: "KB", label: "Kilobytes", symbol: "KB", toBase: 1024 },
  { id: "MB", label: "Megabytes", symbol: "MB", toBase: 1024 ** 2 },
  { id: "GB", label: "Gigabytes", symbol: "GB", toBase: 1024 ** 3 },
  { id: "TB", label: "Terabytes", symbol: "TB", toBase: 1024 ** 4 },
  { id: "PB", label: "Petabytes", symbol: "PB", toBase: 1024 ** 5 },
];

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Length",
    description: "Meters, miles, feet, and more",
    units: lengthUnits,
    defaultFrom: "m",
    defaultTo: "ft",
  },
  {
    id: "weight",
    label: "Weight",
    description: "Kilograms, pounds, ounces",
    units: weightUnits,
    defaultFrom: "kg",
    defaultTo: "lb",
  },
  {
    id: "temperature",
    label: "Temperature",
    description: "Celsius, Fahrenheit, Kelvin",
    units: temperatureUnits,
    defaultFrom: "c",
    defaultTo: "f",
  },
  {
    id: "volume",
    label: "Volume",
    description: "Liters, gallons, cups",
    units: volumeUnits,
    defaultFrom: "l",
    defaultTo: "gal",
  },
  {
    id: "area",
    label: "Area",
    description: "Square meters, acres, hectares",
    units: areaUnits,
    defaultFrom: "m2",
    defaultTo: "ft2",
  },
  {
    id: "speed",
    label: "Speed",
    description: "km/h, mph, knots",
    units: speedUnits,
    defaultFrom: "kph",
    defaultTo: "mph",
  },
  {
    id: "data",
    label: "Data Storage",
    description: "Bytes, MB, GB (1024-based)",
    units: dataUnits,
    defaultFrom: "MB",
    defaultTo: "GB",
  },
];

export function getCategory(id: UnitCategoryId): UnitCategory {
  const category = UNIT_CATEGORIES.find((item) => item.id === id);
  if (!category) {
    throw new Error(`Unknown unit category: ${id}`);
  }
  return category;
}

export function getUnit(
  category: UnitCategory,
  unitId: string,
): UnitDefinition | undefined {
  return category.units.find((unit) => unit.id === unitId);
}

function celsiusFrom(value: number, fromId: string): number {
  switch (fromId) {
    case "c":
      return value;
    case "f":
      return ((value - 32) * 5) / 9;
    case "k":
      return value - 273.15;
    default:
      return Number.NaN;
  }
}

function celsiusTo(celsius: number, toId: string): number {
  switch (toId) {
    case "c":
      return celsius;
    case "f":
      return (celsius * 9) / 5 + 32;
    case "k":
      return celsius + 273.15;
    default:
      return Number.NaN;
  }
}

export function convertValue(
  value: number,
  categoryId: UnitCategoryId,
  fromId: string,
  toId: string,
): number {
  if (!Number.isFinite(value)) return Number.NaN;
  if (fromId === toId) return value;

  if (categoryId === "temperature") {
    return celsiusTo(celsiusFrom(value, fromId), toId);
  }

  const category = getCategory(categoryId);
  const from = getUnit(category, fromId);
  const to = getUnit(category, toId);
  if (!from || !to || from.toBase === 0 || to.toBase === 0) {
    return Number.NaN;
  }

  return (value * from.toBase) / to.toBase;
}

/**
 * Format a converted number for display: trim noise, keep useful precision.
 */
export function formatConvertedValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Object.is(value, -0) || value === 0) return "0";

  const abs = Math.abs(value);
  if (abs < 1e-6 || abs >= 1e12) {
    return Number(value.toPrecision(8)).toExponential();
  }

  const decimals = abs >= 1_000_000 ? 2 : abs >= 1 ? 8 : 10;
  return String(Number(value.toFixed(decimals)));
}

export function parseUnitInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
