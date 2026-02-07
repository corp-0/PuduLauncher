# Flatpak packaging

This project ships a Flatpak manifest at `flatpak/com.corp0.pudu-launcher.yml`.

## Prerequisites (Linux)

Install Flatpak tooling:

```bash
sudo apt-get update
sudo apt-get install -y flatpak flatpak-builder
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

Install the native Linux dependencies needed for `npm run tauri build` (same as CI):

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  clang \
  zlib1g-dev
```

## Build

From the repository root:

```bash
npm run flatpak:build
```

This command:
1. Builds your Linux Tauri executable and sidecar.
2. Packages both binaries with Flatpak.
3. Exports `flatpak/com.corp0.pudu-launcher.flatpak`.

## Local install / run

```bash
flatpak install --user --bundle flatpak/com.corp0.pudu-launcher.flatpak
flatpak run com.corp0.pudu-launcher
```
