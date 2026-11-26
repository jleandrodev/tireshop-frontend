#!/usr/bin/env sh
# Os dois verificadores do handoff, em sequência. É o que o job "Specs" do CI roda.
#   docker compose --profile ferramentas run --rm handoff
set -eu
cd "$(dirname "$0")/../.."

python3 scripts/handoff/conferir_specs.py
python3 scripts/handoff/validar_contratos.py
