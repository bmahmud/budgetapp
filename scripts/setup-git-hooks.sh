#!/bin/sh
set -e
cd "$(dirname "$0")/.."

git config core.hooksPath .githooks
chmod +x .githooks/post-commit 2>/dev/null || true

echo "Git hooks enabled: commits on this machine will auto-push to origin."
