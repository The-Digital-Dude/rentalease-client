export const VALID_REGIONS = [
  'Sydney Metro',
  'Melbourne Metro', 
  'Brisbane Metro',
  'Perth Metro',
  'Adelaide Metro',
  'Darwin Metro',
  'Hobart Metro',
  'Canberra Metro',
  'Regional NSW',
  'Regional VIC',
  'Regional QLD',
  'Regional WA',
  'Regional SA',
  'Regional NT',
  'Regional TAS'
] as const;

export type Region = typeof VALID_REGIONS[number]; 