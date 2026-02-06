# /// script
# dependencies = ["pillow"]
# ///

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


DEFAULT_SOURCE = Path(__file__).parent / "pudu.png"
DEFAULT_ICONS_DIR = Path(__file__).resolve().parents[2] / "src-tauri" / "icons"


def _load_base_image(source: Path) -> Image.Image:
    img = Image.open(source).convert("RGBA")
    if img.width != img.height:
        side = min(img.width, img.height)
        img = ImageOps.fit(img, (side, side), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    return img


def _read_existing_square_size(path: Path) -> tuple[int, int]:
    with Image.open(path) as img:
        return img.size


def _read_container_sizes(path: Path, fallback: list[int]) -> list[int]:
    try:
        with Image.open(path) as img:
            sizes = img.info.get("sizes")
            if sizes:
                return sorted({int(s[0]) for s in sizes})
    except Exception:
        pass
    return fallback


def _save_png(base: Image.Image, output_path: Path, size: tuple[int, int]) -> None:
    resized = base.resize(size, Image.Resampling.LANCZOS)
    resized.save(output_path, format="PNG")


def _save_ico(base: Image.Image, output_path: Path, sizes: list[int]) -> None:
    size_pairs = [(s, s) for s in sizes]
    base.save(output_path, format="ICO", sizes=size_pairs)


def _save_icns(base: Image.Image, output_path: Path, sizes: list[int]) -> None:
    size_pairs = [(s, s) for s in sizes]
    base.save(output_path, format="ICNS", sizes=size_pairs)


def generate_icons(source: Path, icons_dir: Path) -> None:
    if not source.is_file():
        raise FileNotFoundError(f"Source image not found: {source}")
    if not icons_dir.is_dir():
        raise FileNotFoundError(f"Icons directory not found: {icons_dir}")

    base = _load_base_image(source)

    ico_fallback = [16, 24, 32, 48, 64, 128, 256]
    icns_fallback = [16, 32, 64, 128, 256, 512, 1024]

    png_targets: list[tuple[Path, tuple[int, int]]] = []
    ico_path: Path | None = None
    icns_path: Path | None = None

    for path in sorted(icons_dir.iterdir()):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix == ".png":
            png_targets.append((path, _read_existing_square_size(path)))
        elif suffix == ".ico":
            ico_path = path
        elif suffix == ".icns":
            icns_path = path

    for path, size in png_targets:
        _save_png(base, path, size)

    if ico_path:
        ico_sizes = _read_container_sizes(ico_path, ico_fallback)
        _save_ico(base, ico_path, ico_sizes)

    if icns_path:
        icns_sizes = _read_container_sizes(icns_path, icns_fallback)
        _save_icns(base, icns_path, icns_sizes)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Tauri icons from pudu.png.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Path to source PNG.")
    parser.add_argument("--icons-dir", type=Path, default=DEFAULT_ICONS_DIR, help="Path to icons directory.")
    args = parser.parse_args()

    generate_icons(args.source, args.icons_dir)
    print(f"Icons generated in {args.icons_dir}")


if __name__ == "__main__":
    main()
