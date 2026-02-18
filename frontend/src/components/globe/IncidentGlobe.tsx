import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { Incident } from '../../types/api';

const HUB_COORDS: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.71, lng: -74.01 },
  'Los Angeles': { lat: 34.05, lng: -118.24 },
  'Chicago': { lat: 41.88, lng: -87.63 },
  'Dallas': { lat: 32.78, lng: -96.80 },
  'Mexico City': { lat: 19.43, lng: -99.13 },
  'São Paulo': { lat: -23.55, lng: -46.63 },
  'Buenos Aires': { lat: -34.60, lng: -58.38 },
  'Bogotá': { lat: 4.71, lng: -74.07 },
  'London': { lat: 51.51, lng: -0.13 },
  'Frankfurt': { lat: 50.11, lng: 8.68 },
  'Madrid': { lat: 40.42, lng: -3.70 },
  'Dubai': { lat: 25.20, lng: 55.27 },
  'Istanbul': { lat: 41.01, lng: 28.98 },
  'Shanghai': { lat: 31.23, lng: 121.47 },
  'Mumbai': { lat: 19.08, lng: 72.88 },
  'Tokyo': { lat: 35.68, lng: 139.69 },
  'Singapore': { lat: 1.35, lng: 103.82 },
  'Sydney': { lat: -33.87, lng: 151.21 },
  'Nairobi': { lat: -1.29, lng: 36.82 },
  'Lagos': { lat: 6.52, lng: 3.38 },
  'Johannesburg': { lat: -26.20, lng: 28.04 },
  'Melbourne': { lat: -37.81, lng: 144.96 },
  'Auckland': { lat: -36.85, lng: 174.76 },
  'Brisbane': { lat: -27.47, lng: 153.03 },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
};

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  incident: Incident;
  label: string;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
}

interface IncidentGlobeProps {
  incidents: Incident[];
}

export function IncidentGlobe({ incidents }: IncidentGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [hoverPoint, setHoverPoint] = useState<GlobePoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(400, Math.min(entry.contentRect.width * 0.7, 550)),
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const gl = globeRef.current as Record<string, unknown> | null;
    if (gl && typeof gl === 'object') {
      const controls = gl.controls as (() => { autoRotate: boolean; autoRotateSpeed: number }) | undefined;
      if (controls && typeof controls === 'function') {
        const c = controls();
        c.autoRotate = true;
        c.autoRotateSpeed = 0.4;
      }
    }
  }, []);

  const points: GlobePoint[] = useMemo(() => {
    return incidents
      .filter((inc) => HUB_COORDS[inc.hub])
      .map((inc) => {
        const coords = HUB_COORDS[inc.hub];
        const sizeMap: Record<string, number> = { critical: 0.7, high: 0.55, medium: 0.4, low: 0.3 };
        return {
          lat: coords.lat + (Math.random() - 0.5) * 2,
          lng: coords.lng + (Math.random() - 0.5) * 2,
          size: sizeMap[inc.severity] ?? 0.3,
          color: SEVERITY_COLORS[inc.severity] ?? '#3b82f6',
          incident: inc,
          label: `${inc.id} - ${inc.hub} (${inc.severity})`,
        };
      });
  }, [incidents]);

  const arcs: GlobeArc[] = useMemo(() => {
    const result: GlobeArc[] = [];
    const criticalPoints = points.filter((p) => p.incident.severity === 'critical' || p.incident.severity === 'high');
    for (let i = 0; i < criticalPoints.length; i++) {
      for (let j = i + 1; j < criticalPoints.length; j++) {
        const a = criticalPoints[i];
        const b = criticalPoints[j];
        if (a.incident.category === b.incident.category && a.incident.region !== b.incident.region) {
          result.push({
            startLat: a.lat,
            startLng: a.lng,
            endLat: b.lat,
            endLng: b.lng,
            color: a.incident.severity === 'critical' ? 'rgba(239,68,68,0.35)' : 'rgba(249,115,22,0.25)',
            label: `${a.incident.hub} <-> ${b.incident.hub}: ${a.incident.category}`,
          });
        }
      }
    }
    return result;
  }, [points]);

  const handlePointHover = useCallback((point: object | null) => {
    if (point) {
      setHoverPoint(point as GlobePoint);
    } else {
      setHoverPoint(null);
    }
  }, []);

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (hoverPoint) {
        setTooltipPos({ x: ev.clientX, y: ev.clientY });
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [hoverPoint]);

  return (
    <div ref={containerRef} className="globe-container">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="/earth-night.jpg"
        backgroundImageUrl=""
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.2}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointRadius="size"
        pointColor="color"
        pointAltitude={0.01}
        pointLabel="label"
        onPointHover={handlePointHover}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcLabel="label"
      />
      {hoverPoint && (
        <div
          className="globe-tooltip"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="globe-tooltip-header">
            <span className={`severity-dot ${hoverPoint.incident.severity}`} />
            <strong>{hoverPoint.incident.id}</strong>
          </div>
          <div className="globe-tooltip-row">
            <span className="globe-tooltip-label">Hub:</span> {hoverPoint.incident.hub} ({hoverPoint.incident.region})
          </div>
          <div className="globe-tooltip-row">
            <span className="globe-tooltip-label">Category:</span> {hoverPoint.incident.category}
          </div>
          <div className="globe-tooltip-row">
            <span className="globe-tooltip-label">Severity:</span>
            <span className={`severity-text ${hoverPoint.incident.severity}`}>{hoverPoint.incident.severity}</span>
          </div>
          <div className="globe-tooltip-row">
            <span className="globe-tooltip-label">Status:</span> {hoverPoint.incident.status}
          </div>
          <div className="globe-tooltip-desc">{hoverPoint.incident.description}</div>
          <div className="globe-tooltip-age">{hoverPoint.incident.created_hours_ago.toFixed(1)}h ago</div>
        </div>
      )}
      <div className="globe-legend">
        <div className="globe-legend-item"><span className="legend-dot critical" /> Critical</div>
        <div className="globe-legend-item"><span className="legend-dot high" /> High</div>
        <div className="globe-legend-item"><span className="legend-dot medium" /> Medium</div>
        <div className="globe-legend-item"><span className="legend-dot low" /> Low</div>
        <div className="globe-legend-item"><span className="legend-arc" /> Related incidents</div>
      </div>
    </div>
  );
}
