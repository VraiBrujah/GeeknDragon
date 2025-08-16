#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import csv

APP_TITLE = "EnchantDragon — Convertisseur de monnaie (GUI)"
PAD = 12

# ---- Palette (style boutique-premium) ----
COLORS = {
    "bg":        "#0f172a",
    "surface":   "#1e293b",
    "card":      "#334155",
    "elevated":  "#475569",
    "text":      "#f1f5f9",
    "muted":     "#94a3b8",
    "accentTxt": "#c7d2fe",
    "primary":   "#8b5cf6",
    "secondary": "#10b981",
    "accent":    "#f59e0b",
    "danger":    "#ef4444",
    "border":    "#2b3647",
    "input":     "#374151"
}

# ---- Taux (valeurs en cuivre) ----
RATES = {
    "Cuivre":   1,
    "Argent":   10,
    "Électrum": 50,
    "Or":       100,
    "Platine":  1000
}
CURRENCIES = list(RATES.keys())
MULTS = [1, 10, 100, 1000, 10000]        # pour le tableau
MULTS_DESC = [10000, 1000, 100, 10, 1]   # pour les équivalences (grand -> petit)

# Rang de noblesse (pour trier joliment)
METAL_RANK = {"Platine": 5, "Or": 4, "Électrum": 3, "Argent": 2, "Cuivre": 1}

def intfmt(n: int) -> str:
    return f"{n:,}".replace(",", " ")

def build_tokens(filter_coin=None):
    """ Liste des dénominations (métal × multiplicateur) triées pour la minimisation. """
    toks = []
    for coin, base in RATES.items():
        if filter_coin and coin != filter_coin:
            continue
        for m in MULTS:
            label = f"{coin} x{m}" if m != 1 else coin  # 'x' pour coller à l'exemple
            toks.append({
                "label": label,
                "coin": coin,
                "mult": m,
                "value_cp": base * m,
                "rank": METAL_RANK[coin],
            })
    toks.sort(key=lambda t: (t["value_cp"], t["rank"], t["mult"]), reverse=True)
    return toks

TOKENS_ALL  = build_tokens()      # 25 dénominations

# ---- helpers de libellés français ----
VOWELS = set("aeiouyâàäéèêëîïôöùûüœAEIOUYÂÀÄÉÈÊËÎÏÔÖÙÛÜŒ")

def article_de(coin: str) -> str:
    """ 'de <coin>' ou 'd’<coin>' selon la voyelle. """
    if coin and coin[0] in VOWELS:
        return "d’" + coin.lower()
    return "de " + coin.lower()

def piece_word(q: int) -> str:
    return "pièce" if q == 1 else "pièces"

def join_with_commas_and_et(parts):
    """ Joint une liste en français avec virgules et 'et' avant le dernier élément. """
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0]
    return ", ".join(parts[:-1]) + " et " + parts[-1]

def minimal_sentence_from_cp(total_cp: int, tokens):
    """
    Calcule la représentation minimale (glouton) en phrase.
    Retourne (phrase, items, remaining) où items = [(coin, mult, qty)]
    """
    remaining = total_cp
    items = []
    for tok in tokens:
        val = tok["value_cp"]
        q = remaining // val
        if q > 0:
            remaining -= q * val
            items.append((tok["coin"], tok["mult"], q))
        if remaining <= 0:
            break

    parts = []
    for coin, mult, q in items:
        # ex: "1 pièce d’or" OU "1 pièce de platine x1000"
        if mult == 1:
            parts.append(f"{intfmt(q)} {piece_word(q)} {article_de(coin)}")
        else:
            parts.append(f"{intfmt(q)} {piece_word(q)} {article_de(coin)} x{mult}")
    phrase = "Représentation minimale : " + (join_with_commas_and_et(parts) if parts else "—")
    return phrase, items, remaining


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("1100x800")
        self.minsize(900, 700)
        self.configure(bg=COLORS["bg"])

        # Thème ttk + styles
        self.style = ttk.Style(self)
        try:
            self.style.theme_use("clam")
        except Exception:
            pass
        self._setup_styles()

        # ----- Conteneur à défilement global -----
        self.outer = ttk.Frame(self, style="BG.TFrame")
        self.outer.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(self.outer, bg=COLORS["bg"], highlightthickness=0)
        self.vsb = ttk.Scrollbar(self.outer, orient="vertical", command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.vsb.set)
        self.vsb.pack(side="right", fill="y")
        self.canvas.pack(side="left", fill="both", expand=True)

        self.scroll_frame = ttk.Frame(self.canvas, style="BG.TFrame")
        self._canvas_window = self.canvas.create_window((0, 0), window=self.scroll_frame, anchor="n")

        self.scroll_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas.bind("<Configure>", lambda e: self.canvas.itemconfig(self._canvas_window, width=e.width))

        # Molette (Windows / Linux)
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        self.canvas.bind_all("<Button-4>", lambda e: self.canvas.yview_scroll(-3, "units"))
        self.canvas.bind_all("<Button-5>", lambda e: self.canvas.yview_scroll(3, "units"))

        # Centrage horizontal
        for c in (0, 2):
            self.scroll_frame.columnconfigure(c, weight=1)
        self.scroll_frame.columnconfigure(1, weight=0)
        self.center_inner = ttk.Frame(self.scroll_frame, style="BG.TFrame", padding=(24, 16, 24, 32))
        self.center_inner.grid(row=0, column=1, sticky="n")

        # En-tête
        self._build_header()

        # Entrées
        self.vars_inputs = {coin: tk.StringVar(value="0") for coin in CURRENCIES}
        self._build_inputs()

        # Résultats
        self._build_results()

        # Scheduler
        self._compute_after_id = None
        self._toggle_outputs(False)

    # ---------- Styles ----------
    def _setup_styles(self):
        s = self.style
        s.configure("BG.TFrame", background=COLORS["bg"])
        s.configure("Card.TFrame", background=COLORS["card"], borderwidth=1, relief="solid")
        s.configure("Card.TLabelframe", background=COLORS["card"])
        s.configure("Card.TLabelframe.Label", background=COLORS["card"], foreground=COLORS["accentTxt"], font=("Segoe UI", 12, "bold"))

        s.configure("H1.TLabel", background=COLORS["bg"], foreground=COLORS["text"], font=("Segoe UI", 18, "bold"))
        s.configure("H2.TLabel", background=COLORS["bg"], foreground=COLORS["muted"], font=("Segoe UI", 11))
        s.configure("CardH.TLabel", background=COLORS["card"], foreground=COLORS["accentTxt"], font=("Segoe UI", 11, "bold"))
        s.configure("TLabel", background=COLORS["card"], foreground=COLORS["text"])
        s.configure("Muted.TLabel", background=COLORS["card"], foreground=COLORS["muted"])
        s.configure("Accent.TLabel", background=COLORS["card"], foreground=COLORS["secondary"], font=("Segoe UI", 11, "bold"))
        s.configure("Center.TLabel", background=COLORS["card"], foreground=COLORS["text"], anchor="center", justify="center")

        s.configure("Action.TButton", background=COLORS["primary"], foreground="#ffffff", borderwidth=0, focusthickness=0, padding=(12,6))
        s.map("Action.TButton", background=[("active", COLORS["secondary"])])

        s.configure("Boutique.Treeview",
                    background=COLORS["card"],
                    fieldbackground=COLORS["card"],
                    foreground=COLORS["text"],
                    bordercolor=COLORS["border"],
                    rowheight=28)
        s.configure("Boutique.Treeview.Heading",
                    background=COLORS["elevated"],
                    foreground=COLORS["accentTxt"],
                    relief="flat",
                    padding=6)
        s.map("Boutique.Treeview.Heading",
              background=[("active", COLORS["primary"])])

    # ---------- UI ----------
    def _build_header(self):
        header = ttk.Frame(self.center_inner, style="BG.TFrame")
        header.pack(fill="x", pady=(10, 8))
        ttk.Label(header, text="EnchantDragon — Convertisseur de monnaie", style="H1.TLabel").pack()
        ttk.Label(header, text="Champs numériques uniquement. Calcul instantané, tableau condensé, équivalences par métal compactes et représentation minimale complète.",
                  style="H2.TLabel").pack()

    def _build_inputs(self):
        frm = ttk.LabelFrame(self.center_inner, text="Monnaie source", style="Card.TLabelframe")
        frm.pack(fill="x", padx=PAD, pady=(PAD, PAD//2))

        grid = ttk.Frame(frm, style="Card.TFrame")
        grid.pack(fill="x", padx=PAD, pady=PAD)
        grid.grid_columnconfigure(0, weight=1)
        grid.grid_columnconfigure(1, weight=1)

        ttk.Label(grid, text="Métal", style="CardH.TLabel").grid(row=0, column=0, sticky="ew", padx=(0, 8), pady=(0, 6))
        ttk.Label(grid, text="Nombre de pièces (entier ≥ 0)", style="CardH.TLabel").grid(row=0, column=1, sticky="ew", pady=(0, 6))

        self.inputs_widgets = {}
        r = 1
        for coin in CURRENCIES:
            ttk.Label(grid, text=coin, style="Center.TLabel").grid(row=r, column=0, sticky="ew", pady=4)

            var = self.vars_inputs[coin]
            sp = tk.Spinbox(
                grid,
                from_=0, to=10**12, increment=1,
                textvariable=var,
                width=18,
                justify="center",
                bg=COLORS["input"], fg=COLORS["text"],
                insertbackground=COLORS["text"],
                relief="flat", bd=0,
                highlightthickness=1, highlightbackground=COLORS["border"], highlightcolor=COLORS["primary"],
                readonlybackground=COLORS["input"],
                disabledbackground=COLORS["input"],
                disabledforeground=COLORS["muted"],
                selectbackground=COLORS["primary"], selectforeground="#ffffff",
                command=self._schedule_compute
            )
            sp.grid(row=r, column=1, sticky="ew", pady=4, padx=(6, 0))

            # Validation stricte : seulement chiffres (ou vide)
            vcmd = (self.register(self._validate_int), "%P")
            sp.config(validate="key", validatecommand=vcmd)

            # Effacer le champ quand on clique/focus (pour écrire direct)
            sp.bind("<FocusIn>",  lambda e, v=var: self._clear_on_focus(v))
            sp.bind("<Button-1>", lambda e, v=var: self._clear_on_focus(v))

            # Recalcul dynamique
            sp.bind("<KeyRelease>", lambda e: self._schedule_compute())
            sp.bind("<FocusOut>",  lambda e: self._schedule_compute())
            sp.bind("<ButtonRelease-1>", lambda e: self._schedule_compute())
            var.trace_add("write", lambda *_: self._schedule_compute())

            self.inputs_widgets[coin] = sp
            r += 1

        actions = ttk.Frame(frm, style="Card.TFrame")
        actions.pack(fill="x", padx=PAD, pady=(0, PAD))
        bar = ttk.Frame(actions, style="Card.TFrame")
        bar.pack(anchor="center")
        ttk.Button(bar, text="Exemple",     style="Action.TButton", command=self.fill_example).pack(side="left")
        ttk.Button(bar, text="Réinitialiser", style="Action.TButton", command=self.reset).pack(side="left", padx=(8,0))

    def _build_results(self):
        self.section_holder = ttk.Frame(self.center_inner, style="BG.TFrame")
        self.section_holder.pack(fill="both", expand=True, padx=PAD, pady=PAD)

        # A) Tableau (colonnes/lignes dynamiques)
        self.frm_table = ttk.LabelFrame(self.section_holder,
            text="A) Conversion du trésor total — métal × multiplicateur",
            style="Card.TLabelframe")
        self.frm_table.pack(fill="x", pady=(0, PAD))
        self._init_table_widget()

        # B) Équivalences totales par métal (une ligne par métal, très compact)
        self.frm_equiv = ttk.LabelFrame(self.section_holder,
            text="B) Équivalences totales par métal (décomposition x10 000 → x1, reste en phrase minimale)",
            style="Card.TLabelframe")
        self.frm_equiv.pack(fill="x", pady=(0, PAD))
        self.equiv_area = ttk.Frame(self.frm_equiv, style="Card.TFrame")
        self.equiv_area.pack(fill="x", padx=PAD, pady=PAD)

        # D) Représentation minimale — Complète (phrase)
        self.frm_full = ttk.LabelFrame(self.section_holder,
            text="C) Représentation minimale — Complète (toutes pièces et multiplicateurs)",
            style="Card.TLabelframe")
        self.frm_full.pack(fill="x", pady=(0, PAD))
        self.lbl_min_full = ttk.Label(self.frm_full, text="—", style="Center.TLabel", wraplength=900)
        self.lbl_min_full.pack(fill="x", padx=PAD, pady=PAD)

        # Utilitaires
        util = ttk.Frame(self.section_holder, style="BG.TFrame")
        util.pack(fill="x", pady=(0, PAD))
        bar = ttk.Frame(util, style="BG.TFrame")
        bar.pack(anchor="center")
        ttk.Button(bar, text="Exporter le tableau (CSV)", style="Action.TButton", command=self.export_csv).pack(side="left")
        ttk.Button(bar, text="Copier la représentation complète", style="Action.TButton", command=self.copy_full).pack(side="left", padx=(8, 0))

    # --- helpers UI ---
    def _init_table_widget(self):
        cols_all = ("met", "x1", "x10", "x100", "x1000", "x10000")
        self.tree = ttk.Treeview(self.frm_table, columns=cols_all, show="headings",
                                 style="Boutique.Treeview")
        self.tree.pack(fill="x", padx=PAD, pady=PAD)

        headers = {"met": "Métal", "x1": "x1", "x10": "x10", "x100":"x100", "x1000":"x1000", "x10000":"x10 000"}
        for cid in cols_all:
            self.tree.heading(cid, text=headers[cid], anchor="center")
            self.tree.column(cid, anchor="center", width=140)
        self.tree.column("met", anchor="center", width=200)

        self.tree.tag_configure("odd", background="#3b4760")
        self.tree.tag_configure("even", background=COLORS["card"])

    # ---------- Logic ----------
    def _on_mousewheel(self, event):
        delta = int(-1 * (event.delta / 120))
        self.canvas.yview_scroll(delta, "units")

    def _toggle_outputs(self, visible: bool):
        # plus de section "or uniquement" (C)
        for w in (self.frm_table, self.frm_equiv, self.frm_full):
            if visible:
                w.pack_configure(fill="x", pady=(0, PAD))
            else:
                w.pack_forget()

    def reset(self):
        for v in self.vars_inputs.values():
            v.set("0")
        self._toggle_outputs(False)

    def fill_example(self):
        ex = {"Cuivre":"1254", "Argent":"2154", "Électrum":"2541", "Or":"55", "Platine":"21"}
        for k,v in ex.items():
            self.vars_inputs[k].set(v)
        self._schedule_compute()

    # Efface le champ quand on clique/focus
    def _clear_on_focus(self, var: tk.StringVar):
        var.set("")  # vide pour taper direct

    def _validate_int(self, proposed: str) -> bool:
        # autorise vide (intermédiaire), sinon uniquement chiffres 0-9
        return proposed == "" or proposed.isdigit()

    def _schedule_compute(self):
        if self._compute_after_id is not None:
            self.after_cancel(self._compute_after_id)
        self._compute_after_id = self.after(120, self.compute)

    def _inputs_total_cp(self) -> int:
        total = 0
        for c in CURRENCIES:
            txt = self.vars_inputs[c].get().strip()
            if txt == "":
                continue
            if not txt.isdigit():
                continue
            total += int(txt) * RATES[c]
        return total

    # --- CALCUL PRINCIPAL ---
    def compute(self):
        total_cp = self._inputs_total_cp()
        if total_cp <= 0:
            self._toggle_outputs(False)
            return
        self._toggle_outputs(True)

        self._fill_conversion_table(total_cp)      # A
        self._fill_equivalences_per_coin_compact(total_cp) # B (compact)
        self._fill_min_full_sentence(total_cp)     # C (ex-D)

    # A) Tableau 5×5
    def _used_multipliers(self, total_cp):
        used = []
        for m in MULTS:
            if any((total_cp // (RATES[coin] * m)) > 0 for coin in CURRENCIES):
                used.append(m)
        return used

    def _fill_conversion_table(self, total_cp):
        self.tree.delete(*self.tree.get_children())
        used_mults = self._used_multipliers(total_cp)
        col_ids = ["met"] + [f"x{m}" for m in used_mults]
        self.tree["displaycolumns"] = col_ids

        row_i = 0
        for coin in CURRENCIES:
            row_vals = []
            has_val = False
            for m in used_mults:
                v = total_cp // (RATES[coin] * m)
                row_vals.append(v)
                if v > 0:
                    has_val = True
            if not has_val:
                continue
            shown_vals = [coin] + [intfmt(v) if v > 0 else "" for v in row_vals]
            tag = "odd" if (row_i % 2 == 0) else "even"
            self.tree.insert("", "end", values=shown_vals, tags=(tag,))
            row_i += 1

        self.tree.configure(height=max(1, row_i))

    # B) Équivalences par métal, version compacte (1 ligne / métal)
    def _fill_equivalences_per_coin_compact(self, total_cp):
        # Purge
        for child in self.equiv_area.winfo_children():
            child.destroy()

        # grille 2 colonnes : Métal | Résumé
        grid = ttk.Frame(self.equiv_area, style="Card.TFrame")
        grid.pack(fill="x")
        grid.grid_columnconfigure(0, weight=0)
        grid.grid_columnconfigure(1, weight=1)

        row = 0
        for coin in sorted(CURRENCIES, key=lambda c: METAL_RANK[c], reverse=True):
            base = RATES[coin]
            units = total_cp // base
            remainder_cp = total_cp % base

            parts = []
            rest_units = units
            for m in MULTS_DESC:
                q = rest_units // m
                rest_units -= q * m
                if q > 0:
                    # court et lisible : "2 pièces x1000", "5 pièces"
                    if m == 1:
                        parts.append(f"{intfmt(q)} {piece_word(q)}")
                    else:
                        parts.append(f"{intfmt(q)} {piece_word(q)} x{m}")

            summary = join_with_commas_and_et(parts) if parts else "Aucune pièce convertible"

            if remainder_cp > 0:
                phrase_reste, _, _ = minimal_sentence_from_cp(remainder_cp, TOKENS_ALL)
                phrase_reste = phrase_reste.replace("Représentation minimale : ", "")
                summary += " — Reste : " + phrase_reste

            ttk.Label(grid, text=coin, style="CardH.TLabel", anchor="center", justify="center").grid(row=row, column=0, padx=(0,8), pady=2, sticky="ew")
            ttk.Label(grid, text=summary, style="TLabel", anchor="w", justify="left", wraplength=900).grid(row=row, column=1, pady=2, sticky="ew")
            row += 1

    # C) Représentation minimale — Complète (phrase)
    def _fill_min_full_sentence(self, total_cp):
        phrase, _, _ = minimal_sentence_from_cp(total_cp, TOKENS_ALL)
        self.lbl_min_full.config(text=phrase)

    # ---------- Utilities ----------
    def export_csv(self):
        if not self.frm_table.winfo_manager():
            messagebox.showwarning("Rien à exporter", "Le tableau n'est pas affiché.")
            return
        path = filedialog.asksaveasfilename(
            title="Exporter le tableau (CSV)",
            defaultextension=".csv",
            filetypes=[("CSV","*.csv"), ("Tous les fichiers","*.*")]
        )
        if not path:
            return

        headers_map = {"met": "Métal", "x1": "x1", "x10":"x10", "x100":"x100", "x1000":"x1000", "x10000":"x10 000"}
        display_cols = self.tree["displaycolumns"]
        headers = [headers_map[c] for c in display_cols]

        rows = []
        for iid in self.tree.get_children():
            rows.append(self.tree.item(iid)["values"])

        try:
            with open(path, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f, delimiter=";")
                w.writerow(headers)
                for r in rows:
                    w.writerow([str(x) for x in r])
            messagebox.showinfo("Exporté", f"CSV enregistré : {path}")
        except Exception as e:
            messagebox.showerror("Erreur", f"Impossible d'enregistrer :\n{e}")

    def copy_full(self):
        txt = self.lbl_min_full.cget("text").strip()
        if not txt or txt == "—":
            return
        self.clipboard_clear()
        self.clipboard_append(txt)
        try:
            self.update()
        except Exception:
            pass
        messagebox.showinfo("Copié", "La représentation minimale complète a été copiée.")

def main():
    app = App()
    app.mainloop()

if __name__ == "__main__":
    main()
