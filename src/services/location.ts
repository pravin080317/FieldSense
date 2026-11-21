export interface DevicePosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}
interface LocationProvider {
  getCurrentPosition(
    success: (position: {
      coords: { latitude: number; longitude: number; accuracy: number };
      timestamp: number;
    }) => void,
    failure: (error: { code: number }) => void,
    options: {
      enableHighAccuracy: boolean;
      timeout: number;
      maximumAge: number;
    },
  ): void;
}
export function locationError(code: number): string {
  if (code === 1)
    return "Location permission was blocked. Allow location for this site in your browser and device settings, then try again. You can still enter field coordinates manually.";
  if (code === 2)
    return "Your device could not find its location. Check device location services and try outdoors; a desktop may only provide an approximate position.";
  if (code === 3)
    return "Location took too long. Check device location services and try again, preferably outdoors.";
  return "Could not read your device location. You can enter coordinates manually in My field.";
}
export function requestDevicePosition(
  provider: LocationProvider | undefined,
  secure: boolean,
): Promise<DevicePosition> {
  if (!secure)
    return Promise.reject(
      new Error(
        "Location needs HTTPS or localhost. An HTTP address on your local network may show the map but cannot request location.",
      ),
    );
  if (!provider)
    return Promise.reject(
      new Error(
        "This browser does not support device location. Enter coordinates in My field instead.",
      ),
    );
  return new Promise((resolve, reject) => {
    provider.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        if (
          ![lat, lng, accuracy, position.timestamp].every(Number.isFinite) ||
          Math.abs(lat) > 90 ||
          Math.abs(lng) > 180 ||
          accuracy < 0
        ) {
          reject(
            new Error("The device returned an invalid position. Try again."),
          );
          return;
        }
        resolve({ lat, lng, accuracy, timestamp: position.timestamp });
      },
      (error) => reject(new Error(locationError(error.code))),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}
