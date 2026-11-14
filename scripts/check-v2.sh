#!/usr/bin/env bash
# Proves the hidden /v2 route stays hidden and live pages stay untouched.
# Run after a build. Exits non-zero if any check fails.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

failed=0

pass() { echo "PASS: $1"; }
fail() {
  echo "FAIL: $1"
  failed=1
}

# noindex must come from a robots meta tag, not a stray string in the page data.
for file in out/v2.html out/v2/changelog.html out/v2/roadmap.html out/v2/rename.html; do
  if grep -Eq '<meta name="robots" content="noindex, nofollow"' "$file" 2>/dev/null; then
    pass "$file has a noindex robots tag"
  else
    fail "$file is missing or has no noindex robots tag"
  fi
done

for file in out/sitemap.xml out/robots.txt out/index.html; do
  if [ ! -f "$file" ]; then
    fail "$file does not exist"
  elif grep -qF '/v2' "$file"; then
    fail "$file mentions /v2"
  else
    pass "$file does not mention /v2"
  fi
done

live_paths=(
  src/app/page.tsx
  src/components/home-page.tsx
  src/components/sections
  src/components/header.tsx
  src/components/footer.tsx
)

# Exit 1 means files differ and anything above that means git could not compare.
# Both count as a failure, so a missing origin/main can't pass silently.
if git diff --quiet origin/main...HEAD -- "${live_paths[@]}"; then
  pass "live page files match origin/main"
else
  fail "live page files differ from origin/main, or the diff could not run"
fi

banned='telegram|predict|push notif|ios alarm|fcm|apns|always fires|never waits|forecast|projection'
scan_paths=(src/components/v2 src/app/v2 src/data content/pages)

hits=$(grep -rIinE "$banned" "${scan_paths[@]}")
status=$?
if [ "$status" -eq 1 ]; then
  pass "no banned words in v2 source"
elif [ "$status" -eq 0 ]; then
  echo "$hits"
  fail "banned words found in v2 source"
else
  fail "could not scan v2 source for banned words"
fi

if [ "$failed" -ne 0 ]; then
  echo "check-v2: FAILED"
  exit 1
fi
echo "check-v2: OK"
