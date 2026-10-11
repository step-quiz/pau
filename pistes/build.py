#!/usr/bin/env python3
"""Compila les pistes LaTeX (pistes/src/<id>.tex) i genera data/<id>-p.pdf.

Ús:
  python3 pistes/build.py                      # compila totes les pistes
  python3 pistes/build.py geo-25j-q4b ...      # compila només aquestes
  python3 pistes/build.py --png DIR geo-...    # a més, desa una imatge PNG de cada pista a DIR
  python3 pistes/build.py --zip FITXER.zip ... # crea un ZIP per a Overleaf (pista.sty + .tex)

Requereix pdflatex (TeX Live amb babel-catalan, mdframed, titlesec, fancyhdr, eurosym i cm-super).
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ARREL, 'pistes', 'src')
DATA = os.path.join(ARREL, 'data')

# Data fixa a les metadades del PDF: si la font no canvia, el PDF surt idèntic byte a byte
# i git no hi veu cap canvi.
ENTORN = dict(os.environ, SOURCE_DATE_EPOCH='1767225600', FORCE_SOURCE_DATE='1')


def ids_disponibles():
    return sorted(f[:-4] for f in os.listdir(SRC) if f.endswith('.tex'))


def compila(id_, png_dir=None):
    """Compila una pista. Retorna (ok, missatge)."""
    with tempfile.TemporaryDirectory() as tmp:
        r = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', '-halt-on-error', '-output-directory', tmp, f'{id_}.tex'],
            cwd=SRC, env=ENTORN, capture_output=True, text=True, errors='replace')
        log = open(os.path.join(tmp, f'{id_}.log'), encoding='latin-1').read()
        pdf = os.path.join(tmp, f'{id_}.pdf')
        if r.returncode != 0 or not os.path.exists(pdf):
            errors = [l for l in log.splitlines() if l.startswith('!')][:3]
            return False, 'ERROR: ' + ' | '.join(errors or ['pdflatex ha fallat'])
        avisos = []
        info = subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout
        pagines = int(re.search(r'^Pages:\s+(\d+)', info, re.M).group(1))
        if pagines != 1:
            avisos.append(f'{pagines} pàgines')
        for m in re.finditer(r'Overfull \\hbox \((\d+\.\d+)pt too wide\)', log):
            if float(m.group(1)) > 1:
                avisos.append(f'línia massa llarga ({m.group(1)}pt)')
        shutil.copyfile(pdf, os.path.join(DATA, f'{id_}-p.pdf'))
        if png_dir:
            os.makedirs(png_dir, exist_ok=True)
            subprocess.run(['pdftoppm', '-r', '110', '-png', '-singlefile', pdf,
                            os.path.join(png_dir, id_)], check=True)
        return True, ('OK' + (' (avís: ' + '; '.join(avisos) + ')' if avisos else ''))


def fes_zip(ids, desti):
    with zipfile.ZipFile(desti, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(SRC, 'pista.sty'), 'pista.sty')
        for id_ in ids:
            z.write(os.path.join(SRC, f'{id_}.tex'), f'{id_}.tex')
    print(f'ZIP per a Overleaf: {desti} ({len(ids)} pistes + pista.sty)')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('ids', nargs='*', help='identificadors (per defecte, tots)')
    ap.add_argument('--png', metavar='DIR', help='desa una previsualització PNG de cada pista')
    ap.add_argument('--zip', metavar='FITXER', help='crea un ZIP per a Overleaf en lloc de compilar')
    args = ap.parse_args()

    tots = ids_disponibles()
    ids = args.ids or tots
    desconeguts = [i for i in ids if i not in tots]
    if desconeguts:
        sys.exit('Identificadors desconeguts: ' + ', '.join(desconeguts))

    if args.zip:
        fes_zip(ids, args.zip)
        return

    errors = 0
    for id_ in ids:
        ok, msg = compila(id_, args.png)
        errors += not ok
        print(f'{id_:16s} {msg}')
    print(f'\n{len(ids) - errors} compilades, {errors} amb errors.')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
