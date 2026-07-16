# 🤝 Contributing to GlycemicGPT Website

Thanks for your interest in contributing to the GlycemicGPT website! Whether you're fixing a typo, improving a component, or building a whole new section -- we appreciate you. 💙

This guide covers everything you need to know to get started.

---

## 📑 Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Finding Something to Work On](#finding-something-to-work-on)
- [Development Setup](#development-setup)
- [Branching & Workflow](#branching--workflow)
- [Commit Messages](#commit-messages)
- [Before You Submit](#before-you-submit)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [AI Attribution Policy](#ai-assisted-development--attribution-policy)
- [Project Structure](#project-structure)
- [License](#license)
- [Questions?](#questions)

---

<a id="ways-to-contribute"></a>

## 💡 Ways to Contribute

There are many ways to help, not all of them involve writing code:

- 🐛 **Report bugs** -- Broken layout, wrong content, accessibility issues
- ✨ **Suggest improvements** -- Better copy, new sections, design ideas
- 📝 **Improve documentation** -- Typos, unclear instructions, missing guides
- 🎨 **Design** -- Better animations, mobile responsiveness, dark/light mode polish
- 🔎 **Accessibility reviews** -- Test with screen readers, keyboard navigation
- 🌍 **Translations** -- Help make the site available in more languages (future)
- 🔍 **Review PRs** -- Fresh eyes catch things automated checks can't

Before opening an issue, please search [existing issues](https://github.com/lumose-health/website/issues?q=is%3Aissue) to avoid duplicates.

---

<a id="finding-something-to-work-on"></a>

## 🔍 Finding Something to Work On

Not sure where to start? Browse [open issues](https://github.com/lumose-health/website/issues) and look for these labels:

- 🏷️ **`good first issue`** -- Small, well-scoped tasks ideal for new contributors
- 🏷️ **`help wanted`** -- We'd love community help on these
- 🏷️ **`bug`** -- Known bugs waiting for a fix

> **Tip:** Not every label will have open issues at all times. If none are tagged yet, browse the full [issue list](https://github.com/lumose-health/website/issues) for inspiration.

If you'd like to work on something, comment on the issue to let others know. For larger changes, please open an issue first to discuss the approach before investing time in a PR.

---

<a id="development-setup"></a>

## 🛠️ Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| 📦 Node.js | 22+ (LTS) |
| 📦 npm | 10+ |

### 🚀 Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/website.git
cd website

# 2. Add upstream remote
git remote add upstream https://github.com/lumose-health/website.git

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

The site runs at `http://localhost:3000`.

### 📦 Build

```bash
# Production build (static export)
npm run build

# Preview the production build locally
npx serve out
```

The static output is generated in `./out/` -- this is what gets deployed to GitHub Pages.

### Tech Stack

| Technology | Purpose |
|-----------|---------|
| ⚛️ Next.js 16 | React framework with static export |
| 🎨 Tailwind CSS v4 | Utility-first styling |
| 🧩 shadcn/ui | Component library |
| 🎬 Framer Motion | Animations and transitions |
| 📊 Recharts | Interactive charts |
| 🌙 next-themes | Dark/light mode |
| 🔤 Lucide React | Icon library |

---

<a id="branching--workflow"></a>

## 🌿 Branching & Workflow

We use a simple **feature-branch** workflow. There is no `develop` branch.

```text
feature branch --> PR --> squash merge --> main --> auto-deploy
                          |                          |
                      CI checks              GitHub Pages
                      CodeRabbit              Cloudflare CDN
                      Lighthouse
```

### Rules

- **`main`** is the only long-lived branch. **All PRs target `main`.**
- Feature branches are created from `main` and squash-merged back.
- Never push directly to `main` -- branch protection requires PRs.

### Creating a Feature Branch

```bash
git checkout main && git pull upstream main
git checkout -b feat/my-feature
# ... make changes ...
git push -u origin feat/my-feature
# Open PR targeting main on GitHub
```

### Branch Naming

Use a descriptive prefix:

| Prefix | Usage |
|--------|-------|
| `feat/` | New features or sections |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code restructuring |
| `ci/` | CI/CD changes |
| `perf/` | Performance improvements |

---

<a id="commit-messages"></a>

## 📝 Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). This drives our automated CHANGELOG generation.

| Prefix | Usage | CHANGELOG |
|--------|-------|-----------|
| `feat:` | New features | ✅ Visible |
| `fix:` | Bug fixes | ✅ Visible |
| `perf:` | Performance improvements | ✅ Visible |
| `docs:` | Documentation only | ✅ Visible |
| `refactor:` | Code restructuring | ✅ Visible |
| `ci:` | CI/CD changes | ✅ Visible |
| `chore:` | Maintenance, deps | Hidden |
| `test:` | Adding/updating tests | Hidden |

**Examples:**
```
feat: add dark mode toggle to header
fix: correct chart tooltip positioning on mobile
docs: update contributing guide with Lighthouse info
perf: lazy load chart section below the fold
chore(deps): update dependency next to v16.3
```

---

<a id="before-you-submit"></a>

## ✅ Before You Submit

**Run these checks locally before pushing.** CI will catch failures, but it's faster to catch them yourself.

### Pre-Push Checklist

```bash
# Lint
npx eslint src/

# Type check
npx tsc --noEmit

# Build (catches export errors)
npm run build
```

### Pre-Review with CodeRabbit CLI (Optional but Recommended)

This project uses [CodeRabbit](https://www.coderabbit.ai) for automated AI code review on every PR. You can catch the same issues locally **before** pushing:

```bash
# One-time setup (free for open source)
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
coderabbit auth login

# Review your changes against main
coderabbit review --plain --type committed --base main
```

> **Rate limits:** Free accounts get 2 CLI reviews per hour. Public repos get free reviews forever.

### Final Checks

- [ ] All lint and type check passes
- [ ] Build succeeds (`npm run build`)
- [ ] No hardcoded secrets, API keys, or credentials
- [ ] Commit messages follow [Conventional Commits](#-commit-messages) format
- [ ] Your branch is up to date with `main`

---

<a id="pull-request-process"></a>

## 🔀 Pull Request Process

### Creating Your PR

1. Push your feature branch to your fork
2. Open a PR **targeting `main`**
3. Write a clear title using conventional commit format
4. Describe what changed and why in the PR body
5. Include screenshots for visual changes

### What Happens Next

1. **CI runs automatically** -- all required checks must pass (see below)
2. **CodeRabbit review** -- AI-powered code review runs automatically, posting findings and suggestions
3. **Lighthouse audit** -- scores for performance, accessibility, best practices, and SEO are posted as a PR comment
4. **Preview deployment** -- a live preview of your PR is deployed to `https://pr-<N>.glycemicgpt.pages.dev` (where `<N>` is your PR number). The URL is posted as a PR comment by `glycemicgpt-ci[bot]`. Every push to your PR updates the same URL. See [Preview Deployments](#preview-deployments) for details.
5. **Code owner review** -- the project lead reviews your PR; web maintainers may review too, and their review informs the lead's approval
6. **Merge** -- once approved and CI passes, the project lead squash-merges your PR

> **Note for first-time contributors:** PRs from forks require the project lead to approve workflow runs before any CI executes -- this is a repo security setting that blocks drive-by abuse. If your PR has no green checks and no red Xs, it's not stuck; it's waiting for the project lead to click "Approve and run". Typically resolved within a day; ping in [Discussions](https://github.com/lumose-health/GlycemicGPT/discussions) if it's been longer.

> **Why everything comes in from forks:** no one other than the project lead holds write (push) access to this repository -- maintainers included. This is an org-wide security policy (for a same-repo PR, GitHub runs the workflow files from the PR's merge commit -- including any workflow the PR adds or edits -- with repository secrets in scope, before any human review), not a statement about trust in any contributor. See the [GlycemicGPT governance doc](https://github.com/lumose-health/GlycemicGPT/blob/develop/GOVERNANCE.md) for the full reasoning.

<a id="preview-deployments"></a>

### Preview Deployments

When a PR is opened from a branch on this repository (not a fork -- in practice only the project lead's PRs, since all contributions arrive from forks), the CI workflow deploys a live preview of the changes to Cloudflare Pages at a unique URL:

```text
https://pr-<N>.glycemicgpt.pages.dev
```

`glycemicgpt-ci[bot]` posts the URL as a comment on your PR. The URL is stable for the lifetime of the PR -- pushing new commits updates the same URL with the latest build. Once the PR is closed (merged or rejected), the `cleanup-preview` workflow immediately deletes the deployments for that PR; a daily `sweep-previews` workflow handles any deployments missed by the on-close cleanup and caps all preview deployments at 30 days regardless of PR state.

**Important notes:**

- Only PRs from same-repo branches receive preview deployments. PRs from forks do not get previews because they do not have access to the repo secrets required to deploy. Lint, type check, build, Lighthouse, and other checks still run on fork PRs, so reviewers see the same CI status either way.
- Preview deployments display a banner across the top of the page reading "Preview deployment -- not the official GlycemicGPT site". They also emit a `noindex, nofollow` robots meta tag, so search engines do not index preview URLs.
- **The only official preview hostnames are `pr-N.glycemicgpt.pages.dev` and `<branch>.glycemicgpt.pages.dev` (Cloudflare-issued).** URLs hosted elsewhere claiming to be GlycemicGPT previews are not endorsed by the project.
- Production lives at `glycemicgpt.org` (Cloudflare Pages). Production builds intentionally do not emit the preview banner or the noindex tag.
- Previews are not retained indefinitely. The `cleanup-preview` workflow deletes them when the PR is closed; the daily `sweep-previews` workflow catches anything missed and deletes any preview deployment older than 30 days regardless of PR state.

### Required CI Checks

Every PR must pass these checks before it can be merged:

| Check | What It Validates |
|-------|-------------------|
| 🔍 Lint | ESLint on all source files |
| 🔷 Type Check | TypeScript strict mode (`tsc --noEmit`) |
| 🏗️ Build | Next.js static export succeeds |
| 🚀 Preview Deploy | Cloudflare Pages preview at `pr-<N>.glycemicgpt.pages.dev` (same-repo PRs only; non-blocking) |
| 🔦 Lighthouse | Accessibility, Best Practices, SEO >= 90 |
| 🏷️ Auto-Labeler | Categorizes PR by scope and type |
| 🤖 Attribution Check | No prohibited AI tool attribution |

### 🔦 Lighthouse Gates

The Lighthouse audit runs on every PR and posts results as a comment:

| Category | Threshold | Action |
|----------|-----------|--------|
| 🔎 Accessibility | >= 95 | **Blocks PR** if below |
| ✅ Best Practices | >= 90 | **Blocks PR** if below |
| 🔍 SEO | >= 90 | **Blocks PR** if below |
| ⚡ Performance | >= 50 | **Warning only** (doesn't block) |

Accessibility is held to a higher standard (95) because this is a medical platform. Performance is a soft gate because CI environment scores vary -- production (Cloudflare Pages) scores are significantly higher.

---

<a id="code-style"></a>

## 🎨 Code Style

### 🟦 TypeScript

- **Strict mode** enabled -- no `any` types without justification
- **ESLint** enforced in CI
- **Functional components** with named exports
- **Server Components** by default; `"use client"` only when needed (interactivity, hooks, browser APIs)

### 🎨 Tailwind CSS

- Use **utility classes** directly -- avoid custom CSS unless necessary
- Use the `cn()` helper from `@/lib/utils` for conditional classes
- Follow shadcn/ui conventions for component styling
- **Dark mode:** all components must work in both themes (we use `class` strategy via next-themes)

### 🎬 Animations

- Use **Framer Motion** for all animations
- **Always** respect `prefers-reduced-motion`:
  ```tsx
  const prefersReducedMotion = useReducedMotion();
  // Use prefersReducedMotion to skip or simplify animations
  ```
- Use `whileInView` with `viewport: { once: true }` for scroll-triggered animations
- Keep animations subtle -- this is a medical platform, not a portfolio site

### 🔎 Accessibility

- **Semantic HTML** -- use `nav`, `main`, `section`, `footer`, `h1`-`h6` properly
- **Keyboard navigable** -- all interactive elements must be reachable via Tab
- **WCAG 2.1 AA** compliance target
- Test with screen readers when possible
- Images need meaningful `alt` text (or `aria-hidden` if decorative)

---

<a id="ai-assisted-development--attribution-policy"></a>

## 🤖 AI-Assisted Development & Attribution Policy

Let's be real -- the code owners didn't write every line of this project by hand, and we don't expect you to either. **Using AI tools (Claude, Copilot, ChatGPT, Cursor, etc.) to help write code is completely fine.** We'd be hypocrites if we said otherwise.

That said, there's a difference between using AI as a tool and blindly pasting whatever it spits out. We don't want vibe-coded junk. **You are responsible for the code you submit**, regardless of who (or what) helped write it.

### What We Expect

- **Understand your code.** If you can't explain what a function does and why, don't submit it.
- **Match existing patterns.** AI tools love to invent their own conventions. Make sure AI-generated code follows _our_ code style, architecture, and naming patterns -- not whatever the model hallucinated.
- **Test it.** AI-generated code is especially prone to subtle bugs. Run the checks. Add new ones if needed.
- **Review it yourself.** Do a self-review of every AI-generated line before pushing. Treat AI output like a junior developer's first draft -- helpful starting point, needs a careful eye.

### No AI Attribution in Code

This one is non-negotiable. Our repo must be **clean of AI attribution lines**. That means:

- **No** `Co-Authored-By: Claude`, `Generated by ChatGPT`, or similar lines in commits
- **No** `// Generated by AI` or `// Copilot suggestion` comments in code
- **No** AI tool branding, promotional links, or attribution banners in PR descriptions

We have a CI check (**Attribution Check**) that scans three layers: commit message trailers, code comments in changed files, and PR descriptions. It covers all major AI tools (Claude, Copilot, ChatGPT, Cursor, Gemini, Codeium, CodeWhisperer, Tabnine, Devin, Aider, and others) and will fail your PR if any attribution is found.

Why? Because attribution to a tool that can't be held accountable for code quality is meaningless noise. The _contributor_ is the author. Own it.

### Attribution Check Severity Levels

The CI attribution check classifies findings by severity and takes action automatically:

| Severity | What triggers it | Action taken |
|----------|-----------------|--------------|
| 🔴 **CRITICAL** | Non-whitelisted bot detected as commit co-author (`[bot]` suffix or `noreply@` email) | PR **automatically closed** with comment explaining why |
| 🟠 **HIGH** | AI tool name in commit trailers (e.g., `Co-Authored-By: Claude`) or AI branding in PR description | PR **blocked** -- comment with rebase/edit instructions |
| 🟡 **MEDIUM** | AI attribution comments in code files (e.g., `// Generated by Claude`) | PR **blocked** -- comment with removal instructions |

When a PR is clean, the attribution check posts a positive confirmation. ✅

### Bot Whitelist

The following bots are whitelisted and will **not** trigger attribution findings:

- **GitHub system:** `github-actions[bot]`, `dependabot[bot]`
- **GlycemicGPT project:** `glycemicgpt-ci[bot]`, `glycemicgpt-security[bot]`, `glycemicgpt-release[bot]`, `glycemicgpt-merge[bot]`, `glycemicgpt-renovate[bot]`
- **Third-party integrations:** `coderabbitai[bot]`, `gitguardian[bot]`
- **Legacy:** `homebot-0[bot]`

If your PR is flagged for a legitimate bot that isn't an AI coding tool, open an issue to request whitelisting. Include the bot name and its purpose.

### CodeRabbit -- AI Code Review

We use [CodeRabbit](https://www.coderabbit.ai) for automated AI code review on all PRs. It runs automatically when you open a PR -- no setup needed on your end. It posts a summary and inline comments with findings covering code quality, bugs, and best practices.

If you want to catch these issues before your PR, you can install the CLI locally for free. See [Pre-Review with CodeRabbit CLI](#before-you-submit) in the "Before You Submit" section.

---

<a id="project-structure"></a>

## 📁 Project Structure

```
website/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout (theme, metadata)
│   │   ├── page.tsx        # Landing page (all sections)
│   │   └── globals.css     # Global styles + Tailwind
│   ├── components/
│   │   ├── sections/       # Page sections (hero, features, chart, etc.)
│   │   ├── ui/             # shadcn/ui components
│   │   ├── header.tsx      # Sticky header with nav
│   │   ├── footer.tsx      # Footer with disclaimer
│   │   └── ...
│   └── lib/
│       ├── utils.ts        # cn() helper
│       └── sample-data.ts  # Demo glucose/insulin data
├── public/
│   └── CNAME              # Custom domain config
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   ├── CODEOWNERS          # Code ownership
│   └── *.json              # Auto-labeler, changelog config
├── .lighthouserc.json      # Lighthouse CI thresholds
├── next.config.ts          # Static export config
└── CONTRIBUTING.md         # You are here!
```

---

<a id="license"></a>

## 📜 License

GlycemicGPT Website is licensed under the [GNU Affero General Public License v3.0](LICENSE). By contributing, you agree that your contributions will be licensed under the same license.

---

<a id="questions"></a>

## 💬 Questions?

- 💡 **Ideas & suggestions** -- Open a [Discussion](https://github.com/lumose-health/website/discussions) or [Issue](https://github.com/lumose-health/website/issues)
- 🐛 **Bug reports** -- Open an [Issue](https://github.com/lumose-health/website/issues/new)
- 🙌 **General questions** -- Start a [Discussion](https://github.com/lumose-health/website/discussions)

We try to respond to PRs and issues within a few days. If your PR sits without feedback for more than a week, feel free to leave a comment pinging the maintainers.

---

_Because no one should manage diabetes alone._ 💙
