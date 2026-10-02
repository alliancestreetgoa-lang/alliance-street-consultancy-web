#!/usr/bin/env bash
# One-time: turns on the GitHub rules that enforce CMS roles.
#
#   bash scripts/setup-github-access.sh
#
# Run it yourself as the repository owner (needs `gh auth login` with admin
# rights on the repo). It is safe to re-run: an existing ruleset of the same
# name is updated rather than duplicated.
#
# What it enforces on `main` (the live site):
#   - no direct pushes, force-pushes or deletion, except by the repository
#     administrator (bypass), so the developer workflow keeps working
#   - every change arrives as a pull request (the CMS opens one per save)
#   - it needs an approving review from a code owner (.github/CODEOWNERS):
#       content/media  -> any publisher, or the administrator
#       tax figures    -> the administrator
#       code/config    -> the administrator
#   - approval is dismissed if the draft changes afterwards, and the last
#     person to change it cannot be its approver
#   - the "Publish check" and "Database security rules" checks must pass
set -euo pipefail

REPO="alliancestreetgoa-lang/alliance-street-consultancy-web"
NAME="Protect the live site"

read -r -d '' RULESET <<JSON || true
{
  "name": "${NAME}",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }
  ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash", "merge"]
    } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Publish check" },
          { "context": "Database security rules" }
        ]
    } }
  ]
}
JSON

existing=$(gh api "repos/${REPO}/rulesets" --jq ".[] | select(.name == \"${NAME}\") | .id" || true)
if [[ -n "${existing}" ]]; then
  echo "Updating ruleset ${existing}…"
  gh api -X PUT "repos/${REPO}/rulesets/${existing}" --input - <<<"${RULESET}" >/dev/null
else
  echo "Creating ruleset…"
  gh api -X POST "repos/${REPO}/rulesets" --input - <<<"${RULESET}" >/dev/null
fi

# The workflow token must stay read-only and unable to approve pull requests,
# or a workflow could approve its own change.
gh api -X PUT "repos/${REPO}/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false

# Only main may deploy the public site.
gh api "repos/${REPO}/environments/github-pages/deployment-branch-policies" --jq '.branch_policies[].name'

echo
echo "Done. Current rules on main:"
gh api "repos/${REPO}/rules/branches/main" --jq '.[].type'
