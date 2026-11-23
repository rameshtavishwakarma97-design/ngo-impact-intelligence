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
  getNgoColor,
} from '../data/impactStore';
import {
  Compass,
  Building2,
} from 'lucide-react';

export type MapDisplayLayer = 'outcomes' | 'cost_efficiency' | 'service_gaps';

export interface SpatialMapProps {
  selectedDistrictId: string | null;
  selectedState: string | null;
  selectedNgoId: string | null;
  selectedCentre?: OperationalCentre | null;
  activeLayer: MapDisplayLayer;
  is3D?: boolean;
  isInspectorCollapsed?: boolean;
  onToggle3D?: () => void;
  showInternalControls?: boolean;
  onSelectDistrict: (districtId: string | null) => void;
  onSelectState: (state: string | null) => void;
  onSelectNgo: (ngoId: string | null) => void;
  onSelectCentre?: (centre: OperationalCentre) => void;
  onNavigateToAudit?: () => void;
  className?: string;
}

export const SpatialMap: React.FC<SpatialMapProps> = ({
  selectedDistrictId,
  selectedState,
  selectedNgoId,
  selectedCentre,
  activeLayer,
  is3D: externalIs3D,
  isInspectorCollapsed = false,
  onToggle3D,
  showInternalControls = false,
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
  const hoverPopupRef = useRef<Popup | null>(null);

  const onSelectDistrictRef = useRef(onSelectDistrict);
  onSelectDistrictRef.current = onSelectDistrict;

  const onSelectStateRef = useRef(onSelectState);
  onSelectStateRef.current = onSelectState;

  const onSelectCentreRef = useRef(onSelectCentre);
  onSelectCentreRef.current = onSelectCentre;

  const { operationalCentres, serviceGapBlocks } = useImpactStore();

  const [internalIs3D, setInternalIs3D] = useState<boolean>(false);
  const is3D = externalIs3D !== undefined ? externalIs3D : internalIs3D;

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
  const [useSvgFallback, setUseSvgFallback] = useState<boolean>(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeoFeature['properties'] | null>(null);

  // Sync camera tilt with 3D mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    map.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -20 : 0,
      duration: 600,
    });
  }, [is3D, mapLoaded]);

  // Initialize MapLibre with OpenFreeMap Positron Vector Basemap + 3D Architectural Buildings
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
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [77.5, 18.5],
        zoom: 5.1,
        pitch: is3D ? 55 : 0,
        bearing: is3D ? -20 : 0,
        cooperativeGestures: true,
        canvasContextAttributes: { antialias: true },
        attributionControl: false,
      });

      // Relocate zoom controls: 'bottom-left' on desktop (never buried behind floating inspector), 'top-right' on mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      map.addControl(
        new NavigationControl({ showCompass: false }),
        isMobile ? 'top-right' : 'bottom-left'
      );

      // ResizeObserver to ensure container non-zero geometry & instant responsiveness
      const ro = new ResizeObserver(() => {
        map.resize();
      });
      ro.observe(mapContainerRef.current);

      map.on('error', (e) => {
        console.warn('MapLibre internal notice:', e);
      });

      map.on('zoomend', () => {
        const zoomed = map.getZoom() >= 7.8;
        setIsZoomedIn((prev) => (prev !== zoomed ? zoomed : prev));
      });

      map.on('load', () => {
        try {
          const style = map.getStyle();

          // 1. Locate First Symbol Layer with text-field to keep road/city labels ON TOP of 3D buildings
          let labelLayerId: string | undefined;
          if (style && style.layers) {
            for (const l of style.layers) {
              if (l.type === 'symbol' && l.layout && (l.layout as any)['text-field']) {
                labelLayerId = l.id;
                break;
              }
            }
          }

          // 2. OpenFreeMap Vector 3D Extruded Buildings Layer
          const buildingSource = map.getSource('openmaptiles') ? 'openmaptiles' : 'openfreemap-buildings';
          if (!map.getSource(buildingSource)) {
            try {
              map.addSource('openfreemap-buildings', {
                type: 'vector',
                url: 'https://tiles.openfreemap.org/planet',
              });
            } catch (err) {
              console.warn('Could not add openfreemap-buildings source:', err);
            }
          }

          const actualBuildingSource = map.getSource('openfreemap-buildings') ? 'openfreemap-buildings' : 'openmaptiles';
          if (map.getSource(actualBuildingSource) && !map.getLayer('3d-buildings')) {
            map.addLayer(
              {
                id: '3d-buildings',
                source: actualBuildingSource,
                'source-layer': 'building',
                type: 'fill-extrusion',
                minzoom: 12.5,
                filter: ['!=', ['get', 'hide_3d'], true],
                paint: {
                  'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['coalesce', ['get', 'render_height'], 10],
                    0,
                    '#DCE4EC',
                    15,
                    '#9EC5EA',
                    35,
                    '#4A90D9',
                    70,
                    '#0B4A7D',
                  ],
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12.5,
                    0,
                    13.5,
                    ['coalesce', ['get', 'render_height'], 12],
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12.5,
                    0,
                    13.5,
                    ['coalesce', ['get', 'render_min_height'], 0],
                  ],
                  'fill-extrusion-opacity': 0.88,
                },
              },
              labelLayerId
            );
          }

          // 3. Add Real GeoJSON Sources (6 Districts & 3 States)
          if (!map.getSource('states-data')) {
            map.addSource('states-data', {
              type: 'geojson',
              data: STATES_GEOJSON as any,
            });
          }

          if (!map.getSource('districts-data')) {
            map.addSource('districts-data', {
              type: 'geojson',
              data: DISTRICT_GEOJSON as any,
            });
          }

          // 4. Subtle Refined State Outlines (Fades out past zoom 8.5)
          if (!map.getLayer('states-borders')) {
            map.addLayer(
              {
                id: 'states-borders',
                type: 'line',
                source: 'states-data',
                paint: {
                  'line-color': '#9E9689',
                  'line-width': 1.2,
                  'line-dasharray': [3, 2],
                  'line-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4,
                    0.85,
                    6,
                    0.85,
                    8,
                    0.55,
                    8.5,
                    0.0,
                  ],
                },
              },
              labelLayerId
            );
          }

          // 5. Zoom-Adaptive District Choropleth Fill
          if (!map.getLayer('districts-fill')) {
            map.addLayer(
              {
                id: 'districts-fill',
                type: 'fill',
                source: 'districts-data',
                paint: {
                  'fill-color': [
                    'match',
                    ['get', 'id'],
                    'pune',
                    '#0B4A7D',
                    'thane',
                    '#B42318',
                    'nashik',
                    '#2E6B4E',
                    'chhindwara',
                    '#2E6B4E',
                    'jabalpur',
                    '#0B4A7D',
                    'coimbatore',
                    '#B5532A',
                    '#0B4A7D',
                  ],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4,
                    0.48,
                    6,
                    0.42,
                    7,
                    0.42,
                    8,
                    0.28,
                    9.5,
                    0.10,
                    11,
                    0.05,
                    12,
                    0.03,
                  ],
                },
              },
              labelLayerId
            );
          }

          // 6. District Base Boundaries
          if (!map.getLayer('districts-borders')) {
            map.addLayer(
              {
                id: 'districts-borders',
                type: 'line',
                source: 'districts-data',
                paint: {
                  'line-color': '#1C1917',
                  'line-width': 1.6,
                  'line-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4,
                    0.75,
                    6,
                    0.65,
                    9,
                    0.40,
                    12,
                    0.20,
                  ],
                },
              },
              labelLayerId
            );
          }

          // 7. Active District Glowing Highlight Halo (6px blurred glow)
          if (!map.getLayer('districts-highlight-halo')) {
            map.addLayer(
              {
                id: 'districts-highlight-halo',
                type: 'line',
                source: 'districts-data',
                paint: {
                  'line-color': [
                    'case',
                    ['==', ['get', 'id'], 'thane'],
                    '#B42318',
                    '#0B4A7D',
                  ],
                  'line-width': 8,
                  'line-opacity': 0.25,
                  'line-blur': 4,
                },
                filter: ['==', 'id', ''],
              },
              labelLayerId
            );
          }

          // 8. Active District Crisp Highlight Stroke (3px solid)
          if (!map.getLayer('districts-selected-border')) {
            map.addLayer(
              {
                id: 'districts-selected-border',
                type: 'line',
                source: 'districts-data',
                paint: {
                  'line-color': [
                    'case',
                    ['==', ['get', 'id'], 'thane'],
                    '#B42318',
                    '#0B4A7D',
                  ],
                  'line-width': 3,
                  'line-opacity': 0.95,
                },
                filter: ['==', 'id', ''],
              },
              labelLayerId
            );
          }

          // Hover & Click Listeners on District Polygons
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
              onSelectDistrictRef.current(props.id);
              onSelectStateRef.current(props.state);
            }
          });

          mapRef.current = map;
          setMapLoaded(true);
        } catch (err) {
          console.warn('MapLibre load configuration notice:', err);
          mapRef.current = map;
          setMapLoaded(true);
        }
      });

      return () => {
        ro.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch {
      setUseSvgFallback(true);
    }
  }, []);

  // Update Dynamic Shading based on Active Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (activeLayer === 'outcomes') {
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune',
          '#0B4A7D',
          'thane',
          '#B42318',
          'nashik',
          '#2E6B4E',
          'chhindwara',
          '#2E6B4E',
          'jabalpur',
          '#0B4A7D',
          'coimbatore',
          '#B5532A',
          '#0B4A7D',
        ]);
      } else if (activeLayer === 'cost_efficiency') {
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune',
          '#2E6B4E',
          'thane',
          '#B42318',
          'nashik',
          '#2E6B4E',
          'chhindwara',
          '#2E6B4E',
          'jabalpur',
          '#2E6B4E',
          'coimbatore',
          '#0B4A7D',
          '#2E6B4E',
        ]);
      } else if (activeLayer === 'service_gaps') {
        map.setPaintProperty('districts-fill', 'fill-color', [
          'match',
          ['get', 'id'],
          'pune',
          '#FAEDE6',
          'thane',
          '#EAE6DD',
          'nashik',
          '#EAE6DD',
          'chhindwara',
          '#FAEDE6',
          'jabalpur',
          '#EAE6DD',
          'coimbatore',
          '#FAEDE6',
          '#EAE6DD',
        ]);
      }
    } catch {
      // Non-blocking layer property transition
    }
  }, [activeLayer, mapLoaded]);

  // Update Glowing Selection Border Filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      const filterCondition = selectedDistrictId ? ['==', 'id', selectedDistrictId] : ['==', 'id', ''];
      if (map.getLayer('districts-highlight-halo')) {
        map.setFilter('districts-highlight-halo', filterCondition as any);
      }
      if (map.getLayer('districts-selected-border')) {
        map.setFilter('districts-selected-border', filterCondition as any);
      }
    } catch {
      // Non-blocking filter update
    }
  }, [selectedDistrictId, mapLoaded]);

  // Auto-Framing & Bounding-Box Camera Flight (Dynamic fitBounds Padding)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      const isMobile = window.innerWidth < 1024;

      // 1. Operational Centre Selection: Auto-pitch into 3D Buildings
      if (selectedCentre) {
        map.flyTo({
          center: [selectedCentre.lng, selectedCentre.lat],
          zoom: isMobile ? 14.0 : 15.2,
          pitch: 55,
          bearing: -20,
          essential: true,
          duration: 900,
        });
        return;
      }

      // Dynamic Asymmetric Padding: 416px right margin when desktop inspector is open, 40px when collapsed
      // Adjusted top: 64, bottom: 120, right: 416, left: 40 so Coimbatore (TN) sits cleanly above the bottom lens dock on initial desktop load
      const desktopPadding = isInspectorCollapsed
        ? { top: 64, left: 40, right: 48, bottom: 120 }
        : { top: 64, left: 40, right: 416, bottom: 120 };

      // 2. 1-Click NGO Spotlight Zoom in Selected District (e.g. Smile frames Baramati + Shirur)
      if (selectedDistrictId && selectedNgoId) {
        const ngoCentres = operationalCentres.filter(
          (c) => c.district.toLowerCase() === selectedDistrictId.toLowerCase() && c.ngoId === selectedNgoId
        );
        if (ngoCentres.length > 0) {
          let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
          ngoCentres.forEach((c) => {
            minLng = Math.min(minLng, c.lng);
            minLat = Math.min(minLat, c.lat);
            maxLng = Math.max(maxLng, c.lng);
            maxLat = Math.max(maxLat, c.lat);
          });
          if (minLng === maxLng && minLat === maxLat) {
            minLng -= 0.04;
            maxLng += 0.04;
            minLat -= 0.04;
            maxLat += 0.04;
          }
          map.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: isMobile
                ? { top: 32, bottom: 32, left: 24, right: 24 }
                : desktopPadding,
              maxZoom: 12.8,
              pitch: is3D ? 55 : 0,
              bearing: is3D ? -20 : 0,
              essential: true,
              duration: 900,
            }
          );
          return;
        }
      }

      if (selectedDistrictId) {
        const target = SPATIAL_CAMERA_PRESETS[selectedDistrictId];
        if (target) {
          if (target.bbox) {
            map.fitBounds(
              [
                [target.bbox[0], target.bbox[1]],
                [target.bbox[2], target.bbox[3]],
              ],
              {
                padding: isMobile
                  ? { top: 24, bottom: 24, left: 16, right: 16 }
                  : desktopPadding,
                maxZoom: target.zoom || 9.8,
                pitch: is3D ? 55 : 0,
                bearing: is3D ? -20 : 0,
                essential: true,
                duration: 900,
              }
            );
          } else {
            map.flyTo({
              center: target.center,
              zoom: isMobile ? Math.max(8.6, target.zoom - 0.6) : target.zoom,
              pitch: is3D ? 55 : 0,
              bearing: is3D ? -20 : 0,
              essential: true,
              duration: 900,
            });
          }
        }
      } else if (selectedState) {
        const stateKey = selectedState.toLowerCase().replace(/\s+/g, '_');
        const target = SPATIAL_CAMERA_PRESETS[stateKey];
        if (target && target.bbox) {
          map.fitBounds(
            [
              [target.bbox[0], target.bbox[1]],
              [target.bbox[2], target.bbox[3]],
            ],
            {
              padding: isMobile
                ? { top: 24, bottom: 24, left: 16, right: 16 }
                : desktopPadding,
              maxZoom: target.zoom || 7.6,
              pitch: 0,
              bearing: 0,
              essential: true,
              duration: 850,
            }
          );
        } else if (target) {
          map.flyTo({
            center: target.center,
            zoom: target.zoom,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 850,
          });
        }
      } else {
        // Chapter 1: All India Overview (Guarantees Coimbatore and all 6 districts fit 100% inside open canvas)
        const target = SPATIAL_CAMERA_PRESETS.all_india;
        if (target && target.bbox) {
          map.fitBounds(
            [
              [target.bbox[0], target.bbox[1]],
              [target.bbox[2], target.bbox[3]],
            ],
            {
              padding: isMobile
                ? { top: 20, bottom: 20, left: 16, right: 16 }
                : desktopPadding,
              maxZoom: 5.8,
              pitch: 0,
              bearing: 0,
              essential: true,
              duration: 850,
            }
          );
        } else {
          map.flyTo({
            center: target.center,
            zoom: isMobile ? 4.3 : 5.1,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 850,
          });
        }
      }
    } catch (err) {
      console.error('Camera flight error:', err);
    }
  }, [selectedDistrictId, selectedState, selectedNgoId, selectedCentre, is3D, isInspectorCollapsed, mapLoaded]);

  // Operational Centres & Targets
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (hoverPopupRef.current) {
      hoverPopupRef.current.remove();
      hoverPopupRef.current = null;
    }

    const shouldShowCentres = !!selectedDistrictId || !!selectedNgoId || isZoomedIn;

    // ── 0. DISTRICT CENTROID BADGES (Visible in high-level Territory View) ──
    if (!selectedDistrictId && !isZoomedIn) {
      DISTRICT_GEOJSON.features.forEach((feat) => {
        const props = feat.properties;
        const target = SPATIAL_CAMERA_PRESETS[props.id];
        if (!target) return;

        const el = document.createElement('div');
        el.className = 'cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95';
        const isFlagged = props.auditStatus === 'flagged';
        const badgeColor = isFlagged
          ? '#B42318'
          : props.id === 'coimbatore'
          ? '#B5532A'
          : props.id === 'nashik' || props.id === 'chhindwara'
          ? '#2E6B4E'
          : '#0B4A7D';

        el.innerHTML = `
          <!-- Desktop/Tablet Pill (>= 640px) -->
          <div class="hidden sm:flex px-2.5 py-1 rounded-xl border shadow-xs text-[11px] font-bold items-center gap-1.5 backdrop-blur-md ${
            isFlagged
              ? 'bg-[#FCECEB]/95 text-[#B42318] border-[#B42318]/40 ring-2 ring-[#B42318]/20'
              : 'bg-[#FCFBF8]/95 text-[#1C1917] border-[#E5DFD3] hover:border-[#0B4A7D] ring-2 ring-[#0B4A7D]/10'
          }">
            <span class="w-2 h-2 rounded-full" style="background-color: ${badgeColor};"></span>
            <span>${props.name}</span>
            <span class="${isFlagged ? 'text-[#B42318]' : 'text-[#0B4A7D]'} font-mono">${Math.round(props.impactIndex)}</span>
          </div>

          <!-- Mobile Compact Circular Score Badge (< 640px) -->
          <div class="sm:hidden w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm border-2 backdrop-blur-md ${
            isFlagged
              ? 'bg-[#FCECEB]/95 text-[#B42318] border-[#B42318]'
              : 'bg-[#FCFBF8]/95 text-[#1C1917]'
          }" style="${isFlagged ? '' : `border-color: ${badgeColor};`}">
            ${Math.round(props.impactIndex)}
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

    // ── 1. OPERATIONAL CENTRE TARGET PIN POINTERS ──
    if (shouldShowCentres) {
      const isSpotlight = Boolean(selectedNgoId);
      const centresToRender = operationalCentres.filter((c) => {
        if (selectedDistrictId && c.district.toLowerCase() !== selectedDistrictId.toLowerCase()) {
          return false;
        }
        if (selectedNgoId && c.ngoId !== selectedNgoId) {
          return false;
        }
        return true;
      });

      centresToRender.forEach((centre) => {
        const ngoColor = getNgoColor(centre.ngoId, centre.district);
        const isFlagged = centre.status === 'flagged';
        const isSelected = selectedCentre?.id === centre.id;
        const labelVisibility = isSpotlight
          ? 'opacity-100'
          : (isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100');

        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer flex flex-col items-center';
        el.setAttribute('data-centre-id', centre.id);
        el.setAttribute('data-testid', `target-pin-${centre.id}`);
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <!-- Pulsing Concentric Outer Ring -->
            <span class="absolute w-8 h-8 rounded-full ${isFlagged ? 'bg-[#B42318]/30 animate-ping' : isSelected ? 'ring-2 ring-[#0B4A7D]' : 'animate-pulse'}" style="background-color: ${ngoColor}26"></span>
            
            <!-- Crisp Concentric Target Crosshair -->
            <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform duration-150 group-hover:scale-125 ${isSelected ? 'scale-125 ring-2 ring-[#0B4A7D]' : ''}" style="background-color: ${ngoColor}">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
          
          <!-- Compact Centered Target Name Pill -->
          <div class="pointer-events-none mt-1 px-1.5 py-0.2 rounded-md bg-[#FCFBF8]/95 backdrop-blur-md border ${isSelected ? 'border-[#0B4A7D] text-[#0B4A7D] font-bold' : 'border-[#E5DFD3] text-[#1C1917]'} text-[9px] font-semibold shadow-2xs whitespace-nowrap transition-opacity duration-150 ${labelVisibility}">
            ${centre.name.replace(/ Centre| Hub| Belt/g, '')} ${isSpotlight ? `· ${centre.outcomeLift}` : ''}
          </div>
        `;

        // Lightweight Hover Popup (Non-blocking preview)
        const hoverPopup = new Popup({
          offset: 14,
          closeButton: false,
          closeOnClick: false,
          className: 'spatial-target-hover-popup',
        }).setHTML(`
          <div class="p-2 text-xs font-sans space-y-1 bg-[#FCFBF8] rounded-xl shadow-lg border border-[#E3DDD0] max-w-[200px]">
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-bold text-xs text-[#1C1917] truncate">${centre.name}</span>
              <span class="px-1 py-0.2 rounded text-[8px] font-bold ${
                isFlagged ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
              }">
                ${isFlagged ? 'Audit Hold' : 'Verified'}
              </span>
            </div>
            <div class="text-[10px] text-[#6B655C]">
              ${centre.beneficiaries.toLocaleString('en-IN')} women · ${centre.completionPct}% completion
            </div>
            <div class="text-[10px] text-[#2E6B4E] font-semibold">
              Lift: ${centre.outcomeLift}
            </div>
          </div>
        `);

        el.addEventListener('mouseenter', () => {
          hoverPopup.setLngLat([centre.lng, centre.lat]).addTo(map);
          hoverPopupRef.current = hoverPopup;
        });

        el.addEventListener('mouseleave', () => {
          hoverPopup.remove();
          hoverPopupRef.current = null;
        });

        // Click selects centre & synchronizes inspector to Chapter 3
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          hoverPopup.remove();
          hoverPopupRef.current = null;
          onSelectCentreRef.current?.(centre);
        });

        const marker = new Marker({ element: el })
          .setLngLat([centre.lng, centre.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // ── 2. THANE KALWA ANOMALY OVERLAY ──
    if (selectedDistrictId === 'thane' || (isZoomedIn && !selectedDistrictId)) {
      const kalwaCoord: [number, number] = [72.9996, 19.1981];
      const anomalyEl = document.createElement('div');
      anomalyEl.className = 'relative cursor-pointer flex items-center justify-center';
      anomalyEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-12 h-12 rounded-full bg-[#B42318]/30 animate-ping"></span>
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

    // ── 3. SERVICE GAP PULSING RINGS ──
    if (activeLayer === 'service_gaps') {
      serviceGapBlocks.forEach((gap) => {
        const gapEl = document.createElement('div');
        gapEl.className = 'relative flex items-center justify-center cursor-pointer';
        gapEl.innerHTML = `
          <span class="absolute w-8 h-8 rounded-full bg-[#B5532A]/30 animate-pulse"></span>
          <span class="w-3.5 h-3.5 rounded-full bg-[#B5532A] border-2 border-white shadow-sm flex items-center justify-center">
            <span class="w-1 h-1 rounded-full bg-white"></span>
          </span>
        `;

        const gapPopup = new Popup({ offset: 10, closeButton: false }).setHTML(`
          <div class="p-2 text-xs font-sans space-y-0.5 bg-[#FCFBF8] rounded-lg">
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
    selectedCentre,
    isZoomedIn,
    activeLayer,
    operationalCentres,
    serviceGapBlocks,
    onSelectDistrict,
    onSelectState,
    onNavigateToAudit,
    mapLoaded,
  ]);

  // Internal Toggle 2D vs 3D
  const toggle3D = useCallback(() => {
    if (onToggle3D) {
      onToggle3D();
      return;
    }
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const nextState = !internalIs3D;
    setInternalIs3D(nextState);
    map.easeTo({
      pitch: nextState ? 55 : 0,
      bearing: nextState ? -20 : 0,
      duration: 600,
    });
  }, [internalIs3D, onToggle3D, mapLoaded]);

  // True WebGL Fallback SVG Map
  if (useSvgFallback) {
    return (
      <div className={`relative w-full h-full min-h-[340px] bg-[#F3EFE6] rounded-2xl border border-[#E5DFD3] overflow-hidden flex flex-col justify-between p-4 ${className}`}>
        <div className="flex items-center justify-between text-xs border-b border-[#E5DFD3] pb-2">
          <span className="font-bold text-[#1C1917]">Interactive Spatial Map (Vector SVG Mode)</span>
          <span className="text-[10px] text-[#8C8479]">3 States · 6 Districts</span>
        </div>

        <div className="relative flex-1 flex items-center justify-center p-2">
          <svg viewBox="0 0 460 360" className="w-full h-full max-h-[460px]">
            <path
              d="M 60,110 L 120,105 L 180,115 L 210,140 L 190,190 L 130,200 L 70,170 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <path
              d="M 120,30 L 220,20 L 290,50 L 310,100 L 250,115 L 140,95 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <path
              d="M 170,240 L 240,245 L 250,320 L 190,340 L 160,290 Z"
              fill="#EFECE4"
              stroke="#D8D0C0"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />

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
                fill="#0B4A7D"
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
              <text x="110" y="125" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
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
                points="180,75 215,65 225,95 190,105"
                fill="#2E6B4E"
                fillOpacity={selectedDistrictId === 'chhindwara' ? 0.75 : 0.38}
                stroke="#2E6B4E"
                strokeWidth={selectedDistrictId === 'chhindwara' ? 3 : 1.5}
              />
              <text x="200" y="90" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1917">
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
                points="230,45 265,35 275,65 240,75"
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
    <div className={`relative w-full h-full min-h-[340px] overflow-hidden bg-[#F3EFE6] select-none ${className}`}>
      {/* ── MAPLIBRE CANVAS CONTAINER ── */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[340px]"
        aria-label="MapLibre 5-Level Spatial Impact Explorer"
      />

      {/* ── OPTIONAL INTERNAL CONTROLS (Only if parent dock does not provide them) ── */}
      {showInternalControls && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggle3D}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              is3D
                ? 'bg-[#0B4A7D] text-white border-[#0B4A7D] ring-2 ring-[#0B4A7D]/25'
                : 'bg-[#FCFBF8] text-[#1C1917] border-[#E5DFD3] hover:border-[#0B4A7D]'
            }`}
            title="Toggle 2D Map vs 3D Architectural Buildings"
          >
            <Building2 size={13} />
            <span>{is3D ? '3D Buildings' : '2D Map'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectDistrict(null);
              onSelectState(null);
              onSelectNgo(null);
            }}
            className="p-1.5 rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917] hover:border-[#0B4A7D] transition-all cursor-pointer shadow-2xs"
            title="Reset to All India View"
          >
            <Compass size={14} />
          </button>
        </div>
      )}

      {/* ── DESKTOP HOVER TOOLTIP (TOP-LEFT) ── */}
      {hoveredDistrict && (
        <div className="absolute top-16 left-4 z-20 pointer-events-none hidden sm:block p-3 rounded-xl bg-[#FCFBF8]/95 backdrop-blur-md border border-[#E5DFD3] text-xs shadow-lg max-w-xs space-y-1">
          <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD3] pb-1">
            <span className="font-bold text-[#1C1917]">{hoveredDistrict.name} District</span>
            <span className="text-[10px] text-[#8C8479]">{hoveredDistrict.state}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-[10px] text-[#8C8479] block">BENEFICIARIES</span>
              <span className="font-bold text-[#1C1917]">{hoveredDistrict.women.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8C8479] block">IMPACT INDEX</span>
              <span className="font-bold text-[#0B4A7D]">{Math.round(hoveredDistrict.impactIndex)}/100</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8C8479] block">SROI MULTIPLIER</span>
              <span className="font-semibold text-[#2E6B4E]">₹{hoveredDistrict.sroiMultiplier}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8C8479] block">AUDIT INTEGRITY</span>
              <span className={`font-semibold ${hoveredDistrict.auditStatus === 'flagged' ? 'text-[#B42318]' : 'text-[#2E6B4E]'}`}>
                {hoveredDistrict.auditScore}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
