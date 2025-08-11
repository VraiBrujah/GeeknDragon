# -*- coding: utf-8 -*-
import os, io, sys, base64, threading, queue, shutil
from pathlib import Path
from PIL import Image, ImageOps
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext, messagebox

# ---- Constantes
TARGET = 1200  # dimension du carré final
IMG_EXTS = {".png", ".jpg", ".jpeg"}

# ---- Traitement d'une image
def process_one(src_path: Path, backup_root: Path, convert_jpg_to_png: bool, log):
    try:
        rel = src_path.relative_to(start_root)
        backup_path = backup_root / rel
        backup_path.parent.mkdir(parents=True, exist_ok=True)

        # Sauvegarde de l'original
        if not backup_path.exists():
            shutil.copy2(src_path, backup_path)

        # Ouverture + correction orientation EXIF
        im = Image.open(src_path)
        im = ImageOps.exif_transpose(im)  # corrige l'orientation si tag EXIF

        # On travaille en RGBA pour gérer la transparence
        has_alpha = im.mode in ("LA", "RGBA") or ("transparency" in im.info)
        im_rgba = im.convert("RGBA")

        w, h = im_rgba.size
        longest = max(w, h)

        # Échelle: on réduit uniquement si > TARGET (jamais d'upscale)
        if longest > TARGET:
            scale = TARGET / float(longest)
            new_w = max(1, int(round(w * scale)))
            new_h = max(1, int(round(h * scale)))
            im_rgba = im_rgba.resize((new_w, new_h), Image.LANCZOS)
            w, h = im_rgba.size

        # Canevas 1200x1200 transparent + centrage
        canvas = Image.new("RGBA", (TARGET, TARGET), (0, 0, 0, 0))
        off_x = (TARGET - w) // 2
        off_y = (TARGET - h) // 2
        canvas.paste(im_rgba, (off_x, off_y), im_rgba)

        # Détermination du format de sortie
        ext = src_path.suffix.lower()
        needs_transparency = (w != TARGET or h != TARGET) or has_alpha

        out_path = src_path
        out_format = None

        # Si JPG et transparence requise -> convertir en PNG si option cochée
        if ext in {".jpg", ".jpeg"} and needs_transparency and convert_jpg_to_png:
            out_path = src_path.with_suffix(".png")
            out_format = "PNG"

        # Sauvegarde optimisée selon format
        if out_path.suffix.lower() == ".png" or out_format == "PNG":
            # PNG: compression sans perte (optimize=True -> compress_level=9)
            canvas.save(out_path, format="PNG", optimize=True)
        else:
            # JPEG: haute qualité, pas de sous-échantillonnage chroma
            # (note: JPEG est intrinsèquement avec pertes)
            bg = Image.new("RGB", canvas.size, (0, 0, 0))
            bg.paste(canvas, mask=canvas.split()[-1])  # fond noir sous alpha
            bg.save(
                out_path,
                format="JPEG",
                quality=95,
                subsampling=0,
                optimize=True,
                progressive=True,
            )

        # Si on a changé d'extension (jpg -> png), on supprime l'ancien fichier
        if out_path != src_path and src_path.exists():
            src_path.unlink()

        # Génère un SVG « wrapper » 1200x1200 avec l’image centrée
        make_svg_wrapper(out_path, (TARGET, TARGET), (off_x, off_y), (w, h))

        log(f"OK  : {rel}")
    except Exception as e:
        log(f"ERR : {src_path} -> {e}")

def make_svg_wrapper(image_path: Path, canvas_size, offset, size):
    """Crée un SVG 1200x1200 qui embarque l'image (base64) centrée."""
    W, H = canvas_size
    x, y = offset
    w, h = size

    mime = "image/png" if image_path.suffix.lower()==".png" else "image/jpeg"
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="100%" height="100%" fill="none"/>
  <image x="{x}" y="{y}" width="{w}" height="{h}" href="data:{mime};base64,{b64}" />
</svg>'''
    svg_path = image_path.with_suffix(".svg")
    svg_path.write_text(svg, encoding="utf-8")

# ---- Parcours récursif
def iter_images(root: Path):
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in IMG_EXTS:
            yield p

# ---- UI
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Carré 1200×1200 - Traitement d'images")
        self.geometry("760x540")
        self.resizable(True, True)

        self.dir_var = tk.StringVar()
        self.opt_convert_png = tk.BooleanVar(value=True)

        frm = ttk.Frame(self, padding=10)
        frm.pack(fill="both", expand=True)

        row1 = ttk.Frame(frm)
        row1.pack(fill="x", pady=4)
        ttk.Label(row1, text="Dossier source :").pack(side="left")
        ttk.Entry(row1, textvariable=self.dir_var).pack(side="left", fill="x", expand=True, padx=6)
        ttk.Button(row1, text="Parcourir…", command=self.pick_dir).pack(side="left")

        row2 = ttk.Frame(frm)
        row2.pack(fill="x", pady=4)
        ttk.Checkbutton(
            row2,
            text="Convertir les JPEG en PNG si transparence requise (recommandé)",
            variable=self.opt_convert_png
        ).pack(side="left")

        row3 = ttk.Frame(frm)
        row3.pack(fill="x", pady=8)
        self.start_btn = ttk.Button(row3, text="Lancer le traitement", command=self.run)
        self.start_btn.pack(side="left")
        self.progress = ttk.Progressbar(row3, length=300, mode="determinate")
        self.progress.pack(side="left", padx=10)

        ttk.Label(frm, text="Journal :", anchor="w").pack(fill="x")
        self.logw = scrolledtext.ScrolledText(frm, height=18)
        self.logw.pack(fill="both", expand=True)

        self.queue = queue.Queue()
        self.after(100, self._poll_queue)

    def pick_dir(self):
        d = filedialog.askdirectory(title="Choisir le dossier source")
        if d:
            self.dir_var.set(d)

    def run(self):
        global start_root
        d = self.dir_var.get().strip()
        if not d:
            messagebox.showwarning("Info", "Choisissez un dossier source.")
            return
        start_root = Path(d)
        if not start_root.exists():
            messagebox.showerror("Erreur", "Dossier introuvable.")
            return

        self.start_btn.config(state="disabled")
        self.progress["value"] = 0
        self.logw.delete("1.0", "end")

        t = threading.Thread(
            target=self._worker,
            args=(start_root, self.opt_convert_png.get()),
            daemon=True
        )
        t.start()

    def _worker(self, root: Path, convert_png: bool):
        try:
            imgs = list(iter_images(root))
            total = len(imgs)
            if total == 0:
                self.queue.put(("log", "Aucune image PNG/JPG trouvée."))
                self.queue.put(("done",))
                return

            self.queue.put(("max", total))
            backup_root = root / "image-old"
            for i, p in enumerate(imgs, 1):
                process_one(p, backup_root, convert_png, lambda s: self.queue.put(("log", s)))
                self.queue.put(("step", i))
        finally:
            self.queue.put(("done",))

    def _poll_queue(self):
        try:
            while True:
                item = self.queue.get_nowait()
                if item[0] == "log":
                    self.logw.insert("end", item[1] + "\n")
                    self.logw.see("end")
                elif item[0] == "max":
                    self.progress["maximum"] = item[1]
                elif item[0] == "step":
                    self.progress["value"] = item[1]
                elif item[0] == "done":
                    self.start_btn.config(state="normal")
        except queue.Empty:
            pass
        self.after(100, self._poll_queue)

if __name__ == "__main__":
    # Astuce : certains PNG/JPEG très anciens peuvent poser souci si plugins manquent.
    app = App()
    app.mainloop()
