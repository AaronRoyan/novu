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
```
