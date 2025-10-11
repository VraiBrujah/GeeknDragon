# -*- coding: utf-8 -*-
"""Script pour ajouter les symboles de dialogue aux fichiers de personnages"""

# FICHES_REFERENCE_CANON.md
with open('Livre/FICHES_REFERENCE_CANON.md', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ('### **Maître Brujah** (vampire millénaire)\n\n**Description physique**',
     '### **Maître Brujah** (vampire millénaire)\n\n**Symbole dialogue** : † (croix - vampire, éternité, solennité)\n\n**Description physique**'),

    ('### **Maîtresse Drakkarys** (dragonne en forme humaine)\n\n**Description physique**',
     '### **Maîtresse Drakkarys** (dragonne en forme humaine)\n\n**Symbole dialogue** : ✦ (étoile à 4 branches - noblesse draconique, feu)\n\n**Description physique**'),

    ('### **violette** (Rosalya - héroïne, évolution vers esclavage volontaire)\n\n**Description physique**',
     '### **violette** (Rosalya - héroïne, évolution vers esclavage volontaire)\n\n**Symbole dialogue** : ✧ (petite étoile - jeunesse, pouvoir naissant, l\'Étoile Pourpre)\n\n**Description physique**'),

    ('### **saatha** (gorgone millénaire, arc de rédemption)\n\n**Description physique**',
     '### **saatha** (gorgone millénaire, arc de rédemption)\n\n**Symbole dialogue** : ◈ (losange ornemental - sagesse millénaire, serpents)\n\n**Description physique**'),

    ('### **Morwen** (antagoniste principale, sœur aînée de Brujah)\n\n**Description physique**',
     '### **Morwen** (antagoniste principale, sœur aînée de Brujah)\n\n**Symbole dialogue** : ❖ (losange pointu - danger, beauté venimeuse)\n\n**Description physique**'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('Livre/FICHES_REFERENCE_CANON.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ FICHES_REFERENCE_CANON.md mis à jour')

# personnages.md
with open('Livre/personnages.md', 'r', encoding='utf-8') as f:
    content = f.read()

replacements2 = [
    ('## Brujah\n\n### **Identité et apparence**',
     '## Brujah\n\n**Symbole dialogue** : † (croix - vampire, éternité, solennité)\n\n### **Identité et apparence**'),

    ('## Drakkarys\n\n### **Identité et apparence**',
     '## Drakkarys\n\n**Symbole dialogue** : ✦ (étoile à 4 branches - noblesse draconique, feu)\n\n### **Identité et apparence**'),

    ('## Violet / violette (après asservissement)\n\n### **Identité et apparence**',
     '## Violet / violette (après asservissement)\n\n**Symbole dialogue** : ✧ (petite étoile - jeunesse, pouvoir naissant, l\'Étoile Pourpre)\n\n### **Identité et apparence**'),

    ('## Saatha (la Gorgone)\n\n### **Identité et apparence**',
     '## Saatha (la Gorgone)\n\n**Symbole dialogue** : ◈ (losange ornemental - sagesse millénaire, serpents)\n\n### **Identité et apparence**'),

    ('## Morwen (Antagoniste principal)\n\n### **Identité et apparence**',
     '## Morwen (Antagoniste principal)\n\n**Symbole dialogue** : ❖ (losange pointu - danger, beauté venimeuse)\n\n### **Identité et apparence**'),
]

for old, new in replacements2:
    content = content.replace(old, new)

with open('Livre/personnages.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ personnages.md mis à jour')
