// ─── STATIC LOCAL GEOJSON DATA FOR 6 CANONICAL CSR DISTRICTS ───────────────────
// High-accuracy district boundary polygons and state centroids for offline & Vercel reliability.

export interface DistrictGeoFeature {
  type: 'Feature';
  properties: {
    id: string; // 'pune', 'thane', 'nashik', 'chhindwara', 'jabalpur', 'coimbatore'
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
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
  };
}

export interface DistrictFeatureCollection {
  type: 'FeatureCollection';
  features: DistrictGeoFeature[];
}

export const DISTRICT_GEOJSON: DistrictFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // ── 1. Pune District (Maharashtra) ──
    {
      type: 'Feature',
      properties: {
        id: 'pune',
        name: 'Pune',
        state: 'Maharashtra',
        tier: 'Metro',
        programType: 'micro-skilling',
        women: 13100, // 9,200 Pratham + 2,500 Smile + 1,400 Magic Bus
        impactIndex: 82.0, // Beneficiary-weighted mean
        sroiMultiplier: 3.23,
        costPerOutcome: 6475,
        auditScore: 94,
        auditStatus: 'verified',
        ngosCount: 3,
        ngosList: ['Pratham Foundation', 'Smile Foundation', 'Magic Bus'],
        centresCount: 10,
        serviceGapsCount: 2, // Velhe, Junnar
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.32, 18.15],
            [73.50, 18.02],
            [73.85, 17.92],
            [74.20, 18.05],
            [74.65, 18.12],
            [75.05, 18.35],
            [74.88, 18.68],
            [74.55, 18.95],
            [74.15, 19.25],
            [73.80, 19.38],
            [73.55, 19.15],
            [73.35, 18.72],
            [73.32, 18.15],
          ],
        ],
      },
    },

    // ── 2. Thane District (Maharashtra) ──
    {
      type: 'Feature',
      properties: {
        id: 'thane',
        name: 'Thane',
        state: 'Maharashtra',
        tier: 'Metro',
        programType: 'micro-skilling',
        women: 3800, // Magic Bus (Kalwa & Mumbra)
        impactIndex: 56.4,
        sroiMultiplier: 1.22,
        costPerOutcome: 9450,
        auditScore: 70,
        auditStatus: 'flagged',
        ngosCount: 1,
        ngosList: ['Magic Bus (Kalwa & Mumbra Hub)'],
        centresCount: 2,
        serviceGapsCount: 0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.82, 19.12],
            [73.05, 19.05],
            [73.28, 19.18],
            [73.45, 19.42],
            [73.35, 19.65],
            [73.12, 19.62],
            [72.88, 19.48],
            [72.78, 19.28],
            [72.82, 19.12],
          ],
        ],
      },
    },

    // ── 3. Nashik District (Maharashtra) ──
    {
      type: 'Feature',
      properties: {
        id: 'nashik',
        name: 'Nashik',
        state: 'Maharashtra',
        tier: 'Tier-2',
        programType: 'literacy',
        women: 6350, // Room to Read
        impactIndex: 78.9,
        sroiMultiplier: 3.30,
        costPerOutcome: 5200,
        auditScore: 93,
        auditStatus: 'verified',
        ngosCount: 1,
        ngosList: ['Room to Read'],
        centresCount: 2,
        serviceGapsCount: 0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.35, 19.75],
            [73.65, 19.55],
            [74.15, 19.68],
            [74.65, 19.95],
            [74.85, 20.35],
            [74.55, 20.78],
            [74.05, 20.85],
            [73.55, 20.65],
            [73.25, 20.25],
            [73.35, 19.75],
          ],
        ],
      },
    },

    // ── 4. Chhindwara District (Madhya Pradesh) ──
    {
      type: 'Feature',
      properties: {
        id: 'chhindwara',
        name: 'Chhindwara',
        state: 'Madhya Pradesh',
        tier: 'Rural',
        programType: 'micro-skilling',
        women: 3900, // Goonj
        impactIndex: 82.5,
        sroiMultiplier: 3.15,
        costPerOutcome: 6400,
        auditScore: 94,
        auditStatus: 'verified',
        ngosCount: 1,
        ngosList: ['Goonj'],
        centresCount: 2,
        serviceGapsCount: 1, // Harrai Block
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [78.35, 21.65],
            [78.75, 21.45],
            [79.25, 21.68],
            [79.55, 22.15],
            [79.42, 22.75],
            [78.95, 22.82],
            [78.45, 22.55],
            [78.22, 22.15],
            [78.35, 21.65],
          ],
        ],
      },
    },

    // ── 5. Jabalpur District (Madhya Pradesh) ──
    {
      type: 'Feature',
      properties: {
        id: 'jabalpur',
        name: 'Jabalpur',
        state: 'Madhya Pradesh',
        tier: 'Rural',
        programType: 'literacy',
        women: 8100, // Educate Girls
        impactIndex: 81.4,
        sroiMultiplier: 3.55,
        costPerOutcome: 4800,
        auditScore: 95,
        auditStatus: 'verified',
        ngosCount: 1,
        ngosList: ['Educate Girls'],
        centresCount: 2,
        serviceGapsCount: 0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.62, 22.95],
            [80.05, 22.85],
            [80.45, 23.05],
            [80.65, 23.35],
            [80.35, 23.68],
            [79.92, 23.75],
            [79.52, 23.52],
            [79.45, 23.18],
            [79.62, 22.95],
          ],
        ],
      },
    },

    // ── 6. Coimbatore District (Tamil Nadu) ──
    {
      type: 'Feature',
      properties: {
        id: 'coimbatore',
        name: 'Coimbatore',
        state: 'Tamil Nadu',
        tier: 'Tier-2',
        programType: 'micro-skilling',
        women: 7600, // Smile Foundation
        impactIndex: 75.8,
        sroiMultiplier: 2.89,
        costPerOutcome: 7100,
        auditScore: 90,
        auditStatus: 'verified',
        ngosCount: 1,
        ngosList: ['Smile Foundation (Coimbatore Cluster)'],
        centresCount: 2,
        serviceGapsCount: 1, // Valparai Block
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.72, 10.35],
            [77.05, 10.22],
            [77.28, 10.55],
            [77.35, 11.05],
            [77.15, 11.38],
            [76.85, 11.45],
            [76.62, 11.15],
            [76.55, 10.72],
            [76.72, 10.35],
          ],
        ],
      },
    },
  ],
};

// ─── SPATIAL CAMERA PRESETS FOR FLIGHT NAVIGATION ─────────────────────────────

export interface SpatialCameraTarget {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch?: number;
  bearing?: number;
  districtKey?: string;
  state?: string;
}

export const SPATIAL_CAMERA_PRESETS: Record<string, SpatialCameraTarget> = {
  all_india: {
    id: 'all_india',
    name: 'All States (3)',
    center: [77.5, 18.5],
    zoom: 5.1,
    pitch: 0,
    bearing: 0,
  },
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra',
    state: 'Maharashtra',
    center: [74.4, 19.1],
    zoom: 6.8,
    pitch: 0,
    bearing: 0,
  },
  madhya_pradesh: {
    id: 'madhya_pradesh',
    name: 'Madhya Pradesh',
    state: 'Madhya Pradesh',
    center: [79.4, 22.8],
    zoom: 6.9,
    pitch: 0,
    bearing: 0,
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    state: 'Tamil Nadu',
    center: [77.2, 10.9],
    zoom: 7.4,
    pitch: 0,
    bearing: 0,
  },
  pune: {
    id: 'pune',
    name: 'Pune District',
    districtKey: 'pune',
    state: 'Maharashtra',
    center: [73.8567, 18.5204],
    zoom: 9.3,
  },
  thane: {
    id: 'thane',
    name: 'Thane District',
    districtKey: 'thane',
    state: 'Maharashtra',
    center: [73.02, 19.22],
    zoom: 10.4,
  },
  nashik: {
    id: 'nashik',
    name: 'Nashik District',
    districtKey: 'nashik',
    state: 'Maharashtra',
    center: [73.7898, 19.9975],
    zoom: 9.2,
  },
  chhindwara: {
    id: 'chhindwara',
    name: 'Chhindwara District',
    districtKey: 'chhindwara',
    state: 'Madhya Pradesh',
    center: [78.9382, 22.0574],
    zoom: 9.0,
  },
  jabalpur: {
    id: 'jabalpur',
    name: 'Jabalpur District',
    districtKey: 'jabalpur',
    state: 'Madhya Pradesh',
    center: [79.9864, 23.1815],
    zoom: 9.2,
  },
  coimbatore: {
    id: 'coimbatore',
    name: 'Coimbatore District',
    districtKey: 'coimbatore',
    state: 'Tamil Nadu',
    center: [76.9558, 11.0168],
    zoom: 9.3,
  },
};
