import re

# Lire le fichier
with open('E:/GitHub/GeeknDragon/Sondage/sondages/SONDAGE_ORIA_MVP_4_MODULES.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Identifier les lignes clés
module4_start = None
module4_admin_start = None  # Section 4.25 Sauvegarde
module5_start = None

for i, line in enumerate(lines):
    if line.strip() == "## MODULE 4 : ADMINISTRATION ET BIEN-ÊTRE":
        module4_start = i
    elif line.strip() == "### 4.25 Sauvegarde et Archivage":
        module4_admin_start = i
    elif line.strip().startswith("## MODULE 5"):
        module5_start = i
        break

print(f"Module 4 commence à la ligne {module4_start}")
print(f"Section Admin (4.25) commence à la ligne {module4_admin_start}")
print(f"Module 5 commence à la ligne {module5_start}")

# Séparer le contenu
before_module4 = lines[:module4_start]
module4_bienetre = lines[module4_start:module4_admin_start]
module4_admin = lines[module4_admin_start:module5_start]
after_module5 = lines[module5_start:]

# Renommer MODULE 4 en "BIEN-ÊTRE"
module4_bienetre[0] = "## MODULE 4 : BIEN-ÊTRE\n"

# Créer MODULE 5 ADMINISTRATION avec le contenu admin
module5_admin = ["## MODULE 5 : ADMINISTRATION\n", "\n"]
module5_admin.append("Ce module gère les fonctions administratives, la conformité légale, la paie et la gestion documentaire.\n\n")

# Renumuroter sections 4.25-4.29 en 5.1-5.5
for line in module4_admin:
    if line.startswith("### 4.2"):
        line = line.replace("### 4.25", "### 5.1").replace("### 4.26", "### 5.2").replace("### 4.27", "### 5.3").replace("### 4.28", "### 5.4").replace("### 4.29", "### 5.5")
    module5_admin.append(line)

# Renumuroter MODULE 5-12 en MODULE 6-13
new_after = []
for line in after_module5:
    line = re.sub(r'^## MODULE 5 :', '## MODULE 6 :', line)
    line = re.sub(r'^## MODULE 6 :', '## MODULE 7 :', line)
    line = re.sub(r'^## MODULE 7 :', '## MODULE 8 :', line)
    line = re.sub(r'^## MODULE 8 :', '## MODULE 9 :', line)
    line = re.sub(r'^## MODULE 9 :', '## MODULE 10 :', line)
    line = re.sub(r'^## MODULE 10 :', '## MODULE 11 :', line)
    line = re.sub(r'^## MODULE 11 :', '## MODULE 12 :', line)
    line = re.sub(r'^## MODULE 12 :', '## MODULE 13 :', line)
    new_after.append(line)

# Reconstruire le fichier
output = before_module4 + module4_bienetre + module5_admin + new_after

# Sauvegarder
with open('E:/GitHub/GeeknDragon/Sondage/sondages/SONDAGE_ORIA_MVP_4_MODULES_split.md', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("✓ Fichier séparé créé : SONDAGE_ORIA_MVP_4_MODULES_split.md")
