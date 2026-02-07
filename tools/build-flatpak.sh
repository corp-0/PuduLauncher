#!/usr/bin/env bash
set -euo pipefail

APP_ID="com.corp0.pudu-launcher"
MANIFEST="flatpak/${APP_ID}.yml"
BUILD_DIR="flatpak/.flatpak-builder/build"
REPO_DIR="flatpak/repo"
BUNDLE_FILE="flatpak/${APP_ID}.flatpak"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "Flatpak builds are only supported on Linux."
  exit 1
fi

if ! command -v flatpak-builder >/dev/null 2>&1; then
  echo "flatpak-builder is required."
  exit 1
fi

if ! command -v flatpak >/dev/null 2>&1; then
  echo "flatpak is required."
  exit 1
fi

if ! flatpak remotes --columns=name | grep -qx "flathub"; then
  flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
fi

npm run tauri build -- --bundles none

flatpak-builder \
  --user \
  --force-clean \
  --install-deps-from=flathub \
  "${BUILD_DIR}" \
  "${MANIFEST}"

flatpak build-export "${REPO_DIR}" "${BUILD_DIR}"
flatpak build-bundle "${REPO_DIR}" "${BUNDLE_FILE}" "${APP_ID}" stable

echo "Created ${BUNDLE_FILE}"
