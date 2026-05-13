#!/usr/bin/env python3
"""Sweep stale Cloudflare Pages preview deployments.

Deletes preview deployments whose corresponding PR is closed/merged, and
deployments older than MAX_AGE_DAYS regardless of PR state (backstop for
abandoned branches that were never closed).

Production deployments are skipped unconditionally.

Required env vars:
    CLOUDFLARE_API_TOKEN  - Cloudflare API token with Pages:Edit
    CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID
    GH_TOKEN              - GitHub token with repo:read (for PR state lookup)
    GITHUB_REPOSITORY     - "owner/repo" (set automatically in GitHub Actions)

Optional env vars:
    PROJECT               - Pages project name. Defaults to "glycemicgpt".
    MAX_AGE_DAYS          - Hard cap on preview deployment age. Defaults to 30.

Flags:
    --dry-run             - Log what would be deleted; do not delete.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone


def cf_request(method: str, path: str, token: str) -> dict:
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return {"success": False, "status": e.code, "body": body}


def gh_request(path: str, token: str) -> dict | None:
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError:
        return None


def list_all_deployments(account: str, project: str, token: str) -> list[dict]:
    # env=preview filters at the API so we never enumerate production
    # deployments; per_page=25 is the Cloudflare API's accepted maximum for
    # this endpoint (per_page=100 returns "Invalid list options provided"
    # error 8000024).
    deployments = []
    page = 1
    while True:
        data = cf_request(
            "GET",
            f"/accounts/{account}/pages/projects/{project}/deployments?env=preview&per_page=25&page={page}",
            token,
        )
        if "result" not in data:
            raise RuntimeError(f"Failed to list deployments: {data}")
        deployments.extend(data.get("result", []) or [])
        info = data.get("result_info", {}) or {}
        total_pages = info.get("total_pages", 1)
        if page >= total_pages:
            break
        page += 1
    return deployments


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be deleted; do not actually delete.",
    )
    args = parser.parse_args()

    cf_token = os.environ["CLOUDFLARE_API_TOKEN"]
    cf_account = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    gh_token = os.environ["GH_TOKEN"]
    repo = os.environ["GITHUB_REPOSITORY"]
    project = os.environ.get("PROJECT", "glycemicgpt")
    max_age_days = int(os.environ.get("MAX_AGE_DAYS", "30"))

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=max_age_days)

    print(f"Project: {project}")
    print(f"Repo:    {repo}")
    print(f"Max age: {max_age_days} days (cutoff: {cutoff.isoformat()})")
    print(f"Dry run: {args.dry_run}")
    print()

    deployments = list_all_deployments(cf_account, project, cf_token)
    print(f"Total deployments found: {len(deployments)}")

    to_delete: list[tuple[str, str, str]] = []
    skipped_production = 0
    skipped_open = 0
    skipped_other = 0
    pr_cache: dict[int, str] = {}

    for d in deployments:
        # Never touch production deployments. The active production deployment
        # cannot be deleted by API anyway, but defensive code is cheap.
        if d.get("environment") == "production":
            skipped_production += 1
            continue

        meta = (d.get("deployment_trigger", {}) or {}).get("metadata", {}) or {}
        branch = meta.get("branch", "") or ""
        created = d.get("created_on")
        if not created:
            skipped_other += 1
            continue

        try:
            created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
        except ValueError:
            skipped_other += 1
            continue

        reason: str | None = None

        # 1. If branch looks like pr-<N>, check the PR state.
        if branch.startswith("pr-"):
            try:
                pr_num = int(branch[len("pr-"):])
            except ValueError:
                pr_num = None
            if pr_num is not None:
                if pr_num not in pr_cache:
                    pr = gh_request(f"/repos/{repo}/pulls/{pr_num}", gh_token)
                    pr_cache[pr_num] = (pr or {}).get("state", "unknown")
                state = pr_cache[pr_num]
                if state == "closed":
                    reason = f"PR #{pr_num} closed"
                elif state == "open":
                    skipped_open += 1

        # 2. Hard age cap (backstop for non-pr-* branches and abandoned PRs).
        if not reason and created_dt < cutoff:
            age_days = (now - created_dt).days
            reason = f"deployment age {age_days}d > {max_age_days}d cap"

        if reason:
            to_delete.append((d["id"], branch, reason))

    print(f"  - skipped (production):   {skipped_production}")
    print(f"  - skipped (open PR):      {skipped_open}")
    print(f"  - skipped (other):        {skipped_other}")
    print(f"  - to delete:              {len(to_delete)}")
    print()

    deleted = 0
    failed = 0
    for did, branch, reason in to_delete:
        if args.dry_run:
            print(f"  [DRY-RUN] would delete {did} (branch={branch}, reason={reason})")
            continue
        print(f"  delete {did} (branch={branch}, reason={reason})")
        result = cf_request(
            "DELETE",
            f"/accounts/{cf_account}/pages/projects/{project}/deployments/{did}?force=true",
            cf_token,
        )
        if result.get("success"):
            deleted += 1
        else:
            failed += 1
            print(f"    FAILED: {result}")

    print()
    if args.dry_run:
        print(f"Dry-run complete. Would have deleted {len(to_delete)} deployment(s).")
    else:
        print(f"Sweep complete. Deleted: {deleted}. Failed: {failed}.")

    # Non-zero exit if anything failed so the workflow shows red.
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
