#!/usr/bin/env bash
# Proves the hidden /v2 route stays hidden and live pages stay untouched.
# Run after a production build, one without the preview flag. A preview build
# shows the new look on shared pages on purpose, so it fails the checks below.
# Exits non-zero if any check fails.
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

# Shared pages must carry none of the new look in a production build. The new
# shell is dropped from these builds by the bundler, and this is what notices
# if that stops working.
for file in out/index.html out/privacy.html out/404.html out/docs.html; do
  if [ ! -f "$file" ]; then
    fail "$file does not exist"
  elif grep -qF 'lm-root' "$file"; then
    fail "$file contains lm-root (new-look markup on a live page, or this is a preview build)"
  else
    pass "$file has no lm-root"
  fi
done

# Two font files are preloaded on a live page today, both from the root layout.
# More means the new fonts leaked in. Update the number if the live fonts change.
expected_font_preloads=2
for file in out/index.html out/privacy.html; do
  count=$(grep -o '<link rel="preload"[^>]*as="font"' "$file" 2>/dev/null | wc -l)
  if [ "$count" -eq "$expected_font_preloads" ]; then
    pass "$file preloads $count fonts"
  else
    fail "$file preloads $count fonts, expected $expected_font_preloads (new fonts on a live page, or this is a preview build)"
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

# src/data/contributors.json is skipped: it holds GitHub logins and repo names, not site wording.
hits=$(grep -rIinE --exclude=contributors.json "$banned" "${scan_paths[@]}")
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
