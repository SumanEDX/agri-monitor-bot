import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  height?: string;
  className?: string;
}

const FlyToMarker = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
};

const selectedIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowSize: [41, 41],
  className: "selected-marker",
});

const MapView = ({ markers, selectedId, onMarkerClick, height = "300px", className = "" }: MapViewProps) => {
  const validMarkers = markers.filter((m) => m.latitude && m.longitude);

  if (validMarkers.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-sm ${className}`} style={{ height }}>
        No locations set. Add latitude/longitude to see the map.
      </div>
    );
  }

  const selected = selectedId ? validMarkers.find((m) => m.id === selectedId) : null;
  const center: [number, number] = selected
    ? [selected.latitude, selected.longitude]
    : [validMarkers[0].latitude, validMarkers[0].longitude];

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={selected ? 15 : 10} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selected && <FlyToMarker lat={selected.latitude} lng={selected.longitude} />}
        {validMarkers.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={m.id === selectedId ? selectedIcon : new L.Icon.Default()}
            eventHandlers={{ click: () => onMarkerClick?.(m.id) }}
          >
            <Popup>
              <strong>{m.name}</strong>
              {m.description && <p className="text-xs mt-1">{m.description}</p>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
