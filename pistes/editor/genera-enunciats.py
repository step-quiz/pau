#!/usr/bin/env python3
"""Genera les imatges de l'enunciat oficial que mostra l'editor de pistes.

Per a cada data/<id>-e.pdf (retall oficial de l'enunciat) fa un PNG compacte:
100 ppp en grisos, sense marges blancs, amb les franges blanques llargues
(espai per respondre) reduïdes a 24 px, i les pàgines una sota l'altra.

Ús (des de l'arrel del repositori):
  python3 pistes/editor/genera-enunciats.py data enunciats
  # → «67 enunciats, 1,4 MB → enunciats/»

Requereix pdftoppm (poppler-utils), Pillow i NumPy.
La carpeta de sortida és només per publicar l'artifact: no la pugis al repositori.
"""
import glob
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

BLANC = 200      # un píxel més fosc que això és «tinta»
FRANJA = 24      # alçada màxima d'una franja blanca, en píxels


def enunciat(pdf):
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdftoppm', '-r', '100', '-gray', '-png', pdf, os.path.join(tmp, 'p')], check=True)
        trossos = []
        for f in sorted(glob.glob(os.path.join(tmp, 'p-*.png'))):
            a = np.array(Image.open(f).convert('L'))
            files, cols = (a < BLANC).any(1), (a < BLANC).any(0)
            if not files.any():
                continue
            a = a[:, cols.argmax(): len(cols) - cols[::-1].argmax()]
            queden, blanques = [], 0
            for r in range(a.shape[0]):
                if (a[r] < BLANC).any():
                    blanques = 0
                    queden.append(r)
                else:
                    blanques += 1
                    if blanques <= FRANJA:
                        queden.append(r)
            trossos.append(a[queden])
    amplada = max(t.shape[1] for t in trossos)
    llenç = np.full((sum(t.shape[0] for t in trossos), amplada), 255, np.uint8)
    y = 0
    for t in trossos:
        llenç[y:y + t.shape[0], :t.shape[1]] = t
        y += t.shape[0]
    return Image.fromarray(llenç).quantize(16)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    entrada, sortida = sys.argv[1:3]
    os.makedirs(sortida, exist_ok=True)
    pdfs = sorted(glob.glob(os.path.join(entrada, '*-e.pdf')))
    total = 0
    for pdf in pdfs:
        desti = os.path.join(sortida, os.path.basename(pdf)[:-6] + '.png')
        enunciat(pdf).save(desti, optimize=True)
        total += os.path.getsize(desti)
    print(f'{len(pdfs)} enunciats, {total / 1e6:.1f} MB → {sortida}/'.replace('.', ',', 1))


if __name__ == '__main__':
    main()
