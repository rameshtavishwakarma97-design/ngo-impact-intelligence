import fs from 'fs';

const distData = JSON.parse(fs.readFileSync('public/geo/operating-districts.geojson', 'utf8'));
const statesData = JSON.parse(fs.readFileSync('public/geo/operating-states.geojson', 'utf8'));
const presets = JSON.parse(fs.readFileSync('src/data/geoPresets.json', 'utf8'));

presets.all_india = {
  id: 'all_india',
  name: 'All States (3)',
  center: [77.5, 18.5],
  bbox: [72.6, 8.0, 82.9, 26.9],
  zoom: 5.1,
  pitch: 0,
  bearing: 0,
};

const tsHeader = `// ─── REAL INDIA DISTRICT & STATE GEOJSON (ZERO HAND-DRAWN OCTAGONS) ─────────────
// Sourced from udit-001/india-maps-data via jsDelivr CDN.
// Cleanly extracted for 6 operating districts and 3 dissolved operating state outlines.

export interface DistrictGeoFeature {
  type: 'Feature';
  id: string;
  properties: {
    districtId: string;
    id: string;
    name: string;
    state: 'Maharashtra' | 'Madhya Pradesh' | 'Tamil Nadu';
    tier: 'Metro' | 'Tier-2' | 'Rural';
    programType: 'micro-skilling' | 'literacy' | 'multi';
    women: number;
    impactIndex: number;
    sroiMultiplier: number;
    costPerOutcome: number;
    auditScore: number;
    auditStatus: 'verified' | 'caution' | 'flagged';
    ngosCount: number;
    ngosList: string[];
    centresCount: number;
    serviceGapsCount: number;
    leadNgo: string;
    bbox: [number, number, number, number];
    center: [number, number];
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface DistrictFeatureCollection {
  type: 'FeatureCollection';
  features: DistrictGeoFeature[];
}

export interface StateGeoFeature {
  type: 'Feature';
  id: string;
  properties: {
    id: 'maharashtra' | 'madhya_pradesh' | 'tamil_nadu';
    name: 'Maharashtra' | 'Madhya Pradesh' | 'Tamil Nadu';
    women: number;
    disbursedCr: number;
    districtsCount: number;
    color: string;
    bbox: [number, number, number, number];
    center: [number, number];
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface StateFeatureCollection {
  type: 'FeatureCollection';
  features: StateGeoFeature[];
}

export interface SpatialCameraTarget {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  bbox?: [number, number, number, number];
  pitch?: number;
  bearing?: number;
  districtKey?: string;
  state?: string;
}
`;

const content = `${tsHeader}
export const DISTRICT_GEOJSON: DistrictFeatureCollection = ${JSON.stringify(distData, null, 2)} as any;

export const STATES_GEOJSON: StateFeatureCollection = ${JSON.stringify(statesData, null, 2)} as any;

export const SPATIAL_CAMERA_PRESETS: Record<string, SpatialCameraTarget> = ${JSON.stringify(presets, null, 2)};
`;

fs.writeFileSync('src/data/districtGeoJson.ts', content, 'utf8');
console.log('Successfully wrote src/data/districtGeoJson.ts! Size:', (fs.statSync('src/data/districtGeoJson.ts').size / 1024).toFixed(1), 'KB');
