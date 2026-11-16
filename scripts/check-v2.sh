#!/usr/bin/env bash
# Checks a production build of the site and the synced data it was built from.
# CI runs it on every pull request, and the deploy workflows run it before
# anything goes live. Run it after `next build` without the preview flag: a
# preview build is noindex and has an empty sitemap on purpose, so it fails.
# The name is from when the new site was built under /v2; the workflows call it
# by this name. Exits non-zero if any check fails.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

failed=0

pass() { echo "PASS: $1"; }
fail() {
  echo "FAIL: $1"
  failed=1
}

# The pages people land on. Each is built from the root layout.
pages=(
  out/index.html
  out/changelog.html
  out/roadmap.html
  out/rename.html
  out/privacy.html
  out/docs.html
)

for file in "${pages[@]}"; do
  if [ ! -f "$file" ]; then
    fail "$file does not exist"
  elif grep -qi 'noindex' "$file"; then
    fail "$file mentions noindex (an unindexed page, or this is a preview build)"
  else
    pass "$file has no noindex"
  fi
done

# Every page, the 404 included, renders in the site's look from the root layout.
for file in "${pages[@]}" out/404.html; do
  if [ ! -f "$file" ]; then
    fail "$file does not exist"
  elif grep -qF 'class="lm-root' "$file"; then
    pass "$file has the site look (lm-root)"
  else
    fail "$file has no lm-root"
  fi
done

# The old /v2 pages are gone; public/_redirects sends their addresses on.
for path in out/v2.html out/v2; do
  if [ -e "$path" ]; then
    fail "$path exists (old /v2 output)"
  else
    pass "$path does not exist"
  fi
done

if [ ! -f out/sitemap.xml ]; then
  fail "out/sitemap.xml does not exist"
else
  for route in "" /changelog /roadmap /rename /privacy /docs; do
    if grep -qF "<loc>https://lumose.org${route}</loc>" out/sitemap.xml; then
      pass "sitemap lists ${route:-/}"
    else
      fail "sitemap does not list ${route:-/} (or this is a preview build)"
    fi
  done
  if grep -qF '/v2' out/sitemap.xml; then
    fail "sitemap mentions /v2"
  else
    pass "sitemap does not mention /v2"
  fi
fi

if [ ! -f out/robots.txt ]; then
  fail "out/robots.txt does not exist"
elif grep -qE '^Disallow: /$' out/robots.txt; then
  fail "robots.txt disallows the whole site (or this is a preview build)"
else
  pass "robots.txt allows the site"
fi

# Links to /v2 on any page, as an href in the HTML or in the page data Next
# inlines next to it. Text that only mentions a /v2 path, such as a route in
# the product docs, is not a link and is not matched.
v2_links=$(grep -rlE --include='*.html' \
  -e 'href="(https://lumose\.org)?/v2([/?#"])' \
  -e '\\"href\\":\\"(https://lumose\.org)?/v2([/?#\\])' \
  out)
status=$?
if [ "$status" -eq 1 ]; then
  pass "no page links to /v2"
elif [ "$status" -eq 0 ]; then
  echo "$v2_links" | head -n 20
  fail "pages link to /v2 ($(echo "$v2_links" | wc -l) files)"
else
  fail "could not scan the pages for /v2 links"
fi

# Cloudflare Pages reads redirects from this file. The specific lines must come
# before the catch-all, which must be last.
expected_redirects=$'/v2 / 301\n/v2/changelog /changelog 301\n/v2/roadmap /roadmap 301\n/v2/rename /rename 301\n/v2/* /:splat 301'
if [ ! -f out/_redirects ]; then
  fail "out/_redirects does not exist"
elif [ "$(grep -E '^/v2' out/_redirects)" = "$expected_redirects" ]; then
  pass "out/_redirects has the /v2 rules in order"
else
  fail "out/_redirects does not have the expected /v2 rules in order"
fi

# Geist was the old site's font. The site uses Poppins, Inter and JetBrains Mono.
if grep -rqi 'geist' out --include='*.html' --include='*.css'; then
  fail "the build still references Geist"
else
  pass "no Geist in the build"
fi

# The root layout preloads four font files on every page. A different number
# means a font was added or lost; update this when that is intended.
expected_font_preloads=4
for file in "${pages[@]}"; do
  count=$(grep -o '<link rel="preload"[^>]*as="font"' "$file" 2>/dev/null | wc -l)
  if [ "$count" -eq "$expected_font_preloads" ]; then
    pass "$file preloads $count fonts"
  else
    fail "$file preloads $count fonts, expected $expected_font_preloads"
  fi
done

banned='telegram|predict|push notif|ios alarm|fcm|apns|always fires|never waits|forecast|projection'
scan_paths=(
  src/components/v2
  src/app/page.tsx
  src/app/changelog
  src/app/roadmap
  src/app/rename
  src/data
  content/pages
)

# src/data/contributors.json is skipped: it holds GitHub logins and repo names, not site wording.
hits=$(grep -rIinE --exclude=contributors.json "$banned" "${scan_paths[@]}")
status=$?
if [ "$status" -eq 1 ]; then
  pass "no banned words in site source and data"
elif [ "$status" -eq 0 ]; then
  echo "$hits"
  fail "banned words found in site source or data"
else
  fail "could not scan site source and data for banned words"
fi

if [ "$failed" -ne 0 ]; then
  echo "check-v2: FAILED"
  exit 1
fi
echo "check-v2: OK"
