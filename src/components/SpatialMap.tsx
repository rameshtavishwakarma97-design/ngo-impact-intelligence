import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  type Map as MapLibreMap,
  NavigationControl,
  Marker,
  Popup,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Set Local-First Web Worker to eliminate remote bundle failures in Vite
if (typeof window !== 'undefined' && typeof (maplibregl as any).setWorkerUrl === 'function') {
  (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
}
import {
  DISTRICT_GEOJSON,
  STATES_GEOJSON,
  SPATIAL_CAMERA_PRESETS,
  type DistrictGeoFeature,
} from '../data/districtGeoJson';
import {
  useImpactStore,
  type OperationalCentre,
} from '../data/impactStore';
import {
  Layers,
  Compass,
} from 'lucide-react';

export type MapDisplayLayer = 'outcomes' | 'cost_efficiency' | 'service_gaps';

interface SpatialMapProps {
  selectedDistrictId: string | null;
  selectedState: string | null;
  selectedNgoId: string | null;
  activeLayer: MapDisplayLayer;
  onSelectDistrict: (districtId: string | null) => void;
  onSelectState: (state: string | null) => void;
  onSelectNgo: (ngoId: string | null) => void;
  onSelectCentre?: (centre: OperationalCentre) => void;
  onNavigateToAudit?: () => void;
  className?: string;
}

// Inline Local Style Specification (version 8) — Zero external style fetch dependency
const INLINE_LOCAL_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-light-gray': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri &copy; OpenStreetMap',
    },
    'states-data': {
      type: 'geojson',
      data: STATES_GEOJSON as any,
    },
    'districts-data': {
      type: 'geojson',
      data: DISTRICT_GEOJSON as any,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#F3EFE6', // Warm Khadi Canvas
      },
    },
    {
      id: 'esri-basemap',
      type: 'raster',
      source: 'esri-light-gray',
      paint: {
        'raster-opacity': 0.65,
      },
    },
    {
      id: 'states-borders',
      type: 'line',
      source: 'states-data',
      paint: {
        'line-color': '#C8BFA8',
        'line-width': 1.8,
        'line-dasharray': [3, 2],
      },
    },
    {
      id: 'districts-fill',
      type: 'fill',
      source: 'districts-data',
      paint: {
        'fill-color': [
          'match',
          ['get', 'id'],
          'pune', '#0B4A7D',
          'thane', '#B42318',
          'nashik', '#2E6B4E',
          'chhindwara', '#2E6B4E',
          'jabalpur', '#0B4A7D',
          'coimbatore', '#B5532A',
          '#0B4A7D',
        ],
        'fill-opacity': 0.60,
      },
    },
    {
      id: 'districts-extrusion',
      type: 'fill-extrusion',
      source: 'districts-data',
      paint: {
        'fill-extrusion-color': [
          'match',
          ['get', 'id'],
          'pune', '#0B4A7D',
          'thane', '#B42318',
          'nashik', '#2E6B4E',
          'chhindwara', '#2E6B4E',
          'jabalpur', '#0B4A7D',
          'coimbatore', '#B5532A',
          '#EAE6DD',
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['get', 'women'],
          3000, 6000,
          8000, 14000,
          14000, 26000,
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.85,
      },
      layout: {
        visibility: 'none',
      },
    },
    {
      id: 'districts-borders',
      type: 'line',
      source: 'districts-data',
      paint: {
        'line-color': '#1C1917',
        'line-width': 1.8,
        'line-opacity': 0.60,
      },
    },
    {
      id: 'districts-selected-border',
      type: 'line',
      source: 'districts-data',
      paint: {
        'line-color': '#0B4A7D',
        'line-width': 3.5,
      },
      filter: ['==', 'id', ''],
    },
  ],
};

export const SpatialMap: React.FC<SpatialMapProps> = ({
  selectedDistrictId,
  selectedState,
  selectedNgoId,
  activeLayer,
  onSelectDistrict,
  onSelectState,
  onSelectNgo,
  onSelectCentre,
  onNavigateToAudit,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const auditPopupRef = useRef<Popup | null>(null);

  const { operationalCentres, serviceGapBlocks } = useImpactStore();

  const [is25D, setIs25D] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [useSvgFallback, setUseSvgFallback] = useState<boolean>(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeoFeature['properties'] | null>(null);

  // Initialize MapLibre with local-first inline style specification
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // True WebGL Capability Detection
    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL) {
      setUseSvgFallback(true);
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: INLINE_LOCAL_STYLE,
        center: [77.5, 18.5],
        zoom: 5.1,
        pitch: 0,
        bearing: 0,
        cooperativeGestures: true,
        attributionControl: false,
      });

      // Bottom-right navigation controls (+ / -)
      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');

      // ResizeObserver to ensure container non-zero geometry & instant responsiveness
      const ro = new ResizeObserver(() => {
        map.resize();
      });
      ro.observe(mapContainerRef.current);

      map.on('error', (e) => {
        console.warn('MapLibre internal notice:', e);
      });

      map.on('load', () => {
        // Hover & Click Listeners
        map.on('mousemove', 'districts-fill', (e: any) => {
          if (e.features && e.features[0]) {
            map.getCanvas().style.cursor = 'pointer';
            setHoveredDistrict(e.features[0].properties as DistrictGeoFeature['properties']);
          }
        });

        map.on('mouseleave', 'districts-fill', () => {
          map.getCanvas().style.cursor = '';
          setHoveredDistrict(null);
        });

        map.on('click', 'districts-fill', (e: any) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties as DistrictGeoFeature['properties'];
            onSelectDistrict(props.id);
            onSelectState(props.state);
          }
        });

        mapRef.current = map;
        setMapLoaded(true);
      });

      return () => {
        ro.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch {
      setUseSvgFallback(true);
    }
  }, [onSelectDistrict, onSelectState]);

  // Update Dynamic Shading & Extrusion based on Active Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (activeLayer === 'outcomes') {
        // High impact = deep Bajaj Blue & Botanical Moss, Flagged = Brick Crimson
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune', '#0B4A7D',
          'thane', '#B42318',
          'nashik', '#2E6B4E',
          'chhindwara', '#2E6B4E',
          'jabalpur', '#0B4A7D',
          'coimbatore', '#B5532A',
          '#0B4A7D',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.65);
      } else if (activeLayer === 'cost_efficiency') {
        // SROI Multiplier shading
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune', '#2E6B4E',
          'thane', '#B42318',
          'nashik', '#2E6B4E',
          'chhindwara', '#2E6B4E',
          'jabalpur', '#2E6B4E',
          'coimbatore', '#0B4A7D',
          '#2E6B4E',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.65);
      } else if (activeLayer === 'service_gaps') {
        // Districts with unserved gaps highlighted with soft terracotta
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune', '#FAEDE6',
          'thane', '#EAE6DD',
          'nashik', '#EAE6DD',
          'chhindwara', '#FAEDE6',
          'jabalpur', '#EAE6DD',
          'coimbatore', '#FAEDE6',
          '#EAE6DD',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.50);
      }
    } catch {
      // Non-blocking layer property transition
    }
  }, [activeLayer, mapLoaded]);

  // Update Selection Border Filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (selectedDistrictId) {
        map.setFilter('districts-selected-border', ['==', 'id', selectedDistrictId]);
      } else {
        map.setFilter('districts-selected-border', ['==', 'id', '']);
      }
    } catch {
      // Non-blocking filter update
    }
  }, [selectedDistrictId, mapLoaded]);

  // Camera Flight Transitions
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (selectedDistrictId) {
        const target = SPATIAL_CAMERA_PRESETS[selectedDistrictId];
        if (target) {
          map.flyTo({
            center: target.center,
            zoom: target.zoom,
            pitch: is25D ? 45 : 0,
            bearing: is25D ? -12 : 0,
            essential: true,
            duration: 900,
          });
        }
      } else if (selectedState) {
        const stateKey = selectedState.toLowerCase().replace(/\s+/g, '_');
        const target = SPATIAL_CAMERA_PRESETS[stateKey];
        if (target) {
          map.flyTo({
            center: target.center,
            zoom: target.zoom,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 800,
          });
        }
      } else {
        const target = SPATIAL_CAMERA_PRESETS.all_india;
        map.flyTo({
          center: target.center,
          zoom: target.zoom,
          pitch: 0,
          bearing: 0,
          essential: true,
          duration: 800,
        });
      }
    } catch {
      // Non-blocking camera flight
    }
  }, [selectedDistrictId, selectedState, is25D, mapLoaded]);

  // HTML DOM Markers for Operational Centres & Thane Anomaly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (auditPopupRef.current) {
      auditPopupRef.current.remove();
      auditPopupRef.current = null;
    }

    // 0. District Centroid Badges in Territory View (!selectedDistrictId)
    if (!selectedDistrictId) {
      DISTRICT_GEOJSON.features.forEach((feat) => {
        const props = feat.properties;
        const target = SPATIAL_CAMERA_PRESETS[props.id];
        if (!target) return;

        const el = document.createElement('div');
        el.className = 'cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95';
        const isFlagged = props.auditStatus === 'flagged';
        el.innerHTML = `
          <div class="px-2 py-0.5 rounded-lg border shadow-xs text-[10px] font-bold flex items-center gap-1 ${
            isFlagged
              ? 'bg-[#FCECEB] text-[#B42318] border-[#B42318]/40'
              : 'bg-[#FCFBF8] text-[#1C1917] border-[#E5DFD3] hover:border-[#0B4A7D]'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${isFlagged ? 'bg-[#B42318] animate-ping' : 'bg-[#0B4A7D]'}"></span>
            <span>${props.name}</span>
            <span class="${isFlagged ? 'text-[#B42318]' : 'text-[#0B4A7D]'} font-mono">${Math.round(props.impactIndex)}</span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectDistrict(props.id);
          onSelectState(props.state);
        });

        const marker = new Marker({ element: el, anchor: 'center' })
          .setLngLat(target.center)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 1. Operational Centre Markers (When District is Selected)
    const centresToRender = selectedDistrictId
      ? operationalCentres.filter((c) => c.district.toLowerCase() === selectedDistrictId.toLowerCase())
      : [];

    centresToRender.forEach((centre) => {
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';

      const isFlagged = centre.status === 'flagged';
      const isSelected = selectedNgoId ? centre.ngoId === selectedNgoId : true;

      el.innerHTML = `
        <div class="w-4 h-4 rounded-full border-2 ${
          isFlagged ? 'bg-[#B42318] border-white ring-2 ring-[#B42318]/40 animate-pulse' : 'bg-[#0B4A7D] border-white shadow-md'
        } ${isSelected ? 'scale-110' : 'opacity-60'} transition-transform group-hover:scale-125"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCentre?.(centre);
        onSelectNgo(centre.ngoId);
      });

      const popup = new Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="p-2 text-xs font-sans space-y-1">
          <div class="font-bold text-[#1C1917]">${centre.name}</div>
          <div class="text-[10px] text-[#6B655C]">${centre.beneficiaries} women · ${centre.completionPct}% completion</div>
          <div class="text-[10px] text-[#2E6B4E] font-semibold">${centre.outcomeLift} verified lift</div>
        </div>
      `);

      const marker = new Marker({ element: el })
        .setLngLat([centre.lng, centre.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // 2. Thane Kalwa Anomaly Overlay
    if (selectedDistrictId === 'thane') {
      const kalwaCoord: [number, number] = [73.0, 19.2];
      const anomalyEl = document.createElement('div');
      anomalyEl.className = 'relative cursor-pointer';
      anomalyEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-10 h-10 rounded-full bg-[#B42318]/25 animate-ping"></span>
          <span class="relative px-2 py-0.5 rounded-full bg-[#B42318] text-white text-[10px] font-bold shadow-lg border border-white flex items-center gap-1">
            <span>⚠️ 142 GPS Flags</span>
          </span>
        </div>
      `;

      anomalyEl.addEventListener('click', (e) => {
        e.stopPropagation();
        onNavigateToAudit?.();
      });

      const anomalyMarker = new Marker({ element: anomalyEl, anchor: 'center' })
        .setLngLat(kalwaCoord)
        .addTo(map);

      markersRef.current.push(anomalyMarker);
    }

    // 3. Service Gap Pulsing Rings (when service_gaps layer active)
    if (activeLayer === 'service_gaps') {
      serviceGapBlocks.forEach((gap) => {
        const gapEl = document.createElement('div');
        gapEl.className = 'relative flex items-center justify-center cursor-pointer';
        gapEl.innerHTML = `
          <span class="absolute w-8 h-8 rounded-full bg-[#B5532A]/30 animate-pulse"></span>
          <span class="w-3 h-3 rounded-full bg-[#B5532A] border-2 border-white shadow-sm"></span>
        `;

        const gapPopup = new Popup({ offset: 10, closeButton: false }).setHTML(`
          <div class="p-2 text-xs font-sans space-y-0.5">
            <span class="font-bold text-[#B5532A] block">${gap.name}</span>
            <span class="text-[10px] text-[#6B655C] block">${gap.unservedWomen} unserved women</span>
            <span class="text-[10px] font-semibold text-[#1C1917] block">₹${gap.recommendedAllocationCr} Cr gap</span>
          </div>
        `);

        const gapMarker = new Marker({ element: gapEl })
          .setLngLat([gap.lng, gap.lat])
          .setPopup(gapPopup)
          .addTo(map);

        markersRef.current.push(gapMarker);
      });
    }
  }, [
    selectedDistrictId,
    selectedNgoId,
    activeLayer,
    operationalCentres,
    serviceGapBlocks,
    onSelectCentre,
    onSelectNgo,
    onNavigateToAudit,
    mapLoaded,
  ]);

  // Toggle 2D vs 2.5D Tilt & Extrusion
  const toggle25D = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const nextState = !is25D;
    setIs25D(nextState);

    map.easeTo({
      pitch: nextState ? 48 : 0,
      bearing: nextState ? -14 : 0,
      duration: 500,
    });

    try {
      if (nextState) {
        map.setLayoutProperty('districts-extrusion', 'visibility', 'visible');
        map.setLayoutProperty('districts-fill', 'visibility', 'none');
      } else {
        map.setLayoutProperty('districts-extrusion', 'visibility', 'none');
        map.setLayoutProperty('districts-fill', 'visibility', 'visible');
      }
    } catch {
      // Non-blocking layout transition
    }
  }, [is25D, mapLoaded]);

  // True WebGL Fallback SVG Map
  if (useSvgFallback) {
    return (
      <div className={`relative w-full h-full min-h-[340px] bg-[#F3EFE6] rounded-2xl border border-[#E5DFD3] overflow-hidden flex flex-col justify-between p-4 ${className}`}>
        <div className="flex items-center justify-between text-xs border-b border-[#E5DFD3] pb-2">
          <span className="font-bold text-[#1C1917]">Interactive Spatial Map (Vector SVG Mode)</span>
          <span className="text-[10px] text-[#8C8479]">3 States · 6 Districts</span>
        </div>

        {/* Scaled Interactive SVG Vector Map of 3 States & 6 Districts */}
        <div className="relative flex-1 flex items-center justify-center p-2">
          <svg viewBox="0 0 460 360" className="w-full h-full max-h-[460px]">
            {/* Maharashtra State Polygon */}
            <path
              d="M 60,110 L 120,105 L 180,115 L 210,140 L 190,190 L 130,200 L 70,170 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            {/* Madhya Pradesh State Polygon */}
            <path
              d="M 120,30 L 220,20 L 290,50 L 310,100 L 250,115 L 140,95 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            {/* Tamil Nadu State Polygon */}
            <path
              d="M 170,240 L 240,245 L 250,320 L 190,340 L 160,290 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />

            {/* 6 District Clickable Polygons */}
            {/* Pune */}
            <g
              onClick={() => {
                onSelectDistrict('pune');
                onSelectState('Maharashtra');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="100,145 130,135 145,160 120,180 95,165"
                fill={selectedDistrictId === 'pune' ? '#0B4A7D' : '#0B4A7D'}
                fillOpacity={selectedDistrictId === 'pune' ? 0.75 : 0.38}
                stroke="#0B4A7D"
                strokeWidth={selectedDistrictId === 'pune' ? 3 : 1.5}
              />
              <text x="120" y="160" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1C1917">
                Pune
              </text>
            </g>

            {/* Thane */}
            <g
              onClick={() => {
                onSelectDistrict('thane');
                onSelectState('Maharashtra');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="75,130 95,125 100,145 80,150"
                fill="#B42318"
                fillOpacity={selectedDistrictId === 'thane' ? 0.75 : 0.38}
                stroke="#B42318"
                strokeWidth={selectedDistrictId === 'thane' ? 3 : 1.5}
              />
              <text x="86" y="140" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
                Thane
              </text>
            </g>

            {/* Nashik */}
            <g
              onClick={() => {
                onSelectDistrict('nashik');
                onSelectState('Maharashtra');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="95,110 125,105 130,135 100,135"
                fill="#2E6B4E"
                fillOpacity={selectedDistrictId === 'nashik' ? 0.75 : 0.38}
                stroke="#2E6B4E"
                strokeWidth={selectedDistrictId === 'nashik' ? 3 : 1.5}
              />
              <text x="112" y="122" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
                Nashik
              </text>
            </g>

            {/* Chhindwara */}
            <g
              onClick={() => {
                onSelectDistrict('chhindwara');
                onSelectState('Madhya Pradesh');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="180,75 220,70 230,95 190,100"
                fill="#2E6B4E"
                fillOpacity={selectedDistrictId === 'chhindwara' ? 0.75 : 0.38}
                stroke="#2E6B4E"
                strokeWidth={selectedDistrictId === 'chhindwara' ? 3 : 1.5}
              />
              <text x="205" y="88" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
                Chhindwara
              </text>
            </g>

            {/* Jabalpur */}
            <g
              onClick={() => {
                onSelectDistrict('jabalpur');
                onSelectState('Madhya Pradesh');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="225,50 265,45 275,70 235,75"
                fill="#0B4A7D"
                fillOpacity={selectedDistrictId === 'jabalpur' ? 0.75 : 0.38}
                stroke="#0B4A7D"
                strokeWidth={selectedDistrictId === 'jabalpur' ? 3 : 1.5}
              />
              <text x="250" y="62" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
                Jabalpur
              </text>
            </g>

            {/* Coimbatore */}
            <g
              onClick={() => {
                onSelectDistrict('coimbatore');
                onSelectState('Tamil Nadu');
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="180,265 210,260 215,290 185,295"
                fill="#B5532A"
                fillOpacity={selectedDistrictId === 'coimbatore' ? 0.75 : 0.38}
                stroke="#B5532A"
                strokeWidth={selectedDistrictId === 'coimbatore' ? 3 : 1.5}
              />
              <text x="198" y="280" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
                Coimbatore
              </text>
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6B655C] border-t border-[#E5DFD3] pt-2">
          <span>Click any district polygon to inspect localized indicators.</span>
          <span className="font-semibold text-[#0B4A7D]">Instant Vector Mode</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[340px] rounded-2xl border border-[#E5DFD3] overflow-hidden bg-[#F3EFE6] select-none ${className}`}>
      {/* ── MAPLIBRE CANVAS CONTAINER ── */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[340px]"
        aria-label="MapLibre 5-Level Spatial Impact Explorer"
      />

      {/* ── CONTROLS OVERLAY: 2D/2.5D TILT & RESET CAMERA (TOP-RIGHT) ── */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggle25D}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
            is25D
              ? 'bg-[#0B4A7D] text-white border-[#0B4A7D]'
              : 'bg-[#FCFBF8] text-[#1C1917] border-[#E5DFD3] hover:border-[#0B4A7D]'
          }`}
          title="Toggle 2D vs 2.5D Proportional Volume Height"
        >
          <Layers size={13} />
          <span>{is25D ? '2.5D Tilt On' : '2D View'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectDistrict(null);
            onSelectState(null);
            onSelectNgo(null);
          }}
          className="p-1.5 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917] hover:border-[#0B4A7D] transition-all cursor-pointer shadow-2xs"
          title="Reset to All India View"
        >
          <Compass size={14} />
        </button>
      </div>

      {/* ── ACTIVE LAYER BADGE & LEGEND (BOTTOM-LEFT) ── */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 p-2 rounded-xl bg-[#FCFBF8]/95 backdrop-blur-md border border-[#E5DFD3] text-[11px] shadow-xs">
        <span className="font-semibold text-[#1C1917] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#0B4A7D]"></span>
          <span>
            {activeLayer === 'outcomes'
              ? 'Outcomes (0–100)'
              : activeLayer === 'cost_efficiency'
              ? '₹ SROI Efficiency'
              : 'Service Gaps & Unserved Hubs'}
          </span>
        </span>
        <span className="text-[#8C8479]">·</span>
        <span className="text-[#6B655C]">6 Districts · 20 Centres</span>
      </div>

      {/* ── DESKTOP HOVER TOOLTIP (TOP-LEFT) ── */}
      {hoveredDistrict && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:block p-3 rounded-xl bg-[#FCFBF8]/95 backdrop-blur-md border border-[#E5DFD3] text-xs shadow-lg max-w-xs space-y-1">
          <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD3] pb-1">
            <span className="font-bold text-[#1C1917]">{hoveredDistrict.name} District</span>
            <span className="text-[10px] text-[#8C8479]">{hoveredDistrict.state}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-[#8C8479] block text-[10px]">BENEFICIARIES</span>
              <span className="font-semibold text-[#1C1917]">{hoveredDistrict.women.toLocaleString('en-IN')} women</span>
            </div>
            <div>
              <span className="text-[#8C8479] block text-[10px]">IMPACT INDEX</span>
              <span className="font-semibold text-[#0B4A7D]">{hoveredDistrict.impactIndex} / 100</span>
            </div>
          </div>
          <div className="text-[10px] text-[#6B655C] pt-1 border-t border-[#E5DFD3]/60 truncate">
            {hoveredDistrict.ngosList.join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
};
