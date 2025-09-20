import os
import io
import sys
import shutil
import base64
from pathlib import Path
from dataclasses import dataclass

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

from PIL import Image, ImageTk, ImageOps

# ---- Constantes ----
TARGET = 1200
VALID_EXT = {".png", ".jpg", ".jpeg"}
EXPORT_ROOT_NAME = "export"  # export/<png|jpg|svg>/...

@dataclass
class ImgItem:
    src_path: Path
    rel_path: Path
    ext: str

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Carré 1200 – Traitement d’images")
        self.geometry("1200x760")
        self.minsize(1100, 680)

        # état
        self.root_dir: Path | None = None
        self.export_root: Path | None = None
        self.items: list[ImgItem] = []
        self.idx = -1
        self.current_img = None  # PIL.Image
        self.current_preview = None  # PIL.Image

        # options
        self.mode_var = tk.StringVar(value="pad")   # pad | crop | skip
        self.convert_jpg_to_png_var = tk.BooleanVar(value=True)  # si transparence requise
        self.force_png_var = tk.BooleanVar(value=False)          # nouveau: PNG même sans redim
        self.create_svg_var = tk.BooleanVar(value=True)
        self.apply_to_all_var = tk.BooleanVar(value=False)

        self.preview_size = 460
        self._build_ui()

    def _build_ui(self):
        # Barre supérieure
        top = ttk.Frame(self); top.pack(side=tk.TOP, fill=tk.X, padx=12, pady=10)
        ttk.Button(top, text="Choisir le dossier…", command=self.choose_dir).pack(side=tk.LEFT)
        self.dir_lbl = ttk.Label(top, text="Aucun dossier"); self.dir_lbl.pack(side=tk.LEFT, padx=10)
        self.counter_lbl = ttk.Label(top, text=""); self.counter_lbl.pack(side=tk.RIGHT)

        # Zone centrale
        center = ttk.Frame(self); center.pack(fill=tk.BOTH, expand=True, padx=12, pady=8)
        left = ttk.LabelFrame(center, text="Original"); left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0,6))
        right = ttk.LabelFrame(center, text="Aperçu (option sélectionnée)"); right.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(6,0))
        self.orig_canvas = tk.Label(left, bg="#111"); self.orig_canvas.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)
        self.prev_canvas = tk.Label(right, bg="#111"); self.prev_canvas.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Options
        opts = ttk.Frame(self); opts.pack(fill=tk.X, padx=12, pady=(0,8))

        modes = ttk.LabelFrame(opts, text="Mode de traitement"); modes.pack(side=tk.LEFT, padx=6, pady=6)
        ttk.Radiobutton(modes, text="Carré 1200 — compléter en transparent (pas d’upscale)", value="pad",
                        variable=self.mode_var, command=self.update_preview).grid(row=0, column=0, sticky="w", padx=8, pady=4)
        ttk.Radiobutton(modes, text="Carré 1200 — recadrer (petit côté → 1200, centrer & couper)", value="crop",
                        variable=self.mode_var, command=self.update_preview).grid(row=1, column=0, sticky="w", padx=8, pady=4)
        ttk.Radiobutton(modes, text="Ne pas modifier (aucune altération)", value="skip",
                        variable=self.mode_var, command=self.update_preview).grid(row=2, column=0, sticky="w", padx=8, pady=4)

        extra = ttk.LabelFrame(opts, text="Options"); extra.pack(side=tk.LEFT, padx=6, pady=6)
        ttk.Checkbutton(extra, text="Convertir JPG → PNG si transparence requise",
                        variable=self.convert_jpg_to_png_var, command=self.update_preview).grid(row=0, column=0, sticky="w", padx=8, pady=4)
        ttk.Checkbutton(extra, text="Toujours produire un PNG (même sans redimensionnement)",
                        variable=self.force_png_var, command=self.update_preview).grid(row=1, column=0, sticky="w", padx=8, pady=4)
        ttk.Checkbutton(extra, text="Générer un fichier SVG (image embarquée)",
                        variable=self.create_svg_var).grid(row=2, column=0, sticky="w", padx=8, pady=4)
        ttk.Checkbutton(extra, text="Appliquer ce choix à toutes les images restantes",
                        variable=self.apply_to_all_var).grid(row=3, column=0, sticky="w", padx=8, pady=4)

        # Sélecteur dossier export (facultatif)
        outwrap = ttk.Frame(self); outwrap.pack(fill=tk.X, padx=12, pady=(0,8))
        ttk.Label(outwrap, text="Export vers :").pack(side=tk.LEFT)
        self.outdir_lbl = ttk.Label(outwrap, text=f"./{EXPORT_ROOT_NAME}"); self.outdir_lbl.pack(side=tk.LEFT, padx=6)
        ttk.Button(outwrap, text="Changer...", command=self.choose_outdir).pack(side=tk.LEFT)

        # Barre d’action
        bar = ttk.Frame(self); bar.pack(fill=tk.X, padx=12, pady=8)
        ttk.Button(bar, text="⟵ Précédente", command=self.prev_item).pack(side=tk.LEFT)
        ttk.Button(bar, text="Suivante ⟶", command=self.next_item).pack(side=tk.LEFT, padx=6)
        ttk.Button(bar, text="Appliquer à cette image", command=self.apply_one).pack(side=tk.RIGHT)
        ttk.Button(bar, text="Appliquer & Suivante", command=lambda: (self.apply_one(), self.next_item())).pack(side=tk.RIGHT, padx=6)

        # Journal
        self.log = tk.Text(self, height=8, bg="#0f172a", fg="#e5e7eb"); self.log.pack(fill=tk.BOTH, padx=12, pady=(0,12))

    # ----------- Fichiers -----------
    def choose_dir(self):
        d = filedialog.askdirectory(title="Choisir le dossier source")
        if not d: return
        self.root_dir = Path(d)
        self.export_root = self.root_dir / EXPORT_ROOT_NAME
        self.dir_lbl.config(text=str(self.root_dir))
        self.outdir_lbl.config(text=str(self.export_root))
        self.scan_images()
        if not self.items:
            messagebox.showinfo("Aucune image", "Aucun PNG/JPG trouvé.")
            return
        self.idx = 0
        self.load_current()

    def choose_outdir(self):
        if not self.root_dir:
            messagebox.showinfo("Information", "Choisis d’abord un dossier source.")
            return
        d = filedialog.askdirectory(title="Choisir le dossier d’export", initialdir=str(self.root_dir))
        if not d: return
        self.export_root = Path(d)
        self.outdir_lbl.config(text=str(self.export_root))

    def scan_images(self):
        self.items.clear()
        if not self.root_dir: return
        for root, _, files in os.walk(self.root_dir):
            for fn in files:
                ext = Path(fn).suffix.lower()
                if ext in VALID_EXT:
                    p = Path(root) / fn
                    rel = p.relative_to(self.root_dir)
                    self.items.append(ImgItem(src_path=p, rel_path=rel, ext=ext))
        self.items.sort(key=lambda x: str(x.rel_path).lower())
        self.counter_lbl.config(text=f"0 / {len(self.items)}")

    # ----------- Navigation / affichage -----------
    def prev_item(self):
        if not self.items: return
        self.idx = max(0, self.idx - 1)
        self.load_current()

    def next_item(self):
        if not self.items: return
        self.idx = min(len(self.items) - 1, self.idx + 1)
        self.load_current()

    def load_current(self):
        if not (0 <= self.idx < len(self.items)): return
        it = self.items[self.idx]
        self.counter_lbl.config(text=f"{self.idx+1} / {len(self.items)} — {it.rel_path}")

        img = Image.open(it.src_path)
        try:
            img = ImageOps.exif_transpose(img)  # corrige l’orientation EXIF (retourne une nouvelle image)
        except Exception:
            pass
        self.current_img = img
        self.show_on(self.orig_canvas, img)
        self.update_preview()

    def update_preview(self):
        if self.current_img is None: return
        prev = self.make_preview(self.current_img.copy(), self.mode_var.get())
        self.current_preview = prev
        self.show_on(self.prev_canvas, prev)

    def show_on(self, widget, pil_img: Image.Image):
        w, h = pil_img.size
        max_side = self.preview_size
        scale = min(max_side / w, max_side / h, 1.0)
        disp = pil_img.resize((max(1, int(w*scale)), max(1, int(h*scale))), Image.LANCZOS)
        tkimg = ImageTk.PhotoImage(disp.convert("RGBA"))
        widget.configure(image=tkimg)
        widget.image = tkimg

    # ----------- Préparations visuelles -----------
    def make_preview(self, img: Image.Image, mode: str) -> Image.Image:
        if mode == "skip":
            return img
        return self._pad_square(img) if mode == "pad" else self._crop_square(img)

    def _pad_square(self, img: Image.Image) -> Image.Image:
        w, h = img.size
        long_side = max(w, h)
        if long_side > TARGET:
            scale = TARGET / long_side
            img = img.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        canvas = Image.new("RGBA", (TARGET, TARGET), (0,0,0,0))
        cx = (TARGET - img.width) // 2
        cy = (TARGET - img.height) // 2
        canvas.paste(img, (cx, cy), img)
        return canvas

    def _crop_square(self, img: Image.Image) -> Image.Image:
        w, h = img.size
        short_side = min(w, h)
        scale = TARGET / short_side
        img = img.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
        x = (img.width - TARGET) // 2
        y = (img.height - TARGET) // 2
        return img.crop((x, y, x + TARGET, y + TARGET))

    # ----------- Sauvegardes -----------
    def apply_one(self):
        if not (0 <= self.idx < len(self.items)): return
        it = self.items[self.idx]
        mode = self.mode_var.get()

        if mode == "skip":
            self.log_write(f"[SKIP] {it.rel_path}")
            return

        img = self.make_preview(self.current_img.copy(), mode)

        # Dossiers
        assert self.root_dir is not None
        export_root = self.export_root or (self.root_dir / EXPORT_ROOT_NAME)
        backup_dir = self.root_dir / "image-old"

        # 1) Sauvegarde de l’original (copie)
        backup_path = backup_dir / it.rel_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        if it.src_path.exists() and not backup_path.exists():
            shutil.copy2(it.src_path, backup_path)

        # 2) Détermination extension et dossier de sortie
        out_ext = self.decide_output_ext(it.ext, mode, img.mode)
        subfolder = "png" if out_ext == ".png" else ("jpg" if out_ext in {".jpg", ".jpeg"} else "other")
        out_dir = export_root / subfolder / it.rel_path.parent
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / (it.src_path.stem + out_ext)

        # 3) Paramètres d’encodage
        save_kwargs = {}
        if out_ext == ".png":
            # PNG: sans perte, optimize + niveau de compression élevé
            save_kwargs = dict(format="PNG", optimize=True, compress_level=9)
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA")  # PNG 24/32 bits propres
        else:
            # JPEG: qualité visuelle élevée
            if img.mode == "RGBA":
                img = img.convert("RGB")
            save_kwargs = dict(format="JPEG", quality=95, subsampling=0, optimize=True)

        # 4) Écriture
        try:
            img.save(out_path, **save_kwargs)
        except OSError as e:
            messagebox.showerror("Erreur enregistrement", f"Impossible d’enregistrer {out_path} : {e}")
            return

        # 5) SVG (toujours dans export/svg/…)
        if self.create_svg_var.get():
            try:
                self.write_svg_for_image(export_root, it.rel_path, img)
            except Exception as e:
                self.log_write(f"[WARN] SVG non créé pour {it.rel_path}: {e}")

        self.log_write(f"[OK] {it.rel_path} → {out_path.relative_to(export_root)}  ({mode})")

        # 6) Appliquer à toutes ?
        if self.apply_to_all_var.get():
            for j in range(self.idx+1, len(self.items)):
                self.idx = j
                self.load_current()
                self.apply_one()
            messagebox.showinfo("Terminé", "Traitement terminé sur toutes les images restantes.")

    def decide_output_ext(self, src_ext: str, mode: str, current_mode: str) -> str:
        src_ext = src_ext.lower()
        if self.force_png_var.get():
            return ".png"
        if mode == "pad":
            # canevas transparent → PNG. Si l’utilisateur a décoché la conversion JPG→PNG,
            # on pourrait forcer un fond, mais la demande: canvas transparent → PNG.
            return ".png"
        # mode crop : conserver l’extension d’origine (sauf force_png)
        if src_ext in {".jpg", ".jpeg"}:
            return ".jpg"
        return ".png"

    def write_svg_for_image(self, export_root: Path, rel_path: Path, pil_img: Image.Image):
        """Crée un SVG 1200x1200 qui EMBARQUE l’image (data URI) dans export/svg/..."""
        svg_dir = export_root / "svg" / rel_path.parent
        svg_dir.mkdir(parents=True, exist_ok=True)
        buf = io.BytesIO()
        # encoder en PNG pour l’embed (alpha OK, universel)
        pil_img.save(buf, format="PNG", optimize=True, compress_level=9)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        data_uri = f"data:image/png;base64,{b64}"
        svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{TARGET}" height="{TARGET}" viewBox="0 0 {TARGET} {TARGET}">
  <image href="{data_uri}" x="0" y="0" width="{TARGET}" height="{TARGET}" />
</svg>'''
        svg_path = svg_dir / (rel_path.stem + ".svg")
        svg_path.write_text(svg, encoding="utf-8")

    def log_write(self, s: str):
        self.log.insert("end", s + "\n")
        self.log.see("end")


if __name__ == "__main__":
    Image.MAX_IMAGE_PIXELS = None
    app = App()
    app.mainloop()
