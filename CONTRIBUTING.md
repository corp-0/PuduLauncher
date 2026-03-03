# Contributing

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) (Rust toolchain, platform-specific dependencies)

## Setup

Clone the repo and install npm dependencies:

```bash
git clone https://github.com/corp-0/PuduLauncher.git
cd PuduLauncher
npm install
```

Generate TypeScript types and API clients from the C# source:

```bash
npm run generate-ts
```

This builds the .NET project, extracts a contract manifest, and generates typed API clients into `src/pudu/generated/`.

## Development

Start the full application (Tauri + React + .NET sidecar):

```bash
npm run tauri dev
```

This is the main command for local development. It launches the Tauri window, starts the .NET sidecar, and serves the React frontend with hot reload.

### Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start only the React frontend (no Tauri or sidecar) |
| `npm run build-sidecar` | Build the .NET sidecar (debug, SingleFile) |
| `npm run build-sidecar:release` | Build the .NET sidecar (release, Native AOT) |
| `npm run generate-ts` | Regenerate TypeScript types and API clients |
| `npm run tauri build` | Build the full application for distribution |
