#!/usr/bin/env bash
# Auto-commit and push LaneOS changes when a Cursor agent session ends.
set -euo pipefail

cat >/dev/null # consume hook stdin

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" ]]; then
  exit 0
fi

cd "$ROOT"

if ! git remote get-url origin &>/dev/null; then
  exit 0
fi

if git diff --quiet && git diff --cached --quiet; then
  exit 0
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  exit 0
fi

git add -A
# Belt-and-suspenders: never stage secrets even if ignore rules change.
git reset HEAD -- '*.local' '.env' '.env.*' 2>/dev/null || true
git reset HEAD -- 'apps/web/.env.local' 'apps/mobile/.env' 2>/dev/null || true

if git diff --cached --quiet; then
  exit 0
fi

TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
git -c user.email="${LANEOS_GIT_EMAIL:-mpkinvesting@gmail.com}" \
    -c user.name="${LANEOS_GIT_NAME:-LaneOS Cursor}" \
    commit -m "chore: sync from Cursor ($TIMESTAMP)" || exit 0

git push origin "$BRANCH" 2>/dev/null || exit 0
exit 0
