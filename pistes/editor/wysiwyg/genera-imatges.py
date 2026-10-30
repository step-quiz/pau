#!/usr/bin/env python3
"""Fa img/<id>-e.png i img/<id>-s.png (enunciat i solució oficials) per a l'artifact WYSIWYG.
Ús: python3 pistes/editor/wysiwyg/genera-imatges.py pistes/editor/genera-enunciats.py data <sortida>/img"""
import sys, glob, os, importlib.util
spec = importlib.util.spec_from_file_location('ge', sys.argv[1]); ge = importlib.util.module_from_spec(spec); spec.loader.exec_module(ge)
data, out = sys.argv[2], sys.argv[3]
n = 0; tot = 0
for pdf in sorted(glob.glob(os.path.join(data, '*-[es].pdf'))):
    nom = os.path.basename(pdf)[:-4]
    f = os.path.join(out, nom + '.png'); ge.enunciat(pdf).save(f, optimize=True); n += 1; tot += os.path.getsize(f)
print(n, 'imatges', round(tot/1e6, 1), 'MB')
