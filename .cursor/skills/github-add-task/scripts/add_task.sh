#!/usr/bin/env bash
# Create a new draft issue (task) on a GitHub Projects (v2) board using the
# GitHub CLI. Built for https://github.com/users/dosandk/projects/10/views/1
# but works for any user-level project via --owner / --project.
#
# Usage (flags, non-interactive — this is how the Cursor skill calls it):
#   add_task.sh --title "Fix login bug" \
#               --summary "Users can't log in with SSO" \
#               --details "Started after the 2.3 release. Repros on staging." \
#               --ac "Login works with SSO; Error is logged; Regression test added"
#
# Usage (interactive — for running by hand from a terminal):
#   add_task.sh
#   (then answer the Title / Summary / Details / Acceptance criteria prompts)
#
# Flags:
#   --title     TEXT   Task title (required)
#   --summary   TEXT   One or two sentence summary
#   --details   TEXT   Longer free-form description
#   --ac        TEXT   Acceptance criteria, multiple items separated by ";"
#   --owner     LOGIN  Project owner login (default: dosandk, or $GH_PROJECT_OWNER)
#   --project   NUMBER Project number (default: 10, or $GH_PROJECT_NUMBER)
#   --dry-run          Print the task that would be created, but don't call gh
#   -h, --help         Show this help

set -euo pipefail

DEFAULT_OWNER="${GH_PROJECT_OWNER:-dosandk}"
DEFAULT_PROJECT="${GH_PROJECT_NUMBER:-10}"

TITLE=""
SUMMARY=""
DETAILS=""
AC=""
OWNER="$DEFAULT_OWNER"
PROJECT="$DEFAULT_PROJECT"
DRY_RUN=0
TITLE_SET=0
SUMMARY_SET=0
DETAILS_SET=0
AC_SET=0

print_help() {
  sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --title)
      TITLE="${2:-}"; TITLE_SET=1; shift 2 ;;
    --summary)
      SUMMARY="${2:-}"; SUMMARY_SET=1; shift 2 ;;
    --details)
      DETAILS="${2:-}"; DETAILS_SET=1; shift 2 ;;
    --ac)
      AC="${2:-}"; AC_SET=1; shift 2 ;;
    --owner)
      OWNER="${2:-}"; shift 2 ;;
    --project)
      PROJECT="${2:-}"; shift 2 ;;
    --dry-run)
      DRY_RUN=1; shift ;;
    -h|--help)
      print_help; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      print_help
      exit 1 ;;
  esac
done

# Fall back to interactive prompts for any field that wasn't passed as a flag,
# so the script is also usable directly from a terminal.
if [ "$TITLE_SET" -eq 0 ] && [ -t 0 ]; then
  read -r -p "Title: " TITLE
fi
if [ "$SUMMARY_SET" -eq 0 ] && [ -t 0 ]; then
  read -r -p "Summary: " SUMMARY
fi
if [ "$DETAILS_SET" -eq 0 ] && [ -t 0 ]; then
  read -r -p "Details: " DETAILS
fi
if [ "$AC_SET" -eq 0 ] && [ -t 0 ]; then
  read -r -p "Acceptance criteria (separate with ;): " AC
fi

if [ -z "$TITLE" ]; then
  echo "Error: a title is required." >&2
  exit 1
fi

# Split the acceptance criteria on ";" into a GitHub task-list.
AC_LIST=""
if [ -n "$AC" ]; then
  IFS=';' read -ra AC_ITEMS <<< "$AC"
  for raw_item in "${AC_ITEMS[@]}"; do
    item="$(echo "$raw_item" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    if [ -n "$item" ]; then
      AC_LIST="${AC_LIST}- [ ] ${item}
"
    fi
  done
fi

BODY=""
if [ -n "$SUMMARY" ]; then
  BODY="${BODY}## Summary
${SUMMARY}

"
fi
if [ -n "$DETAILS" ]; then
  BODY="${BODY}## Details
${DETAILS}

"
fi
if [ -n "$AC_LIST" ]; then
  BODY="${BODY}## Acceptance Criteria
${AC_LIST}"
fi
# Trim trailing blank lines.
BODY="$(printf '%s' "$BODY" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "--- Dry run: would create this task on $OWNER's project #$PROJECT ---"
  echo "Title: $TITLE"
  echo
  echo "$BODY"
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: the GitHub CLI ('gh') is not installed. Install it from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: not logged into GitHub CLI. Run 'gh auth login' first." >&2
  exit 1
fi

if ! gh auth status 2>&1 | grep -qi "'project'"; then
  : # token scopes aren't always listed; let item-create fail loudly if the scope is missing.
fi

echo "Creating task '$TITLE' on ${OWNER}'s project #${PROJECT}..."
RESULT="$(gh project item-create "$PROJECT" --owner "$OWNER" --title "$TITLE" --body "$BODY" --format json)"

URL="$(echo "$RESULT" | sed -n 's/.*"url":[[:space:]]*"\([^"]*\)".*/\1/p')"
if [ -n "$URL" ]; then
  echo "Created: $URL"
else
  echo "Created. Raw response:"
  echo "$RESULT"
fi
