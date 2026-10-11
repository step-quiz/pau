#!/bin/bash
# Instal·la TeX Live a les sessions de Claude Code al núvol perquè
# pistes/build.py pugui compilar les pistes (pistes/src/*.tex -> data/*-p.pdf).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

bash "$CLAUDE_PROJECT_DIR/.devcontainer/install-latex.sh"
