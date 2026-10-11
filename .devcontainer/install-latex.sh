#!/bin/bash
# Instal·la TeX Live i les eines que fa servir pistes/build.py.
# El fan servir Codespaces (.devcontainer), la GitHub Action (.github/workflows)
# i les sessions de Claude Code al núvol (.claude/hooks). Es pot executar
# tantes vegades com calgui: si ja està tot instal·lat, no fa res.
set -euo pipefail

if command -v pdflatex >/dev/null 2>&1 \
   && kpsewhich catalan.ldf mdframed.sty titlesec.sty fancyhdr.sty eurosym.sty sfrm1095.pfb >/dev/null 2>&1 \
   && command -v pdftoppm >/dev/null 2>&1 && command -v qpdf >/dev/null 2>&1 \
   && command -v python3 >/dev/null 2>&1; then
  echo "TeX Live ja és disponible."
  exit 0
fi

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

$SUDO env DEBIAN_FRONTEND=noninteractive apt-get update -qq
$SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
  texlive-latex-base texlive-latex-recommended texlive-latex-extra \
  texlive-lang-european texlive-lang-spanish texlive-fonts-recommended \
  cm-super latexmk qpdf poppler-utils python3 > /dev/null

echo "TeX Live instal·lat: $(pdflatex --version | head -1)"
