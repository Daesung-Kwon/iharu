#!/usr/bin/env bash
# Write the W2 AsyncStorage seed onto iPhone SE 3 simulator A3FB3EC7 only.
# Never targets iPhone 17 (6EB78120). See README.md in this directory.
set -euo pipefail

ALLOWED=A3FB3EC7
FORBIDDEN=6EB78120
APP=com.dailyschedule.app
HERE=$(cd "$(dirname "$0")" && pwd)
PY="$HERE/materialize_seed.py"

usage() {
  cat <<EOF
Usage:
  ./docs/device-week-w2/apply-seed.sh [--check]
  ./docs/device-week-w2/apply-seed.sh [--print] [multi|single] [--allow-tz] [--today YYYY-MM-DD]
  ./docs/device-week-w2/apply-seed.sh [multi|single] [--allow-tz] [--today YYYY-MM-DD]
  ./docs/device-week-w2/apply-seed.sh --show

multi (default) is three weekly promises with the test unlock.
single is one promise and the free slot.
--check builds both profiles in a temp directory and does not touch a simulator.
--print shows the pass lines for today and does not touch a simulator.
--show reads the weekly keys already on $ALLOWED.

The simulator UDID is fixed: $ALLOWED. Passing $FORBIDDEN exits immediately.
EOF
}

for arg in "$@"; do
  if [[ "$arg" == *"$FORBIDDEN"* ]]; then
    echo "Refusing iPhone 17 simulator $FORBIDDEN. This pack writes only $ALLOWED ($APP)." >&2
    exit 2
  fi
done

profile=multi
mode=apply
allow_tz=()
today_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    multi|single) profile=$1; shift ;;
    --check) mode=check; shift ;;
    --print) mode=print; shift ;;
    --show) mode=show; shift ;;
    --allow-tz) allow_tz=(--allow-tz); shift ;;
    --today)
      [[ $# -ge 2 ]] || { echo "--today needs YYYY-MM-DD" >&2; exit 2; }
      today_args=(--today "$2")
      shift 2
      ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ "$mode" == check ]]; then
  python3 "$PY" --check
  exit 0
fi

if [[ "$mode" == print ]]; then
  python3 "$PY" --profile "$profile" ${allow_tz[@]+"${allow_tz[@]}"} ${today_args[@]+"${today_args[@]}"} --print
  exit 0
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "xcrun is not on this machine. Run this script on the Mac that hosts simulator $ALLOWED." >&2
  exit 1
fi

storage_dir() {
  local container
  if ! container=$(xcrun simctl get_app_container "$ALLOWED" "$APP" data); then
    echo "Could not find $APP on $ALLOWED. Install the app on that simulator only." >&2
    exit 1
  fi
  printf '%s\n' "$container/Library/Application Support/$APP/RCTAsyncLocalStorage_V1"
}

if [[ "$mode" == show ]]; then
  python3 "$PY" --show "$(storage_dir)"
  exit 0
fi

booted=$(xcrun simctl list devices booted || true)
if [[ "$booted" != *"$ALLOWED"* ]]; then
  echo "Booting $ALLOWED only (iPhone SE 3). This does not boot $FORBIDDEN."
  xcrun simctl boot "$ALLOWED"
fi
if [[ "$booted" == *"$FORBIDDEN"* ]]; then
  echo "Note: $FORBIDDEN is also booted. This script does not read or write it." >&2
fi

echo "Terminating $APP on $ALLOWED"
xcrun simctl terminate "$ALLOWED" "$APP" >/dev/null 2>&1 || true
sleep 2

storage=$(storage_dir)
echo "Replacing $storage"
python3 "$PY" --profile "$profile" ${allow_tz[@]+"${allow_tz[@]}"} ${today_args[@]+"${today_args[@]}"} --write-dir "$storage" --print

echo "Launching $APP on $ALLOWED"
xcrun simctl launch "$ALLOWED" "$APP"
