<p align="center">
  <h1 align="center">Xandeum pNode Analytics</h1>
</p>

<p align="center">
  Real-time analytics dashboard for monitoring Xandeum pNodes - decentralized storage nodes in the Xandeum network
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## Overview

Xandeum pNode Analytics provides real-time insights into the Xandeum decentralized storage network. Track node status, storage capacity, uptime, and network health across all pNodes.

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Monitoring** | Live status updates for all pNodes |
| 💾 **Storage Analytics** | Track storage usage and capacity |
| ⏱️ **Uptime Tracking** | Monitor node availability |
| 🗺️ **Geographic View** | Visualize node locations with Leaflet |
| 📈 **Charts** | Recharts visualizations for metrics |
| 🔍 **Filtering** | Search and filter by status, version |
| 📋 **Data Tables** | Sortable tables with Tanstack Table |
| 🌙 **Dark Mode** | Built-in dark theme |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [Shadcn UI](https://ui.shadcn.com) |
| Charts | [Recharts](https://recharts.org) |
| Maps | [Leaflet](https://leafletjs.com) |
| Tables | [Tanstack Table](https://tanstack.com/table) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |

## Quick Start

```bash
git clone https://github.com/AqilaRifti/xandeum-pnode.git
cd xandeum-pnode

bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Layout components
├── lib/                   # Utilities
│   ├── nodeData.ts        # pNode data utilities
│   └── geo.server.ts      # Geographic utilities
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## Scripts

```bash
bun run dev        # Start development server
bun run build      # Build for production
bun run start      # Start production server
bun run lint       # Run ESLint
bun run format     # Format with Prettier
```

## Documentation

Full documentation available in the [docs](./docs/index.html) folder.

## License

MIT License - see [LICENSE](./LICENSE) for details.

Copyright (c) 2025 AqilaRifti
