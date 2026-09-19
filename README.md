# 🎬 Film Metrics Dashboard

A high-performance film analytics dashboard and automated data pipeline powered by **The Movie Database (TMDB)**, **Google Cloud Firestore**, and **Next.js 16**.

The dashboard provides rich insights into movie trends, genre distributions, rating patterns, and hidden cinematic gems with near-zero cloud database costs thanks to custom zlib compilation and on-demand cache revalidation.

---

## 🌟 Key Features

- **📊 Comprehensive Film Metrics**: In-depth analytics including yearly rating trends, engagement scores, genre diversity, and curated "hidden gems".
- **🔍 Advanced Movie Browser**: Search, filter, and sort movies by rating, release decade, genre, and popularity with responsive pagination.
- **🎨 Modern UI/UX**: Built with React 19, Tailwind CSS v4, Lucide icons, and shadcn/ui components with full Dark/Light mode support.
- **⚡ Ultra-Optimized Architecture**:
  - **1 Read per Day**: Next.js caches the entire library in memory. When refreshing, it reads only **1** compressed document from Firestore instead of 3,500+ individual movie reads.
  - **~21 Writes per Day**: Scraper writes a single compiled payload, ~19 genre documents, and 1 global stats document instead of thousands of per-movie writes.
  - **Instant Client-Side Filtering**: Sorting, pagination, and multi-filter criteria evaluate in-memory with sub-millisecond response times.
- **🔄 Automated Synchronization**: GitHub Actions runs daily to extract fresh movie releases from TMDB, update Firestore, and notify the Next.js edge cache via secure webhooks.

---

## 🏗️ Architecture & Optimization Strategy

```
  ┌────────────────────────────────────────────────────────┐
  │                 Daily GitHub Actions                   │
  │                    (00:00 UTC)                         │
  └───────────────┬────────────────────────┬───────────────┘
                  │                        │
       1. Run Python Scraper      2. Trigger Revalidation
                  │                        │
                  ▼                        ▼
       ┌──────────────────────┐  POST /api/revalidate
       │       TMDB API       │            │
       └──────────┬───────────┘            │
                  │                        │
                  ▼                        ▼
       ┌──────────────────────┐  ┌──────────────────────┐
       │   zlib Compression   │  │   Next.js Frontend   │
       │    (~100 KB blob)    │  │  (unstable_cache)    │
       └──────────┬───────────┘  └──────────▲───────────┘
                  │                         │
                  ▼                         │ 1 Read
       ┌────────────────────────────────────┴───────────┐
       │             Firebase Firestore                 │
       │  • movies_compiled/all (1 doc - all movies)    │
       │  • stats/global        (1 doc - trends/gems)   │
       │  • genres/*            (~19 docs - statistics) │
       └────────────────────────────────────────────────┘
```

### Free-Tier Friendly Design
Google Cloud Firestore free tier provides 50,000 reads and 20,000 writes daily.
- **Previous naive approach**: Fetching 3,500 individual documents per visitor would exhaust the quota after ~14 visits.
- **Current compiled approach**:
  1. **Scraper (`scraper/update_movies.py`)**: Gathers movies, calculates statistics, serializes the full movie dataset into JSON, compresses it via `zlib` into a binary buffer (~100 KB), and uploads it to `movies_compiled/all`.
  2. **Dashboard (`dashboard/lib/movies.ts`)**: Uses Next.js `unstable_cache` with `revalidate: false`. It reads `movies_compiled/all` once, decompresses it in-memory, and serves all incoming visitor requests directly from cache.
  3. **Revalidation**: When the daily scraper completes, GitHub Actions issues an authenticated `POST` request to `/api/revalidate`, purging the Next.js tags (`movies`, `genres`, `stats`).

---

## 📁 Project Structure

```
film-metrics-dashboard/
├── .github/
│   └── workflows/
│       ├── update_movies.yml       # Daily scraper execution & cache revalidation
│       └── revalidate_cache.yml    # Manual on-demand cache revalidation
├── dashboard/                      # Next.js 16 web application
│   ├── app/                        # App Router pages & API routes
│   │   ├── (main)/                 # Main pages (Home, Browser, Genres, Movie details)
│   │   └── api/
│   │       ├── revalidate/         # On-demand tag revalidation endpoint
│   │       └── movies/             # Movie endpoints
│   ├── components/                 # UI components (charts, movie cards, navigation)
│   └── lib/                        # Data fetching, caching logic, and Firebase Admin
└── scraper/                        # Python ETL pipeline
    ├── config/                     # Firebase service credentials (local dev)
    ├── utils/                      # Custom logger and formatting helpers
    └── update_movies.py            # Primary scraper script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Managed with `fnm` (Node 20+ / Node 24 recommended)
- **Package Manager**: `pnpm`
- **Python**: Managed with `uv` (Python 3.11+)
- **Accounts**:
  - [TMDB API Key](https://www.themoviedb.org/documentation/api)
  - [Firebase / Google Cloud Project](https://console.firebase.google.com/) with Firestore enabled

---

### 1. Backend Scraper Setup

Navigate to `scraper/`:
```bash
cd scraper
```

Create a virtual environment and install dependencies:
```bash
uv venv
uv pip install -r requirements.txt
```

Configure environment variables in `scraper/.env`:
```env
TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here
# Optional if using local serviceAccountKey.json file:
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
```

Place your Firebase service account JSON file at `scraper/config/serviceAccountKey.json` (or supply the stringified JSON via `FIREBASE_SERVICE_ACCOUNT`).

Run the scraper manually:
```bash
uv run python update_movies.py
```

---

### 2. Frontend Dashboard Setup

Navigate to `dashboard/`:
```bash
cd dashboard
```

Install dependencies:
```bash
pnpm install
```

Configure environment variables in `dashboard/.env.local`:
```env
# Firebase Admin Credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# TMDB API
TMDB_TOKEN=your_tmdb_bearer_token_here

# Cache Invalidation Secret
REVALIDATE_SECRET=your_custom_secret_token

# NextAuth (Optional / Auth support)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ GitHub Actions Automation

To run the automated synchronization, configure the following secrets in **Repository Settings -> Secrets and variables -> Actions**:

| Secret Name | Description |
|---|---|
| `TMDB_BEARER_TOKEN` | TMDB API Bearer token for movie queries |
| `FIREBASE_SERVICE_ACCOUNT` | Entire JSON content of your Firebase service account key |
| `APP_URL` | Deployed frontend URL (e.g. `https://your-domain.vercel.app`) |
| `REVALIDATE_SECRET` | Secret token matching `REVALIDATE_SECRET` configured on the frontend |

The scheduled workflow (`.github/workflows/update_movies.yml`) triggers automatically every day at `00:00 UTC` and can also be triggered manually via the **Actions** tab in GitHub or via GitHub CLI:

```bash
gh workflow run update_movies.yml
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore)
- **External API**: [The Movie Database (TMDB)](https://www.themoviedb.org/)
- **ETL Script**: Python 3.11, `requests`, `zlib`, `firebase-admin`
- **CI/CD**: GitHub Actions
- **State & Caching**: Zustand, Next.js Server Cache Tags (`revalidateTag`)

---

## 📄 License

This project is licensed under the MIT License.
