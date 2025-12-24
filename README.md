# Xandeum pNode Analytics Dashboard

A real-time analytics dashboard for monitoring Xandeum pNodes network performance, health scores, and storage metrics.

## Overview

This dashboard provides comprehensive insights into the Xandeum pNode network, including:

- Network-wide statistics and health monitoring
- Individual node performance tracking with health scores
- Storage utilization and capacity metrics
- Version distribution across the network
- Node ranking and percentile analysis
- Geographic distribution visualization

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (New York style)
- **Charts**: Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Command Palette**: kbar

## Features

- 📊 Real-time network analytics with interactive charts
- 🏥 Node health scoring system (uptime, storage efficiency, version, public access)
- 📈 Performance ranking with percentile groupings
- 🗺️ Geographic node distribution (Leaflet maps)
- 🔍 Advanced filtering and search capabilities
- 📋 Data tables with server-side pagination
- 🎨 Dark mode optimized UI
- ⌨️ Keyboard shortcuts via Cmd+K

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd xandeum-pnode-analytics

# Install dependencies
pnpm install
# or
bun install

# Copy environment variables
cp env.example.txt .env.local

# Start development server
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

See `env.example.txt` for required configuration:

- **Clerk**: Authentication (supports keyless mode for quick start)
- **Sentry**: Error tracking and monitoring

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard routes
│   └── api/                # API endpoints
├── components/             # Shared UI components
│   ├── ui/                 # Shadcn UI primitives
│   ├── layout/             # Layout components
│   └── dashboard/          # Dashboard-specific components
├── features/               # Feature modules
│   ├── overview/           # Analytics overview
│   ├── kanban/             # Task management
│   ├── products/           # Product management
│   └── profile/            # User profile
├── lib/                    # Utilities
│   ├── nodeData.ts         # Node data processing
│   ├── geo.server.ts       # Geographic utilities
│   └── utils.ts            # General helpers
├── config/                 # App configuration
└── types/                  # TypeScript definitions
```

## Node Health Scoring

Each pNode receives a health score (0-100) based on:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Uptime | 40 pts | 30 days = full points |
| Storage Efficiency | 25 pts | committed/total ratio |
| Version Currency | 20 pts | Latest version = full points |
| Public Access | 15 pts | Public nodes score higher |

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues
pnpm format       # Format with Prettier
```

## License

MIT
