# -*- coding: utf-8 -*-
"""
Created on Tue Aug 12 04:32:11 2025

@author: Brujah
"""

# -*- coding: utf-8 -*-
"""
Réducteur d'images – côté long cible (par défaut 600 px)
- Interface graphique (Tkinter)
- Sauvegarde l'original dans <dossier>/old-image/...
- Écrase le fichier d'origine avec la version redimensionnée
- Options: inclure sous-dossiers, ne pas agrandir (réduction seulement)
"""

import os
import sys
import threading
from pathlib import Path
from shutil import copy2

try:
    from PIL import Image, ImageOps
except ImportError:
    import tkinter as tk
    from tkinter import messagebox
    root = tk.Tk(); root.withdraw()
    messagebox.showerror("Dépendance manquante",
                         "Le module Pillow est requis.\nInstallez-le avec:\n\npip install pillow")
    sys.exit(1)

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext


SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".gif"}


def human(x: int) -> str:
    return f"{x:,}".replace(",", " ")

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Réducteur d'images (côté long)")
        self.geometry("720x520")
        self.minsize(680, 520)

        # ---- Variables UI ----
        self.folder_var = tk.StringVar(value="")
        self.target_var = tk.IntVar(value=600)
        self.subdirs_var = tk.BooleanVar(value=True)
        self.no_upscale_var = tk.BooleanVar(value=True)
        self.count_var = tk.StringVar(value="Aucune image prête.")
        self.progress_var = tk.IntVar(value=0)

        # ---- Cadre sélection dossier ----
        frm_top = ttk.LabelFrame(self, text="Dossier source")
        frm_top.pack(fill="x", padx=12, pady=(12,8))
        ttk.Entry(frm_top, textvariable=self.folder_var).pack(side="left", fill="x", expand=True, padx=8, pady=8)
        ttk.Button(frm_top, text="Parcourir…", command=self.choose_folder).pack(side="left", padx=(0,8), pady=8)

        # ---- Options ----
        frm_opts = ttk.LabelFrame(self, text="Options")
        frm_opts.pack(fill="x", padx=12, pady=8)

        sub = ttk.Checkbutton(frm_opts, text="Inclure les sous-dossiers", variable=self.subdirs_var)
        sub.grid(row=0, column=0, sticky="w", padx=8, pady=8)

        noup = ttk.Checkbutton(frm_opts, text="Ne pas agrandir (réduction seulement)", variable=self.no_upscale_var)
        noup.grid(row=0, column=1, sticky="w", padx=8, pady=8)

        ttk.Label(frm_opts, text="Côté long cible (px) :").grid(row=1, column=0, sticky="w", padx=8, pady=8)
        spn = ttk.Spinbox(frm_opts, from_=64, to=8192, textvariable=self.target_var, width=8)
        spn.grid(row=1, column=1, sticky="w", padx=8, pady=8)

        # ---- Boutons action ----
        frm_run = ttk.Frame(self)
        frm_run.pack(fill="x", padx=12, pady=8)
        self.btn_count = ttk.Button(frm_run, text="Compter les images", command=self.count_images)
        self.btn_count.pack(side="left", padx=8)
        self.btn_start = ttk.Button(frm_run, text="Démarrer le traitement", command=self.start)
        self.btn_start.pack(side="left", padx=8)
        ttk.Label(frm_run, textvariable=self.count_var).pack(side="right", padx=8)

        # ---- Progression ----
        frm_prog = ttk.LabelFrame(self, text="Progression")
        frm_prog.pack(fill="x", padx=12, pady=(0,8))
        self.pbar = ttk.Progressbar(frm_prog, maximum=100, variable=self.progress_var)
        self.pbar.pack(fill="x", padx=8, pady=8)

        # ---- Journal ----
        frm_log = ttk.LabelFrame(self, text="Journal")
        frm_log.pack(fill="both", expand=True, padx=12, pady=(0,12))
        self.log = scrolledtext.ScrolledText(frm_log, height=12, state="disabled")
        self.log.pack(fill="both", expand=True, padx=8, pady=8)

        # Style Windows
        try:
            from ctypes import windll
            windll.shcore.SetProcessDpiAwareness(1)  # anti-flou
        except Exception:
            pass

        self._worker = None
        self._stop = False

    # ---------- UI helpers ----------
    def choose_folder(self):
        path = filedialog.askdirectory(title="Choisir le dossier d'images")
        if path:
            self.folder_var.set(path)
            self.count_var.set("Cliquez sur « Compter les images » pour analyser.")
            self.progress_var.set(0)
            self.clear_log()

    def set_running(self, running: bool):
        state = "disabled" if running else "normal"
        for w in (self.btn_start, self.btn_count):
            w.config(state=state)

    def append_log(self, text: str):
        self.log.configure(state="normal")
        self.log.insert("end", text + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")
        self.update_idletasks()

    def clear_log(self):
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")

    # ---------- Core ----------
    def gather_files(self, root: Path):
        backup_root = root / "old-image"
        def in_backup(p: Path) -> bool:
            try:
                p.relative_to(backup_root)
                return True
            except ValueError:
                return False

        if self.subdirs_var.get():
            it = root.rglob("*")
        else:
            it = root.glob("*")

        files = []
        for p in it:
            if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS and not in_backup(p):
                files.append(p)
        return files

    def count_images(self):
        folder = self.folder_var.get().strip()
        if not folder:
            messagebox.showwarning("Dossier manquant", "Veuillez choisir un dossier.")
            return
        root = Path(folder)
        if not root.exists():
            messagebox.showerror("Erreur", "Le dossier n'existe pas.")
            return
        files = self.gather_files(root)
        self.count_var.set(f"{human(len(files))} image(s) trouvée(s).")
        self.append_log(f"Analyse : {human(len(files))} image(s) prêtes au traitement dans « {root} ».")

    def start(self):
        folder = self.folder_var.get().strip()
        if not folder:
            messagebox.showwarning("Dossier manquant", "Veuillez choisir un dossier.")
            return
        try:
            target = int(self.target_var.get())
            if target < 64 or target > 8192:
                raise ValueError
        except Exception:
            messagebox.showerror("Valeur invalide", "Le côté long cible doit être un entier entre 64 et 8192.")
            return

        root = Path(folder)
        files = self.gather_files(root)
        if not files:
            messagebox.showinfo("Aucune image", "Aucun fichier image trouvé à traiter.")
            return

        self._stop = False
        self.set_running(True)
        self.progress_var.set(0)
        self.clear_log()
        self.append_log(f"Début du traitement : {human(len(files))} image(s). Cible = {target}px.")
        self._worker = threading.Thread(target=self.process_all, args=(root, files, target), daemon=True)
        self._worker.start()
        self.after(200, self.poll_worker)

    def poll_worker(self):
        if self._worker and self._worker.is_alive():
            self.after(200, self.poll_worker)
        else:
            self.set_running(False)

    def process_all(self, root: Path, files, target: int):
        done = 0
        resized = 0
        skipped = 0
        errors = 0

        backup_root = root / "old-image"

        total = len(files)
        for p in files:
            try:
                with Image.open(p) as im0:
                    # Corrige l'orientation EXIF (smartphones, etc.)
                    im = ImageOps.exif_transpose(im0)
                    w, h = im.size
                    long_side = max(w, h)

                    if self.no_upscale_var.get() and long_side <= target:
                        skipped += 1
                        self.safe_log(f"⏭️  {p.name}: ignorée (déjà {w}×{h} ≤ {target}px).")
                    else:
                        # Calcul nouvelle taille
                        scale = target / float(long_side)
                        nw = max(1, int(round(w * scale)))
                        nh = max(1, int(round(h * scale)))
                        im_resized = im.resize((nw, nh), Image.LANCZOS)

                        # Sauvegarde l'original AVANT d'écraser
                        rel = p.relative_to(root)
                        backup_path = backup_root / rel
                        backup_path.parent.mkdir(parents=True, exist_ok=True)
                        copy2(p, backup_path)

                        # Préserve format et (si possible) EXIF
                        fmt = (im.format or p.suffix.lstrip(".")).upper()
                        fmt = "JPEG" if fmt in {"JPG", "JPEG"} else fmt
                        exif = im.info.get("exif", None)

                        save_kwargs = {}
                        if fmt == "JPEG":
                            # JPEG ne supporte pas l'alpha
                            if "A" in im_resized.getbands():
                                im_resized = im_resized.convert("RGB")
                            save_kwargs.update(dict(quality=92, optimize=True))
                            if exif:
                                save_kwargs["exif"] = exif
                        elif fmt == "PNG":
                            save_kwargs.update(dict(optimize=True, compress_level=9))
                        elif fmt == "WEBP":
                            save_kwargs.update(dict(quality=95, method=6))
                        elif fmt in {"TIFF", "TIF"}:
                            if exif:
                                save_kwargs["exif"] = exif

                        # Écrit par-dessus le fichier d'origine
                        im_resized.save(p, format=fmt, **save_kwargs)

                        resized += 1
                        self.safe_log(f"✅ {p.name}: {w}×{h} → {nw}×{nh} ({fmt}).")
            except Exception as e:
                errors += 1
                self.safe_log(f"❌ {p.name}: ERREUR {e}")

            done += 1
            self.safe_progress(int(done * 100 / total))

        summary = (f"Terminé. Traité: {human(done)}  |  Redimensionnées: {human(resized)}  "
                   f"|  Ignorées: {human(skipped)}  |  Erreurs: {human(errors)}\n"
                   f"Originaux sauvegardés dans: {backup_root}")
        self.safe_log("")
        self.safe_log(summary)
        self.count_var.set(summary)

    # ---- Safe UI updates from worker thread ----
    def safe_log(self, msg: str):
        self.after(0, self.append_log, msg)

    def safe_progress(self, value: int):
        self.after(0, self.progress_var.set, value)


if __name__ == "__main__":
    try:
        app = App()
        app.mainloop()
    except KeyboardInterrupt:
        pass
