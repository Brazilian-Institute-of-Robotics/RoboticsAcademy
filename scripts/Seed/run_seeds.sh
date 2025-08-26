#!/usr/bin/env bash

APP_DIR="RoboticsAcademy"
FIXTURE_DIR="RoboticsAcademy/exercises/fixtures"
DJANGO_MANAGER="RoboticsAcademy/manager.py"
SEED_PREFIX="Seed_"
LAST_SEED_TRACKER="RoboticsAcademy/exercises/fixtures/personalSeedTracker/last_seed_executed.txt"

# Comparação consistente (ASCII) ao usar '>' em strings
export LC_ALL=C

echo "[run_seeds] FIXTURE_DIR=$FIXTURE_DIR"
echo "[run_seeds] SEED_PREFIX=$SEED_PREFIX"

# Guarantees that fixtures and file last_seed_executed.txt exits
mkdir -p "$FIXTURE_DIR"
mkdir -p "$(dirname "$LAST_SEED_TRACKER")"

# Colect and order json file that name starts with Seed
mapfile -t SEED_FILES < <(find "$FIXTURE_DIR" -maxdepth 1 -type f -name "${SEED_PREFIX}*.json" | sort -V)

if [[ ${#SEED_FILES[@]} -eq 0 ]]; then
  echo "[run_seeds] No seed found in: $FIXTURE_DIR/${SEED_PREFIX}*.json"
  exit 0
fi

# Read last_seed_executed.txt and get the name of last seed executed
LAST_DONE=""
if [[ -f "$LAST_SEED_TRACKER" ]]; then
  LAST_DONE="$(cat "$LAST_SEED_TRACKER" | tr -d '\r\n' || true)"
  [[ -n "$LAST_DONE" ]] && echo "[run_seeds] Returns: $LAST_DONE"
fi

# Filter only seeds younger than last one executed (if exists)
TO_RUN=()
if [[ -n "$LAST_DONE" ]]; then
  for f in "${SEED_FILES[@]}"; do
    base="$(basename "$f")"
    if [[ "$base" > "$LAST_DONE" ]]; then
      TO_RUN+=("$f")
    fi
  done
else
  TO_RUN=("${SEED_FILES[@]}")
fi

if [[ ${#TO_RUN[@]} -eq 0 ]]; then
  echo "[run_seeds] All seed already executed."
  exit 0
fi

echo "[run_seeds] Seeds to execute:"
printf '  - %s\n' "${TO_RUN[@]}"

for f in "${TO_RUN[@]}"; do
  echo "[seed] Django loaddata: $f"
  python "$DJANGO_MANAGER" loaddata "$f"
  base="$(basename "$f")"
  printf '%s\n' "$base" > "$LAST_SEED_TRACKER"
  echo "[run_seeds] Seed executed: $base"
done

echo "[run_seeds] Finished. Last seed: $(cat "$LAST_SEED_TRACKER")"
