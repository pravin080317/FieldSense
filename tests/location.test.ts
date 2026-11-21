import test from "node:test";
import assert from "node:assert/strict";
import {
  requestDevicePosition,
  locationError,
} from "../src/services/location.ts";
type Provider = NonNullable<Parameters<typeof requestDevicePosition>[0]>;
test("location requires a secure context and a supported provider", async () => {
  await assert.rejects(
    requestDevicePosition(undefined, false),
    /HTTPS or localhost/,
  );
  await assert.rejects(
    requestDevicePosition(undefined, true),
    /does not support/,
  );
});
test("device location requests fresh high-accuracy coordinates and preserves accuracy", async () => {
  const provider: Provider = {
    getCurrentPosition(success, _, options) {
      assert.deepEqual(options, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
      success({
        coords: { latitude: 11.6, longitude: 78.1, accuracy: 25 },
        timestamp: 123456,
      });
    },
  };
  assert.deepEqual(await requestDevicePosition(provider, true), {
    lat: 11.6,
    lng: 78.1,
    accuracy: 25,
    timestamp: 123456,
  });
});
test("location distinguishes permission, unavailable and timeout failures", async () => {
  for (const code of [1, 2, 3]) {
    const provider: Provider = {
      getCurrentPosition(_, failure) {
        failure({ code });
      },
    };
    await assert.rejects(
      requestDevicePosition(provider, true),
      (e: Error) => e.message === locationError(code),
    );
  }
  assert.match(locationError(1), /permission was blocked/);
  assert.match(locationError(2), /could not find/);
  assert.match(locationError(3), /too long/);
});
test("invalid returned coordinates and accuracy are rejected", async () => {
  for (const coords of [
    { latitude: 91, longitude: 0, accuracy: 1 },
    { latitude: 0, longitude: 181, accuracy: 1 },
    { latitude: NaN, longitude: 0, accuracy: 1 },
    { latitude: 0, longitude: 0, accuracy: -1 },
  ]) {
    const provider: Provider = {
      getCurrentPosition(success) {
        success({ coords, timestamp: 123456 });
      },
    };
    await assert.rejects(
      requestDevicePosition(provider, true),
      /invalid position/,
    );
  }
});
