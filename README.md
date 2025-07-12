# Aggregated News Website – Technical Documentation

---

## 1. Project Overview

**Mission:** Deliver an unbiased, topic‑driven news discovery platform that surfaces *unknown‑unknowns* through a hierarchical channel taxonomy and transparent promotion signals.

**Key Features**

* Topic channels arranged from general → specific (taxonomy tree)
* Automatic upward promotion of high‑signal sub‑topic stories
* Uniform interaction counters (clicks, comments) across multiple time windows
* Responsive UI (desktop & mobile)
* Firestore‑backed MVP data store (NoSQL)

**Guiding Principles**

1. **Neutrality:** No individualised ranking; rely on global interaction data.
2. **Transparency:** Simple, inspectable promotion logic.
3. **Explorability:** Users can drill into any branch of the taxonomy at will.

---

## 2. Information Architecture

### 2.1 Channel Taxonomy

```
World
 ├── Politics
 │    ├── Elections
 │    └── Policy
 ├── Business
 │    ├── Markets
 │    └── Start‑ups
 └── Technology
      ├── AI
      └── Gadgets
```

*Root = broadest themes; leaves = granular sub‑topics.*

### 2.2 Promotion Flow

1. **Interaction capture** → clicks & comments increment counters.
2. **Time‑window slices** (daily, weekly, monthly, yearly, all‑time).
3. **Score aggregation** within each slice.
4. **Threshold check** → if a child score ≥ *X*% of sibling median, bubble headline to parent.

> **Note:** Monthly/weekly counters reset at slice boundaries (01:00 UTC). Known imperfection but acceptable MVP trade‑off.

### 2.3 Bias Mitigation

* Single global counters—no per‑user weighting.
* No personalised reorder; only taxonomy + score.
* Open‑sourced scoring script for community audit.

---

## 3. Data & Backend

### 3.1 Stack Snapshot

| Layer     | Choice    | Rationale                  |
| --------- | --------- | -------------------------- |
| Front‑end | Next.js   | SSR + React ecosystem      |
| Hosting   | Vercel    | Quick CI/CD                |
| Auth      | NextAuth  | Minimal JWT sessions       |
| DB        | Firestore | Fast iteration, serverless |
| Storage   | GCS       | Article images, thumbnails |

### 3.2 Firestore Schema (MVP)

* **collections:**

  * `channels/{channelId}`

    * `name`
    * `parentId`
    * `path[]`
  * `news/{newsId}`

    * `channelId`
    * `title`, `url`, `publishedAt`
    * `interactionCounters`: `{day, week, month, year, all}`
  * `interactions/{newsId}_{userId?}` (optional per‑user doc)

    * `type`: click | comment
    * `ts`

### 3.3 Counter Handling & Freshness Strategy

#### 1. Granular 10‑minute buckets (real‑time freshness)

* **Per‑interaction write** → `buckets.tenMin.{id}` where **`id = ⌊epoch/600k⌋`** (UTC, 10‑minute floor).
* **Cloud Scheduler** runs **every 10 min** (`rollupTenMinute`):

  1. Fetch docs whose `buckets.tenMin.*` changed in last run (via Pub/Sub topics or `recentTouched` list).
  2. Sum the new buckets into `interactionCounters.day/week/month/year`.
  3. Clear bucket keys older than 24 h to cap doc size.

#### 2. Scheduled window resets

| Schedule               | Function       | Action                                                    |
| ---------------------- | -------------- | --------------------------------------------------------- |
| 00:05 UTC daily        | `resetDaily`   | Zero `interactionCounters.day`, update parent promo cache |
| Monday 00:10 UTC       | `resetWeekly`  | Zero `week` counters                                      |
| 1st of month 00:15 UTC | `resetMonthly` | Zero `month` counters                                     |
| 1 Jan 00:20 UTC        | `resetYearly`  | Zero `year` counters                                      |

*All‑time counter never resets.*

#### 3. On‑demand safety net

If a story lies dormant across a boundary, its first new interaction still verifies `now >= nextSliceBoundary` (see previous version) to prevent stale tallies without extra scheduler cost on the long tail.

---

## 4. UI Design

*(Placeholder – insert wireframes/PNG once available)*

### 4.1 Desktop

* **Left rail:** Channel tree navigation.
* **Main feed:** Promoted stories ordered by time slice selected.
* **Right rail:** Trending time‑window selector.

### 4.2 Mobile

* **Hamburger menu:** Collapsible channel tree.
* **Bottom bar:** Home │ Channels │ Search │ Profile.

### 4.3 Interaction Components

* Upvote / Comment buttons beneath headline.
* Time‑window dropdown (defaults to *Today*).
* Breadcrumb path for context (e.g., *World › Politics › Elections*).

---

## 5. User Flows

| # | Flow                   | Steps                                              |
| - | ---------------------- | -------------------------------------------------- |
| 1 | Passive browsing       | Open site → default *Today* feed → click article   |
| 2 | Deep topic exploration | Tap channel → drill to sub‑topic → filtered feed   |
| 3 | Interacting w/ content | Click headline → counter++ → optional comment      |
| 4 | Time‑slice pivot       | Select *Monthly* → feed re‑orders by monthly score |

---

## 6. Non‑Functional Requirements

* **Performance:** First Contentful Paint < 2s on 3G (mobile).
* **Scalability:** 10k concurrent users; sharded counters.
* **Accessibility:** WCAG 2.1 AA compliance.
* **Security:** Firestore rules restrict write paths; rate‑limit Cloud Functions.

---

## 7. Roadmap / Future Work

1. Replace Firestore with Bigtable + Cloud Run microservice for heavy traffic.
2. Fine‑grained decay algorithm instead of rigid slice resets.
3. Editorial tools for taxonomy curation.
4. Real‑time WebSocket updates for live scores.

---

## 8. Glossary

* **Channel:** Taxonomy node/topic.
* **Promotion:** Upward surfacing of a story to parent channel.
* **Time‑slice:** Fixed window for interaction aggregation.

---

*Last updated: 2025‑07‑12*
