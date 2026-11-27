#!/usr/bin/env sh
# O verificador de specs que ainda não foi portado. É o que o job "Specs" do CI roda.
#   docker compose --profile ferramentas run --rm handoff
#
# O contrato (validar_contratos.py) foi portado para tests/contract/openapi.spec.ts na T-0009 e
# passou a rodar no job Testes, contra mocks/fixtures (a cópia que o servidor de mocks serve), não
# mais contra docs/api/examples. O arquivo Python continua em scripts/handoff/validar_contratos.py,
# sem uso no CI; apagar é decisão do dev.
set -eu
cd "$(dirname "$0")/../.."

python3 scripts/handoff/conferir_specs.py
