# Novu mobile

Expo mobile app with a local OpenStreetMap-powered Valhalla routing service.

## Routing stack

The Docker stack downloads an OpenStreetMap PBF extract, builds a persistent
Valhalla routing graph, and serves walking, cycling, and driving routes over
HTTP. The first boot is a graph build; later boots reuse the Docker volume.

```sh
cp .env.example .env
npm run routing:up
npm run routing:logs
```

When the logs show that the service is listening, verify a real pedestrian
route against the default Andorra extract:

```sh
npm run routing:test
```

Valhalla is available at `http://localhost:8002`. Its health endpoint is
`/status`, and route requests use `POST /route`.

### Use another OpenStreetMap region

Set `OSM_PBF_URL` in `.env` to a `.osm.pbf` extract, then reset the data:

```sh
npm run routing:reset
```

`routing:reset` deliberately removes the existing Valhalla Docker volume so
the new extract is downloaded. Use `routing:rebuild` to rebuild the graph from
the already-downloaded extract without changing regions.

Regional extracts are available from [Geofabrik](https://download.geofabrik.de/).
Larger regions take longer and require substantially more disk and memory.
Keep one contiguous extract per routing graph where possible.

OpenStreetMap data is © OpenStreetMap contributors and available under the
[ODbL](https://www.openstreetmap.org/copyright). Any map UI must show the
required OpenStreetMap attribution; Valhalla supplies routing, not map imagery.

### Connect the mobile app

[`lib/routePlanning.ts`](./lib/routePlanning.ts) provides `planRoute()` and
decodes Valhalla's route geometry for display on a map. iOS Simulator/web use
`localhost` by default; Android Emulator uses `10.0.2.2`. For a physical phone,
set `EXPO_PUBLIC_VALHALLA_URL` to the development computer's LAN address and
restart Expo.

Do not expose this development container directly to the public internet;
place authentication, request limits, and TLS in front of it for production.

## App commands

```sh
npm install
npm start
npm run typecheck
npm run test:tracking
```

Create `.env` with your Supabase project before running the app:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

## Run recording

- A run records through a background location task (`lib/locationTask.ts`),
  so it keeps going with the screen locked or another app open. iOS shows the
  blue location indicator while it records; "While Using" permission is enough
  because the run is started from the app.
- Every point is stored on the phone first (`lib/runSession.ts`) and uploaded
  in batches when there is a connection (`lib/runSync.ts`). A dead zone, or
  finishing a run offline, loses nothing: it uploads later.
- Pause and resume start a new segment, so paused time and any distance
  covered while paused are not counted.
- If the app is closed mid-run, reopening it restores the run and resumes.
- Finished runs open a detail screen with the route map, splits per km,
  moving time and elevation (`screens/runs/RunDetailScreen.tsx`).

Background location and maps need a development build (not Expo Go).

## Run on an iPhone

This Mac's Xcode lives on the external volume and the system disk is nearly
full, so build with Xcode's caches kept on the external volume:

```sh
export DEVELOPER_DIR=/Volumes/volume/Applications/Xcode.app/Contents/Developer
npx expo prebuild --platform ios --no-install
(cd ios && CP_CACHE_DIR=/Volumes/volume/.cocoapods-cache CP_HOME_DIR=/Volumes/volume/.cocoapods pod install)

# Find the phone's id with: xcrun devicectl list devices
xcodebuild -workspace ios/Novu.xcworkspace -scheme Novu -configuration Debug \
  -destination id=<device-id> -derivedDataPath ios/build -allowProvisioningUpdates build
xcrun devicectl device install app --device <device-id> \
  ios/build/Build/Products/Debug-iphoneos/Novu.app

npm start   # the Debug build loads its JavaScript from here over Wi-Fi
```

Use `-configuration Release` (and `Release-iphoneos` in the install path) for
a build that runs without the Mac, e.g. to test a real run outdoors. Builds
signed with a free Apple ID (Personal Team) stop opening after 7 days; rebuild
to refresh, or join the Apple Developer Program.
