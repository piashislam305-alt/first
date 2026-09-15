#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Govaly — import the full catalog into any MongoDB.
#
#   local mongod:   ./import.sh "mongodb://127.0.0.1:27017/govaly"
#   MongoDB Atlas:  ./import.sh "mongodb+srv://USER:PASS@cluster.xxx.mongodb.net/govaly"
#
# Requires MongoDB Database Tools (mongoimport).
#   Ubuntu/Debian: https://www.mongodb.com/docs/database-tools/installation/
#   macOS:         brew install mongodb-database-tools
#   Windows:       choco install mongodb-database-tools
# ─────────────────────────────────────────────────────────────
set -euo pipefail

URI="${1:-mongodb://127.0.0.1:27017/govaly}"
DIR="$(cd "$(dirname "$0")/collections" && pwd)"

command -v mongoimport >/dev/null || { echo "mongoimport not found — install MongoDB Database Tools first."; exit 1; }

for f in "$DIR"/*.json; do
  name="$(basename "$f" .json)"
  echo "→ importing $name ..."
  mongoimport --uri "$URI" --collection "$name" --file "$f" --jsonArray --drop --quiet
done

echo "✅ All collections imported into: $URI"
echo "   Then run the app with:  MONGO_URI=\"$URI\"  (see server/.env)"
