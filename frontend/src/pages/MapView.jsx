import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});
const MapView = ({ incidents }) => {

    const getMarkerIcon = (incident) => {
  let color = "blue";

  if (incident.reviewStatus === "pending") {
    color = "blue";
  } else if (incident.severity === "high") {
    color = "red";
  } else if (incident.severity === "medium") {
    color = "orange";
  } else if (incident.severity === "low") {
    color = "green";
  }

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-[500px] rounded shadow"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map((incident) => (
        <Marker
  key={incident._id}
  position={[
    incident.location.coordinates[1],
    incident.location.coordinates[0],
  ]}
  icon={getMarkerIcon(incident)}
>
          <Popup>
            <h3 className="font-bold">{incident.title}</h3>
            <p>{incident.description}</p>
            <p>Severity: {incident.severity}</p>
            <p>Status: {incident.status}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;