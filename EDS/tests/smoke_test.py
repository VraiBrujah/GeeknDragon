"""Tests locaux de fumée pour la présentation.

Vérifie l'existence des fichiers clés, la lisibilité basique des CSV,
et la présence des assets référencés par l'HTML (liens relatifs seulement).
Documentation et commentaires en français; identifiants en anglais.
"""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[1]


def load_config() -> dict:
    """Charge la configuration locale si disponible, sinon l'exemple.

    Retourne un dictionnaire avec les clés:
    - presentation_dir: dossier de la présentation
    - entry_html: fichier HTML d'entrée
    - asset_dirs: sous-dossiers d'assets
    - data_files: fichiers CSV attendus
    """
    cfg_path = ROOT / "config.json"
    example_path = ROOT / "config.example.json"
    path = cfg_path if cfg_path.exists() else example_path
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def assert_file_exists(path: Path, errors: list[str]) -> None:
    """Ajoute une erreur si le fichier n'existe pas."""
    if not path.exists():
        errors.append(f"Fichier manquant: {path}")


def check_csv_file(path: Path, errors: list[str]) -> None:
    """Valide qu'un CSV est lisible et possède au moins un en-tête."""
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.reader(f)
            header = next(reader, None)
            if not header or len(header) == 0:
                errors.append(f"CSV sans en-tête: {path}")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"Lecture CSV échouée ({path}): {exc}")


def extract_relative_assets(html_text: str) -> list[str]:
    """Extrait les chemins relatifs depuis src/href (ignore http/https et //).

    Retourne une liste de chemins tels qu'ils apparaissent dans l'HTML.
    """
    pattern = r"(?:src|href)\s*=\s*\"([^\"]+)\""
    candidates = re.findall(pattern, html_text)
    rel = [c for c in candidates if not re.match(r"^(?:https?:)?//", c)]
    return rel


def check_html_and_assets(base_dir: Path, entry_html: str, errors: list[str]) -> None:
    """Vérifie le fichier HTML d'entrée et la présence des assets référencés."""
    html_path = base_dir / entry_html
    assert_file_exists(html_path, errors)
    if not html_path.exists():
        return
    try:
        text = html_path.read_text(encoding="utf-8")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"Lecture HTML échouée ({html_path}): {exc}")
        return

    for ref in extract_relative_assets(text):
        # Ignore ancres ou liens vides
        if not ref or ref.startswith("#"):
            continue
        asset_path = (html_path.parent / ref).resolve()
        # Restreindre à la racine du projet
        try:
            asset_path.relative_to(ROOT)
        except ValueError:
            errors.append(f"Chemin d'asset hors du dépôt: {ref}")
            continue
        if not asset_path.exists():
            errors.append(f"Asset manquant référencé par HTML: {ref}")


def main() -> int:
    """Point d'entrée du test: renvoie 0 si tout va bien, 1 sinon."""
    cfg = load_config()
    base_dir = ROOT / cfg["presentation_dir"]
    errors: list[str] = []

    # 1) Dossier et HTML d'entrée
    assert_file_exists(base_dir, errors)
    check_html_and_assets(base_dir, cfg["entry_html"], errors)

    # 2) Dossiers d'assets
    for d in cfg.get("asset_dirs", []):
        assert_file_exists(base_dir / d, errors)

    # 3) Fichiers CSV
    for csv_name in cfg.get("data_files", []):
        csv_path = base_dir / csv_name
        assert_file_exists(csv_path, errors)
        if csv_path.exists():
            check_csv_file(csv_path, errors)

    if errors:
        print("Echec des tests:")
        for e in errors:
            print(f" - {e}")
        return 1

    print("Tests de fumée OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

