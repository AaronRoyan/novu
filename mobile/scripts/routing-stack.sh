#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

# Keep the helper's port/rebuild settings aligned with Compose. The checked-in
# example only contains shell-compatible KEY=value entries.
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_DIR/.env"
  set +a
fi

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    printf '%s\n' \
      "Docker Compose is required (either 'docker compose' or 'docker-compose')." >&2
    exit 127
  fi
}

usage() {
  printf '%s\n' \
    "Usage: $0 <up|down|logs|status|test|rebuild|reset>" \
    "" \
    "  up       Build and start Valhalla in the background" \
    "  down     Stop the routing stack (keeps generated tiles)" \
    "  logs     Follow tile-build and service logs" \
    "  status   Show containers and query Valhalla health" \
    "  test     Request a pedestrian route through Andorra" \
    "  rebuild  Rebuild routing tiles from the downloaded OSM extract" \
    "  reset    Delete routing data and build the configured OSM extract"
}

command="${1:-}"

case "$command" in
  up)
    compose -f "$COMPOSE_FILE" up --build --detach
    printf '%s\n' \
      "Valhalla is starting. The first OSM graph build can take several minutes." \
      "Follow it with: $0 logs"
    ;;
  down)
    compose -f "$COMPOSE_FILE" down
    ;;
  logs)
    compose -f "$COMPOSE_FILE" logs --follow valhalla
    ;;
  status)
    compose -f "$COMPOSE_FILE" ps
    curl --fail --silent --show-error \
      "http://localhost:${VALHALLA_PORT:-8002}/status"
    printf '\n'
    ;;
  test)
    VALHALLA_URL="http://localhost:${VALHALLA_PORT:-8002}" \
      "$SCRIPT_DIR/test-routing.sh"
    ;;
  rebuild)
    VALHALLA_FORCE_REBUILD=True compose -f "$COMPOSE_FILE" up \
      --build --detach --force-recreate valhalla
    printf '%s\n' "Routing graph rebuild started. Follow it with: $0 logs"
    ;;
  reset)
    compose -f "$COMPOSE_FILE" down --volumes
    compose -f "$COMPOSE_FILE" up --build --detach
    printf '%s\n' \
      "Stored OSM data was reset and a fresh graph build has started." \
      "Follow it with: $0 logs"
    ;;
  *)
    usage
    exit 1
    ;;
esac
