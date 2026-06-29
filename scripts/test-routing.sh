#!/usr/bin/env sh
set -eu

VALHALLA_URL="${VALHALLA_URL:-http://localhost:8002}"

# Andorra la Vella to Escaldes-Engordany: both points are inside the default
# OSM extract. Override ROUTE_REQUEST when using a different region.
if [ -z "${ROUTE_REQUEST:-}" ]; then
  ROUTE_REQUEST='{"locations":[{"lat":42.5063,"lon":1.5218},{"lat":42.5090,"lon":1.5380}],"costing":"pedestrian","units":"kilometers","language":"en-US"}'
fi

response="$(curl --fail --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "$ROUTE_REQUEST" \
  "$VALHALLA_URL/route")"

node -e '
const response = JSON.parse(process.argv[1]);
const summary = response.trip?.summary;

if (!summary || !Array.isArray(response.trip?.legs) || response.trip.legs.length === 0) {
  throw new Error("Valhalla returned no route");
}

console.log(`Route OK: ${summary.length.toFixed(2)} ${response.trip.units}, ${Math.round(summary.time / 60)} min`);
' "$response"
