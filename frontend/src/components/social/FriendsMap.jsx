import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../../context/SocketContext';
import { useFriends } from '../../hooks/useFriends';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icon for friends
const createFriendIcon = (isOnline, initial) => {
  const color = isOnline ? '#22c55e' : '#6b7280';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="12" fill="white"/>
      <text x="20" y="23" text-anchor="middle" font-size="14" font-weight="bold" fill="${color}">${initial}</text>
    </svg>
  `;
  
  return L.divIcon({
    html: svg,
    className: 'custom-friend-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

// Component to handle map view updates
const MapViewController = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
      );
      // Use a lower maxZoom to ensure we can see all markers spread out
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 4 });
    }
  }, [locations, map]);

  return null;
};

// Apply small offset to overlapping markers
const applyOffsetToOverlapping = (locations) => {
  const offsetLocations = [...locations];
  const threshold = 0.5; // degrees - roughly 50km
  
  for (let i = 0; i < offsetLocations.length; i++) {
    for (let j = i + 1; j < offsetLocations.length; j++) {
      const loc1 = offsetLocations[i];
      const loc2 = offsetLocations[j];
      const latDiff = Math.abs(loc1.coordinates.lat - loc2.coordinates.lat);
      const lngDiff = Math.abs(loc1.coordinates.lng - loc2.coordinates.lng);
      
      // If markers are too close, apply small offset
      if (latDiff < threshold && lngDiff < threshold) {
        offsetLocations[j] = {
          ...loc2,
          coordinates: {
            lat: loc2.coordinates.lat + 0.3,
            lng: loc2.coordinates.lng + 0.3
          }
        };
      }
    }
  }
  return offsetLocations;
};

export const FriendsMap = ({ className = '', onSelectFriend }) => {
  const { friendLocations, requestFriendLocations } = useSocket() || {};
  const { friends } = useFriends();
  const [locationsArray, setLocationsArray] = useState([]);
  const [hasRequestedLocations, setHasRequestedLocations] = useState(false);

  useEffect(() => {
    // Request friend locations on mount (only once)
    if (requestFriendLocations && !hasRequestedLocations) {
      requestFriendLocations();
      setHasRequestedLocations(true);
    }
  }, [requestFriendLocations, hasRequestedLocations]);

  // Use a stable reference for friends IDs to avoid infinite loop
  const friendsKey = friends.map(f => f._id).join(',');
  
  useEffect(() => {
    // Convert friendLocations object to array with friend details
    // Also include location data from friends API if socket data isn't available
    console.log('FriendsMap: Processing locations', { friends, friendLocations });
    
    if (friends.length > 0) {
      const locations = friends
        .map((friend) => {
          // Prefer socket location data, fall back to REST API location data
          const socketLocation = friendLocations?.[friend._id];
          const apiLocation = friend.location;
          const location = socketLocation || apiLocation;
          
          console.log(`Friend ${friend.name}: socketLoc=`, socketLocation, 'apiLoc=', apiLocation);
          
          // Check if we have valid coordinates
          const coords = location?.coordinates;
          // Accept any coordinates that exist (even 0,0 means they set their location)
          // But we need at least city OR valid non-zero coords
          const hasCoords = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
          const hasNonZeroCoords = hasCoords && (coords.lat !== 0 || coords.lng !== 0);
          const hasCity = location?.city && location.city.length > 0;
          
          if (location && (hasNonZeroCoords || hasCity)) {
            // If no coordinates but have city, try to use a default or skip for now
            // For now, only show if we have actual coordinates
            if (!hasNonZeroCoords) {
              console.log(`Friend ${friend.name} has city "${location.city}" but no coordinates`);
              return null;
            }
            
            return {
              ...location,
              friendId: friend._id,
              name: friend.name || friend.email,
              isOnline: friend.isOnline,
              initial: (friend.name?.[0] || friend.email?.[0] || '?').toUpperCase()
            };
          }
          return null;
        })
        .filter(Boolean);
      
      // Apply offset to overlapping markers so they're all visible
      const offsetLocations = applyOffsetToOverlapping(locations);
      console.log('FriendsMap: Final locations array:', offsetLocations);
      setLocationsArray(offsetLocations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendLocations, friendsKey]);

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Friends Around the World
          {locationsArray.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({locationsArray.length} visible)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-full w-full"
            scrollWheelZoom={true}
            style={{ background: '#1a1a2e' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapViewController locations={locationsArray} />
            
            {locationsArray.map((location) => (
              <Marker
                key={location.friendId}
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={createFriendIcon(location.isOnline, location.initial)}
                eventHandlers={{
                  click: () => onSelectFriend?.(location.friendId)
                }}
              >
                <Popup className="friend-popup">
                  <div className="p-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${location.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className="font-semibold">{location.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {location.city}, {location.country}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Updated {formatLastUpdated(location.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-sm z-[1000]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Offline</span>
            </div>
          </div>

          {/* Empty state */}
          {locationsArray.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-[1000]">
              <div className="text-center p-6 max-w-sm">
                <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg font-medium text-white">No friends on the map yet</p>
                <p className="text-sm text-slate-400 mt-2">
                  Friends need to enable "Location Sharing" AND allow browser geolocation to appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsMap;
