import { VALID_REGIONS } from "../constants";

// Australian states mapping
export const AUSTRALIAN_STATES = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory"
} as const;

// State to region mapping
export const STATE_TO_REGION_MAP = {
  NSW: ["Sydney Metro", "Regional NSW"],
  VIC: ["Melbourne Metro", "Regional VIC"],
  QLD: ["Brisbane Metro", "Regional QLD"],
  WA: ["Perth Metro", "Regional WA"],
  SA: ["Adelaide Metro", "Regional SA"],
  TAS: ["Hobart Metro", "Regional TAS"],
  NT: ["Darwin Metro", "Regional NT"],
  ACT: ["Canberra Metro"]
} as const;

// Metro areas for each state
const METRO_AREAS = {
  NSW: ["sydney", "newcastle", "wollongong", "central coast"],
  VIC: ["melbourne", "geelong", "ballarat", "bendigo"],
  QLD: ["brisbane", "gold coast", "sunshine coast", "cairns", "townsville"],
  WA: ["perth", "fremantle", "mandurah"],
  SA: ["adelaide", "mount gambier"],
  TAS: ["hobart", "launceston"],
  NT: ["darwin", "alice springs"],
  ACT: ["canberra"]
};

/**
 * Normalize state to uppercase format
 */
export const normalizeState = (state: string): string => {
  if (!state) return "";
  return state.toUpperCase().trim();
};

/**
 * Get full state name from abbreviation
 */
export const getFullStateName = (stateAbbr: string): string => {
  const normalized = normalizeState(stateAbbr);
  return AUSTRALIAN_STATES[normalized as keyof typeof AUSTRALIAN_STATES] || normalized;
};

/**
 * Determine if a suburb is in a metro area
 */
export const isMetroArea = (state: string, suburb: string): boolean => {
  if (!state || !suburb) return false;

  const normalizedState = normalizeState(state);
  const normalizedSuburb = suburb.toLowerCase().trim();

  const metroAreas = METRO_AREAS[normalizedState as keyof typeof METRO_AREAS];
  if (!metroAreas) return false;

  return metroAreas.some(metro => normalizedSuburb.includes(metro));
};

/**
 * Get region from state and suburb
 */
export const getRegionFromStateAndSuburb = (state: string, suburb: string): string => {
  if (!state) return "";

  const normalizedState = normalizeState(state);

  // Handle ACT specially
  if (normalizedState === "ACT") {
    return "Canberra Metro";
  }

  // Check if it's a metro area
  if (isMetroArea(normalizedState, suburb)) {
    switch (normalizedState) {
      case "NSW": return "Sydney Metro";
      case "VIC": return "Melbourne Metro";
      case "QLD": return "Brisbane Metro";
      case "WA": return "Perth Metro";
      case "SA": return "Adelaide Metro";
      case "TAS": return "Hobart Metro";
      case "NT": return "Darwin Metro";
      default: return `Regional ${normalizedState}`;
    }
  }

  // Default to regional
  return `Regional ${normalizedState}`;
};

/**
 * Get all regions for a state
 */
export const getRegionsForState = (state: string): string[] => {
  const normalizedState = normalizeState(state);
  const regions = STATE_TO_REGION_MAP[normalizedState as keyof typeof STATE_TO_REGION_MAP];
  return regions ? [...regions] : [];
};

/**
 * Get state from region
 */
export const getStateFromRegion = (region: string): string => {
  if (!region) return "";

  // Handle metro regions
  if (region.includes("Metro")) {
    if (region.includes("Sydney")) return "NSW";
    if (region.includes("Melbourne")) return "VIC";
    if (region.includes("Brisbane")) return "QLD";
    if (region.includes("Perth")) return "WA";
    if (region.includes("Adelaide")) return "SA";
    if (region.includes("Hobart")) return "TAS";
    if (region.includes("Darwin")) return "NT";
    if (region.includes("Canberra")) return "ACT";
  }

  // Handle regional areas
  if (region.includes("Regional")) {
    return region.replace("Regional ", "");
  }

  return "";
};

/**
 * Group regions by state
 */
export const getRegionsByState = (): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  Object.entries(STATE_TO_REGION_MAP).forEach(([state, regions]) => {
    grouped[state] = [...regions];
  });

  return grouped;
};

/**
 * Get all unique states from the system
 */
export const getAllStates = (): string[] => {
  return Object.keys(AUSTRALIAN_STATES);
};

/**
 * Validate if a region is valid
 */
export const isValidRegion = (region: string): boolean => {
  return VALID_REGIONS.includes(region as any);
};

/**
 * Get display name for region selector
 */
export const getRegionDisplayName = (region: string): { name: string; state: string; type: 'metro' | 'regional' } => {
  const state = getStateFromRegion(region);
  const isMetro = region.includes("Metro");

  return {
    name: region,
    state: state,
    type: isMetro ? 'metro' : 'regional'
  };
};

/**
 * Filter and normalize address data for consistent state handling
 */
export const normalizeAddressData = (address: any): { normalizedState: string; region: string } => {
  if (!address || !address.state) {
    return { normalizedState: "", region: "" };
  }

  const normalizedState = normalizeState(address.state);
  const region = getRegionFromStateAndSuburb(normalizedState, address.suburb || "");

  return { normalizedState, region };
};