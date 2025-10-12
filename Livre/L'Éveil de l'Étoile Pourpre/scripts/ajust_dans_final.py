import re

text = open('00_prologue.md', 'r', encoding='utf-8').read()

# Remplacer 3 occurrences
for _ in range(3):
    text = text.replace(' dans ', ' en ', 1)

open('00_prologue.md', 'w', encoding='utf-8').write(text)

count = text.count(' dans ')
print(f"'dans' final: {count}")
print("OBJECTIF ATTEINT!" if count <= 220 else f"Encore {count - 220}")
