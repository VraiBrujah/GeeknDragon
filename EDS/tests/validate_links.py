"""Validateur détaillé des liens et assets HTML.

Contrôles:
- Références locales (src/href) pointent vers des fichiers existants.
- Ancres internes (#id) référencent un id présent dans la page.
- Images non vides (taille > 0).

Hors scope: validation des ancres inter-pages (fichiers distincts).
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag
import sys
import json


ROOT = Path(__file__).resolve().parents[1]


def load_config() -> dict:
    cfg_path = ROOT / "config.json"
    example_path = ROOT / "config.example.json"
    path = cfg_path if cfg_path.exists() else example_path
    return json.loads(path.read_text(encoding="utf-8"))


class LinkCollector(HTMLParser):
    """Collecte les ids et les liens (src/href) dans le document."""

    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[tuple[str, str, str]] = []  # (tag, attr, value)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_dict = {k: v for k, v in attrs if v is not None}
        # id
        if "id" in attr_dict and attr_dict["id"]:
            self.ids.add(attr_dict["id"])
        # href/src
        for key in ("src", "href"):
            if key in attr_dict and attr_dict[key]:
                self.links.append((tag, key, attr_dict[key]))


def is_external(ref: str) -> bool:
    ref_l = ref.lower()
    return ref_l.startswith(("http://", "https://", "//", "mailto:", "tel:", "data:"))


def validate_html(html_path: Path) -> list[str]:
    errors: list[str] = []
    text = html_path.read_text(encoding="utf-8")
    parser = LinkCollector()
    parser.feed(text)

    for tag, attr, ref in parser.links:
        if not ref or is_external(ref):
            continue

        path_part, frag = urldefrag(ref)
        # Ancres internes (sans chemin)
        if not path_part and frag:
            if frag not in parser.ids:
                errors.append(f"Ancre introuvable #{frag} référencée dans {html_path.name}")
            continue

        # Chemin relatif dans le dépôt
        target = (html_path.parent / path_part).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            errors.append(f"Chemin hors dépôt: {ref}")
            continue
        if not target.exists():
            errors.append(f"Fichier manquant ({attr}) depuis <{tag}>: {ref}")
            continue
        # Image non vide
        if tag.lower() == "img":
            try:
                if target.stat().st_size <= 0:
                    errors.append(f"Image vide: {ref}")
            except OSError as exc:
                errors.append(f"Stat image échouée {ref}: {exc}")

    return errors


def main() -> int:
    cfg = load_config()
    base_dir = ROOT / cfg["presentation_dir"]
    html_path = base_dir / cfg["entry_html"]
    if not html_path.exists():
        print(f"Fichier HTML introuvable: {html_path}")
        return 1
    errors = validate_html(html_path)
    if errors:
        print("Erreurs de validation HTML:")
        for e in errors:
            print(f" - {e}")
        return 1
    print("Validation des liens HTML OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

