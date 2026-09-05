# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

LeaveEasy is a student lab project for **ADT-RAISE Non-Degree Batch 2, Module 2** (weeks 6–9). It's an online leave-request system (พนักงานยื่นใบลา → หัวหน้าพิจารณา → อนุมัติ/ไม่อนุมัติ) built as a teaching exercise: plain HTML/CSS/JS, no framework, no custom server, backed directly by Firestore from the browser.

**`leaveeasy-spec.md` is the authoritative spec** — read it before implementing any feature. It defines the data model, field names, user stories with acceptance criteria, the week-by-week scope table (§8), and an explicit out-of-scope list (§9). The commit log shows the project is currently at the end of week 6 (Firestore read-only wiring on the requests list/detail pages).

**Do not implement ahead of the current week.** The spec's own instruction to AI (§0.2, §9): only build what's explicitly written for the current week; if something seems missing, propose it and wait rather than adding it. Concretely, per §8/§9 as of week 6: no create/update/delete against Firestore yet (new-leave-request and leave-types still only mutate in-memory/sessionStorage), no auth, no hosting, no Security Rules, no framework, no custom server/backend, no automated tests, no pagination.

## Commands

```
npm install     # installs devDependency `serve`
npm run dev     # serve -l 3000 .  → http://localhost:3000
```

Pages that talk to Firestore (`leave-requests.html`, `leave-request-detail.html`, `seed.html`) load `js/firebase-init.js` as an ES module and **must be opened via `http://localhost:3000/...`** — opening them as `file://` breaks ES module imports. Pages not yet wired to Firestore still work via `file://`.

There is no build step, linter, or test suite (automated tests aren't introduced until week 9 per the spec).

To (re)seed sample data into Firestore: run the dev server, open `http://localhost:3000/seed.html`, click the button. It's safe to re-run — it uses `setDoc` with the fixed ids from `js/data.js` (u001, lt001, lr001, ...), so it overwrites rather than duplicates.

## Architecture

Multi-page static site — one `.html` file per screen, no router:
- `index.html`, `leave-requests.html`, `new-leave-request.html`, `leave-request-detail.html`, `leave-types.html`
- `css/style.css` — shared styling for every page
- `js/*.js` — one script per page, plus shared helpers below

Shared JS modules loaded via `<script>` tags in each page's `<head>`:
- `js/firebase-init.js` — the **only** Firebase init point. ES module (`type="module"`), imports the SDK straight from the gstatic CDN (no npm package, no bundler). Sets `window.db` and `window.getCollection(name)` (reads a whole collection, returns `[{id, ...fields}]`) so non-module scripts can use it.
- `js/data.js` — hardcoded fake/seed data on `window.LEAVE_DATA` (users, leaveTypes, leaveRequests, approvals), field-for-field identical to the Firestore schema. Still used by pages not yet reading from Firestore (leave-types, new-leave-request) and by `seed.js`.
- `js/util.js` — `esc()` (HTML-escape), `ป้ายสถานะ()` (status badge HTML), `เวลาตอนนี้()` (current timestamp in `YYYY-MM-DD HH:mm`), `ค่าจากURL()` (URL query param).
- `js/nav.js` — renders the shared top navbar into `<div id="nav">` and defines `showConfigWarning()`, the yellow banner shown when a Firestore read fails.
- `js/seed.js` — one-time button handler that writes `window.LEAVE_DATA` into Firestore via `setDoc`.

**Script load order in `<head>` matters**: `util.js` and `nav.js` (classic, `defer`) run before `firebase-init.js` (module, always deferred) and the page-specific script (classic, `defer`) — all execute in document order after parsing, so a page's own script can safely call `window.getCollection`, `esc`, etc. as long as it's declared after those in the HTML.

**Migration in progress (week 6→7)**: pages are moving one at a time from reading `window.LEAVE_DATA` to reading Firestore via `window.getCollection`. `leave-requests.js` and `leave-request-detail.js` already read Firestore for the requests list itself, but writes (new requests, status changes, comments) still only live in `sessionStorage`/in-memory — check each page's own top-of-file comment for its current state before assuming Firestore is fully wired.

## Data model

Firestore collections (see spec §5 for the full table + rationale):

```
users/{uid}          { name, email, role }        role ∈ employee | manager | hr
leaveTypes/{id}       { name }
leaveRequests/{id}    { title, reason, status, startDate, endDate, createdAt,
                        requesterId, requesterName,
                        approverId,  approverName,
                        leaveTypeId, leaveTypeName }
  approvals/{id}      (subcollection of a leaveRequests doc)
                      { authorId, authorName, message, createdAt }
```

- Field names are **case-sensitive and denormalized on purpose** — `*Name` fields are copies of the related doc's `name` (Firestore has no JOIN). Always write both the id and the denormalized name together; never rename a field ad hoc.
- `status` has exactly 3 values and one-way transitions: `รอพิจารณา` → `อนุมัติ` | `ไม่อนุมัติ` (terminal). New requests always start at `รอพิจารณา`. Status changes must touch only the `status` field, never overwrite the rest of the doc. Setting status to `ไม่อนุมัติ` requires at least one `approvals` entry to exist first. Only requests still at `รอพิจารณา` may be deleted.
- Dates/timestamps are stored as plain strings (`YYYY-MM-DD`, `YYYY-MM-DD HH:mm`), not Firestore Timestamps.

## Conventions to preserve

- **Variable/function names in JS are Thai** (e.g. `ใบลาทั้งหมด`, `แสดงตาราง`, `เปลี่ยนสถานะ`) — this is intentional for the course, not something to "fix" to English. Match the existing style when editing these files.
- All on-screen text is Thai; file names and Firestore field names are English (per spec §0.2).
- No framework, no bundler, no TypeScript — keep additions as plain script tags / plain functions consistent with the existing files.
