# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## PRD and child issue conventions

Based on mattpocock/sandcastle's pattern:

- **PRD issues** are titled with a `PRD:` prefix (e.g., `PRD: Resume support for the Codex agent provider`). They use the full PRD template: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes. They do NOT have triage labels (no `ready-for-agent`) — they are planning documents, not work items.
- **Child issues** (vertical slices / tracer bullets) use the `## Parent` template referencing the PRD issue number, with What to build, Acceptance criteria, Blocked by, and User stories addressed. These get `ready-for-agent`.
- **Bug/enhancement issues** use a different template: Summary, Location, Symptom, Minimal reproduction, Expected, Actual, Environment.
- The parent PRD does NOT link back to children — linkage is one-way (child → parent).

## Shell-safe text payloads

When a bash command needs a large text body (`gh issue create`, `git commit -F`, `curl -d`), write to a temp file first and reference it (`--body-file`, `-F`, stdin redirect). Do not inline the content in a command string — backticks and `$` in markdown will be interpreted by the shell even inside quoted heredocs.
- Bad: `gh issue create --body "$(cat <<'EOF' ...)"` ← fails on backticks
- Good: `write /tmp/thing.md` then `gh issue create --body-file /tmp/thing.md`
