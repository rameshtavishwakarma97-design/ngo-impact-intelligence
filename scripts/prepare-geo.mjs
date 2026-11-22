import fs from 'fs';
import path from 'path';
import polygonClipping from 'polygon-clipping';

const PUBLIC_GEO_DIR = path.resolve('public/geo');
if (!fs.existsSync(PUBLIC_GEO_DIR)) {
  fs.mkdirSync(PUBLIC_GEO_DIR, { recursive: true });
}

function roundCoord(c, precision = 4) {
  return Number(c.toFixed(precision));
}

function roundCoordinates(coords) {
  if (typeof coords[0] === 'number') {
    return [roundCoord(coords[0]), roundCoord(coords[1])];
  }
  return coords.map(roundCoordinates);
}

function computeBbox(coords) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  function walk(c) {
    if (typeof c[0] === 'number') {
      const [lng, lat] = c;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else {
      c.forEach(walk);
    }
  }
  walk(coords);
  return [roundCoord(minLng), roundCoord(minLat), roundCoord(maxLng), roundCoord(maxLat)];
}

const DISTRICT_METADATA = {
  pune: {
    districtId: 'pune',
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    tier: 'Metro',
    programType: 'micro-skilling',
    women: 13100,
    impactIndex: 82.0,
    sroiMultiplier: 3.23,
    costPerOutcome: 6475,
    auditScore: 94,
    auditStatus: 'verified',
    ngosCount: 3,
    ngosList: ['Pratham Foundation', 'Smile Foundation', 'Magic Bus'],
    centresCount: 10,
    serviceGapsCount: 2,
    leadNgo: 'Pratham Foundation',
  },
  thane: {
    districtId: 'thane',
    id: 'thane',
    name: 'Thane',
    state: 'Maharashtra',
    tier: 'Metro',
    programType: 'micro-skilling',
    women: 3800,
    impactIndex: 56.4,
    sroiMultiplier: 1.22,
    costPerOutcome: 9450,
    auditScore: 70,
    auditStatus: 'flagged',
    ngosCount: 1,
    ngosList: ['Magic Bus (Kalwa & Mumbra Hub)'],
    centresCount: 2,
    serviceGapsCount: 0,
    leadNgo: 'Magic Bus',
  },
  nashik: {
    districtId: 'nashik',
    id: 'nashik',
    name: 'Nashik',
    state: 'Maharashtra',
    tier: 'Tier-2',
    programType: 'literacy',
    women: 6350,
    impactIndex: 78.9,
    sroiMultiplier: 3.30,
    costPerOutcome: 5200,
    auditScore: 93,
    auditStatus: 'verified',
    ngosCount: 1,
    ngosList: ['Room to Read'],
    centresCount: 2,
    serviceGapsCount: 1,
    leadNgo: 'Room to Read',
  },
  chhindwara: {
    districtId: 'chhindwara',
    id: 'chhindwara',
    name: 'Chhindwara',
    state: 'Madhya Pradesh',
    tier: 'Rural',
    programType: 'micro-skilling',
    women: 3900,
    impactIndex: 82.5,
    sroiMultiplier: 3.15,
    costPerOutcome: 6400,
    auditScore: 94,
    auditStatus: 'verified',
    ngosCount: 1,
    ngosList: ['Goonj'],
    centresCount: 2,
    serviceGapsCount: 1,
    leadNgo: 'Goonj',
  },
  jabalpur: {
    districtId: 'jabalpur',
    id: 'jabalpur',
    name: 'Jabalpur',
    state: 'Madhya Pradesh',
    tier: 'Rural',
    programType: 'literacy',
    women: 8100,
    impactIndex: 81.4,
    sroiMultiplier: 3.55,
    costPerOutcome: 4800,
    auditScore: 95,
    auditStatus: 'verified',
    ngosCount: 1,
    ngosList: ['Educate Girls'],
    centresCount: 2,
    serviceGapsCount: 1,
    leadNgo: 'Educate Girls',
  },
  coimbatore: {
    districtId: 'coimbatore',
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    tier: 'Tier-2',
    programType: 'micro-skilling',
    women: 7600,
    impactIndex: 75.8,
    sroiMultiplier: 2.89,
    costPerOutcome: 7100,
    auditScore: 90,
    auditStatus: 'verified',
    ngosCount: 1,
    ngosList: ['Smile Foundation'],
    centresCount: 2,
    serviceGapsCount: 1,
    leadNgo: 'Smile Foundation',
  },
};

const STATE_METADATA = {
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra',
    women: 23250,
    disbursedCr: 20.7,
    districtsCount: 3,
    color: '#0B4A7D',
  },
  madhya_pradesh: {
    id: 'madhya_pradesh',
    name: 'Madhya Pradesh',
    women: 12000,
    disbursedCr: 10.8,
    districtsCount: 2,
    color: '#2E6B4E',
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    women: 7600,
    disbursedCr: 6.5,
    districtsCount: 1,
    color: '#B5532A',
  },
};

const SOURCES = [
  { stateKey: 'maharashtra', url: 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/maharashtra.geojson' },
  { stateKey: 'madhya_pradesh', url: 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/madhya-pradesh.geojson' },
  { stateKey: 'tamil_nadu', url: 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/tamil-nadu.geojson' },
];

async function run() {
  console.log('Fetching state GeoJSONs...');
  const districtFeatures = [];
  const stateFeatures = [];
  const cameraPresets = {};

  for (const { stateKey, url } of SOURCES) {
    console.log(`Processing ${stateKey}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const data = await res.json();

    // 1. Extract Target Districts
    const allPolyCoords = [];
    for (const feat of data.features) {
      const dName = (feat.properties.district || feat.properties.District || '').toLowerCase().trim();
      
      // Store for state union
      if (feat.geometry.type === 'Polygon') {
        allPolyCoords.push(feat.geometry.coordinates);
      } else if (feat.geometry.type === 'MultiPolygon') {
        for (const poly of feat.geometry.coordinates) {
          allPolyCoords.push(poly);
        }
      }

      // Check if this is one of our 6 targets
      for (const [key, meta] of Object.entries(DISTRICT_METADATA)) {
        if (dName === key || dName === meta.name.toLowerCase()) {
          const roundedGeometry = {
            type: feat.geometry.type,
            coordinates: roundCoordinates(feat.geometry.coordinates),
          };
          const bbox = computeBbox(roundedGeometry.coordinates);
          const center = [
            roundCoord((bbox[0] + bbox[2]) / 2),
            roundCoord((bbox[1] + bbox[3]) / 2),
          ];

          districtFeatures.push({
            type: 'Feature',
            id: key,
            properties: {
              ...meta,
              bbox,
              center,
            },
            geometry: roundedGeometry,
          });

          cameraPresets[key] = {
            id: key,
            name: `${meta.name} District`,
            districtKey: key,
            state: meta.state,
            center,
            bbox,
            zoom: key === 'thane' ? 10.4 : 9.3,
          };
          console.log(`  ✓ Extracted district: ${meta.name} (bbox: ${bbox})`);
        }
      }
    }

    // 2. Dissolve State Boundary
    console.log(`  Dissolving ${allPolyCoords.length} polygons for ${stateKey}...`);
    const unioned = polygonClipping.union(...allPolyCoords);
    
    // Convert polygonClipping structure [ [ [ [x,y], ... ] ] ] to GeoJSON
    let stateGeometry;
    if (unioned.length === 1) {
      stateGeometry = {
        type: 'Polygon',
        coordinates: roundCoordinates(unioned[0]),
      };
    } else {
      stateGeometry = {
        type: 'MultiPolygon',
        coordinates: roundCoordinates(unioned),
      };
    }

    const stateMeta = STATE_METADATA[stateKey];
    const stateBbox = computeBbox(stateGeometry.coordinates);
    const stateCenter = [
      roundCoord((stateBbox[0] + stateBbox[2]) / 2),
      roundCoord((stateBbox[1] + stateBbox[3]) / 2),
    ];

    stateFeatures.push({
      type: 'Feature',
      id: stateKey,
      properties: {
        ...stateMeta,
        bbox: stateBbox,
        center: stateCenter,
      },
      geometry: stateGeometry,
    });

    cameraPresets[stateKey] = {
      id: stateKey,
      name: stateMeta.name,
      state: stateMeta.name,
      center: stateCenter,
      bbox: stateBbox,
      zoom: stateKey === 'tamil_nadu' ? 7.4 : 6.8,
    };
    console.log(`  ✓ Dissolved state: ${stateMeta.name} (bbox: ${stateBbox})`);
  }

  // 3. Save GeoJSON collections
  const districtsGeoJson = {
    type: 'FeatureCollection',
    features: districtFeatures,
  };
  const statesGeoJson = {
    type: 'FeatureCollection',
    features: stateFeatures,
  };

  const distPath = path.join(PUBLIC_GEO_DIR, 'operating-districts.geojson');
  const statesPath = path.join(PUBLIC_GEO_DIR, 'operating-states.geojson');

  fs.writeFileSync(distPath, JSON.stringify(districtsGeoJson, null, 2), 'utf8');
  fs.writeFileSync(statesPath, JSON.stringify(statesGeoJson, null, 2), 'utf8');

  console.log(`Saved ${distPath} (${(fs.statSync(distPath).size / 1024).toFixed(1)} KB)`);
  console.log(`Saved ${statesPath} (${(fs.statSync(statesPath).size / 1024).toFixed(1)} KB)`);

  // 4. Save presets and metadata for TypeScript imports
  fs.writeFileSync(
    path.resolve('src/data/geoPresets.json'),
    JSON.stringify(cameraPresets, null, 2),
    'utf8'
  );
  console.log('Saved src/data/geoPresets.json');
}

run().catch(err => {
  console.error('Error generating geojson:', err);
  process.exit(1);
});
