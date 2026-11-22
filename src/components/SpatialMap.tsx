import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  type Map as MapLibreMap,
  NavigationControl,
  Marker,
  Popup,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DISTRICT_GEOJSON,
  SPATIAL_CAMERA_PRESETS,
  type DistrictGeoFeature,
} from '../data/districtGeoJson';
import {
  useImpactStore,
  type OperationalCentre,
  type ServiceGapBlock,
} from '../data/impactStore';
import {
  AlertTriangle,
  Layers,
  ArrowRight,
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
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeoFeature['properties'] | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [77.2, 19.5],
        zoom: 5.2,
        pitch: 0,
        bearing: 0,
        cooperativeGestures: true,
        attributionControl: false,
      });

      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', () => {
        // Softly retint Positron layers to match Warm Khadi palette (#F6F3EC)
        try {
          const style = map.getStyle();
          if (style && style.layers) {
            style.layers.forEach((layer: any) => {
              if (layer.type === 'background') {
                map.setPaintProperty(layer.id, 'background-color', '#F6F3EC');
              } else if (layer.type === 'fill' && layer.id.includes('water')) {
                map.setPaintProperty(layer.id, 'fill-color', '#E4EDF4');
              } else if (layer.type === 'line' && (layer.id.includes('road') || layer.id.includes('tunnel'))) {
                map.setPaintProperty(layer.id, 'line-color', '#E3DDD0');
              }
            });
          }
        } catch {
          // Non-blocking style retint error
        }

        // Add Local GeoJSON Source
        map.addSource('districts-data', {
          type: 'geojson',
          data: DISTRICT_GEOJSON as any,
        });

        // Add 2.5D Extrusion Layer (controlled by pitch/is25D)
        map.addLayer({
          id: 'districts-extrusion',
          type: 'fill-extrusion',
          source: 'districts-data',
          paint: {
            'fill-extrusion-color': [
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
              '#EAE6DD',
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['get', 'women'],
              3000,
              6000,
              8000,
              14000,
              14000,
              26000,
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.75,
          },
          layout: {
            visibility: 'none',
          },
        });

        // Add District Base Fills
        map.addLayer({
          id: 'districts-fill',
          type: 'fill',
          source: 'districts-data',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'id'], 'pune'],
              '#0B4A7D',
              ['==', ['get', 'id'], 'thane'],
              '#B42318',
              ['==', ['get', 'id'], 'nashik'],
              '#2E6B4E',
              ['==', ['get', 'id'], 'chhindwara'],
              '#2E6B4E',
              ['==', ['get', 'id'], 'jabalpur'],
              '#0B4A7D',
              ['==', ['get', 'id'], 'coimbatore'],
              '#B5532A',
              '#EAE6DD',
            ],
            'fill-opacity': 0.22,
          },
        });

        // Add District Perimeter Outlines
        map.addLayer({
          id: 'districts-outline',
          type: 'line',
          source: 'districts-data',
          paint: {
            'line-color': '#C8BFB0',
            'line-width': 1.2,
          },
        });

        // Add Selected District Highlight Perimeter
        map.addLayer({
          id: 'districts-selected-outline',
          type: 'line',
          source: 'districts-data',
          paint: {
            'line-color': '#0B4A7D',
            'line-width': 2.8,
          },
          filter: ['==', 'id', ''],
        });

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

      map.on('error', () => {
        // Fallback gracefully without breaking React
        setMapError('Interactive map rendering in static mode.');
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch {
      setMapError('WebGL unavailable or tile server blocked.');
    }
  }, []);

  // Update Dynamic Shading & Extrusion based on Active Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (activeLayer === 'outcomes') {
        // High impact = deep Bajaj Blue & Moss, Low impact = crimson/neutral
        map.setPaintProperty('districts-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['get', 'impactIndex'],
          50,
          '#FCECEB',
          65,
          '#FEF6EE',
          75,
          '#E8F3EC',
          85,
          '#0B4A7D',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.28);
      } else if (activeLayer === 'cost_efficiency') {
        // Higher SROI = deeper Botanical Moss
        map.setPaintProperty('districts-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['get', 'sroiMultiplier'],
          1.0,
          '#FCECEB',
          2.0,
          '#FEF6EE',
          3.0,
          '#E8F3EC',
          3.6,
          '#2E6B4E',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.32);
      } else if (activeLayer === 'service_gaps') {
        // Covered districts muted; service gaps highlighted
        map.setPaintProperty('districts-fill', 'fill-color', [
          'case',
          ['>', ['get', 'serviceGapsCount'], 0],
          '#FAEDE6',
          '#F2EFE8',
        ]);
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.4);
      }
    } catch {
      // Non-blocking paint property fallback
    }
  }, [activeLayer, mapLoaded]);

  // Update Selected District Highlight Outline
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (selectedDistrictId) {
        map.setFilter('districts-selected-outline', ['==', 'id', selectedDistrictId]);
      } else {
        map.setFilter('districts-selected-outline', ['==', 'id', '']);
      }
    } catch {
      // Ignored
    }
  }, [selectedDistrictId, mapLoaded]);

  // Toggle 2D vs 2.5D Extrusion View
  const toggle25D = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextMode = !is25D;
    setIs25D(nextMode);

    if (nextMode) {
      map.easeTo({
        pitch: 38,
        bearing: -10,
        duration: 500,
      });
      if (map.getLayer('districts-extrusion')) {
        map.setLayoutProperty('districts-extrusion', 'visibility', 'visible');
      }
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 500,
      });
      if (map.getLayer('districts-extrusion')) {
        map.setLayoutProperty('districts-extrusion', 'visibility', 'none');
      }
    }
  }, [is25D]);

  // Smooth flyTo transitions on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedDistrictId && SPATIAL_CAMERA_PRESETS[selectedDistrictId]) {
      const preset = SPATIAL_CAMERA_PRESETS[selectedDistrictId];
      map.flyTo({
        center: preset.center,
        zoom: preset.zoom,
        pitch: is25D ? 38 : 0,
        duration: 650,
        essential: true,
      });
    } else if (selectedState) {
      const stateKey = selectedState.toLowerCase().replace(/\s+/g, '_');
      if (SPATIAL_CAMERA_PRESETS[stateKey]) {
        const preset = SPATIAL_CAMERA_PRESETS[stateKey];
        map.flyTo({
          center: preset.center,
          zoom: preset.zoom,
          pitch: is25D ? 38 : 0,
          duration: 650,
          essential: true,
        });
      }
    } else {
      map.flyTo({
        center: SPATIAL_CAMERA_PRESETS.all_india.center,
        zoom: SPATIAL_CAMERA_PRESETS.all_india.zoom,
        pitch: is25D ? 38 : 0,
        duration: 650,
        essential: true,
      });
    }
  }, [selectedDistrictId, selectedState, mapLoaded, is25D]);

  // Update Operational Centre & Service Gap Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers & popups
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (auditPopupRef.current) {
      auditPopupRef.current.remove();
      auditPopupRef.current = null;
    }

    // Determine centres to display:
    // If a district is selected, display that district's centres. If an NGO is selected, filter by NGO.
    const relevantCentres = operationalCentres.filter((c) => {
      if (selectedDistrictId && c.district.toLowerCase() !== selectedDistrictId.toLowerCase()) {
        return false;
      }
      if (selectedNgoId && c.ngoId !== selectedNgoId) {
        return false;
      }
      return true;
    });

    relevantCentres.forEach((centre) => {
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';

      // Pick badge color based on NGO and status
      let badgeColor = '#2E6B4E'; // default Moss
      if (centre.status === 'flagged') badgeColor = '#B42318';
      else if (centre.ngoId === 'pratham') badgeColor = '#0B4A7D';
      else if (centre.ngoId === 'smile') badgeColor = '#B5532A';
      else if (centre.ngoId === 'magic-bus') badgeColor = '#A86414';

      el.innerHTML = `
        <div style="background-color: ${badgeColor};" class="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform transform group-hover:scale-125">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <div class="bg-[#1C1917] text-[#FCFBF8] text-[10px] font-sans px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
            <span class="font-bold">${centre.name}</span> · ${centre.beneficiaries.toLocaleString('en-IN')} women
            <div class="text-[9px] text-[#D6CFC2]">${centre.outcomeLift} · ${centre.completionPct}% pass</div>
          </div>
          <div class="w-1.5 h-1.5 bg-[#1C1917] rotate-45 -mt-1"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCentre?.(centre);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([centre.lng, centre.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Special Thane Anomaly Pulse & Audit Button
    if (!selectedDistrictId || selectedDistrictId === 'thane') {
      const kalwaCentre = operationalCentres.find((c) => c.id === 'cnt-magicbus-kalwa');
      if (kalwaCentre) {
        const pulseEl = document.createElement('div');
        pulseEl.className = 'relative flex items-center justify-center';
        pulseEl.innerHTML = `
          <div class="absolute w-8 h-8 rounded-full bg-[#B42318]/25 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-[#B42318] border-2 border-white shadow-lg flex items-center justify-center cursor-pointer">
            <span class="text-[9px] font-bold text-white">!</span>
          </div>
          <div class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#B42318] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
            142 GPS Cluster Flags
          </div>
        `;

        pulseEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectDistrict('thane');
          onSelectNgo('magic-bus');
          if (onNavigateToAudit) onNavigateToAudit();
        });

        const pulseMarker = new maplibregl.Marker({ element: pulseEl })
          .setLngLat([kalwaCentre.lng, kalwaCentre.lat])
          .addTo(map);

        markersRef.current.push(pulseMarker);
      }
    }

    // Service Gap Markers (When Service Gaps Layer is Active)
    if (activeLayer === 'service_gaps') {
      serviceGapBlocks.forEach((gap: ServiceGapBlock) => {
        const gapEl = document.createElement('div');
        gapEl.className = 'group relative cursor-pointer flex flex-col items-center';
        gapEl.innerHTML = `
          <div class="w-5 h-5 rounded-full border-2 border-dashed border-[#B5532A] bg-[#FAEDE6] flex items-center justify-center shadow-xs">
            <div class="w-1.5 h-1.5 rounded-full bg-[#B5532A]"></div>
          </div>
          <div class="mt-1 bg-[#FAEDE6] border border-[#B5532A]/30 text-[#B5532A] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
            ${gap.name.split(' ')[0]} Gap (₹${gap.recommendedAllocationCr} Cr)
          </div>
        `;

        const gapMarker = new maplibregl.Marker({ element: gapEl })
          .setLngLat([gap.lng, gap.lat])
          .addTo(map);

        markersRef.current.push(gapMarker);
      });
    }
  }, [
    operationalCentres,
    serviceGapBlocks,
    selectedDistrictId,
    selectedNgoId,
    activeLayer,
    mapLoaded,
    onSelectDistrict,
    onSelectNgo,
    onSelectCentre,
    onNavigateToAudit,
  ]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-[#F6F3EC] border border-[#E5DFD3] shadow-xs ${className}`}>
      {/* ── MAP CONTAINER ── */}
      <div
        ref={mapContainerRef}
        className="w-full h-[320px] sm:h-[480px] lg:h-[580px]"
        aria-label="MapLibre 5-Level CSR Spatial Impact Explorer"
      />

      {/* ── CONTROLS OVERLAY: 2D/2.5D TILT & RESET CAMERA ── */}
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
              ? 'Outcome Index (0–100)'
              : activeLayer === 'cost_efficiency'
              ? 'SROI Efficiency'
              : 'Service Gaps & Unserved Hubs'}
          </span>
        </span>
        <span className="text-[#8C8479]">·</span>
        <span className="text-[#6B655C]">6 Districts · 20 Centres</span>
      </div>

      {/* ── DESKTOP HOVER TOOLTIP ── */}
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

      {/* ── MOBILE TAP PREVIEW STRIP (< 768px) ── */}
      {selectedDistrictId && (
        <div className="sm:hidden p-3 bg-[#FCFBF8] border-t border-[#E5DFD3] flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#1C1917] capitalize">{selectedDistrictId} District</span>
            <span className="text-[10px] text-[#6B655C] block">
              {operationalCentres.filter((c) => c.district.toLowerCase() === selectedDistrictId.toLowerCase()).length} Active Centres
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#0B4A7D] flex items-center gap-1">
            <span>Inspecting</span>
            <ArrowRight size={12} />
          </span>
        </div>
      )}

      {/* Error or Static Mode Banner */}
      {mapError && (
        <div className="absolute inset-x-3 bottom-12 z-20 p-2.5 rounded-xl bg-[#FEF6EE] border border-[#A86414]/20 text-[#A86414] text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{mapError}</span>
        </div>
      )}
    </div>
  );
};
