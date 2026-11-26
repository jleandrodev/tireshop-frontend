#!/usr/bin/env sh
# Teste de fumaça do ambiente em contêiner (T-0000, REQ-00-11).
# Roda na máquina, só com Docker. Sai com código diferente de zero na primeira falha.
#   sh scripts/conferir-ambiente.sh
#   SO_IMAGEM=1 sh scripts/conferir-ambiente.sh   confere a imagem já construída (é o que o CI faz)
set -eu
cd "$(dirname "$0")/.."

DEV_UID="${DEV_UID:-$(id -u)}"
DEV_GID="${DEV_GID:-$(id -g)}"
NODE_VERSION="$(tr -d 'v[:space:]' < .nvmrc)"
export DEV_UID DEV_GID NODE_VERSION

no_app() { docker compose run --rm -T app "$@"; }
passo() { printf '\n== %s\n' "$1"; }

passo "o Dockerfile e o compose.yaml usam o Node do .nvmrc ($NODE_VERSION)"
no_dockerfile="$(sed -n 's/^ARG NODE_VERSION=//p' Dockerfile)"
[ "$no_dockerfile" = "$NODE_VERSION" ] || { echo "Dockerfile diz $no_dockerfile, .nvmrc diz $NODE_VERSION"; exit 1; }
grep -q "NODE_VERSION: \${NODE_VERSION:-$NODE_VERSION}" compose.yaml || { echo "o padrão de NODE_VERSION no compose.yaml não é $NODE_VERSION"; exit 1; }
echo "ok"

if [ -z "${SO_IMAGEM:-}" ]; then
  passo "a imagem de desenvolvimento constrói"
  docker compose build app
fi

passo "o Node do contêiner é o do .nvmrc"
veio_node="$(no_app node -p 'process.versions.node' | tr -d '\r')"
case "$veio_node" in
  "$NODE_VERSION" | "$NODE_VERSION".*) echo "v$veio_node" ;;
  *) echo "esperado Node $NODE_VERSION, veio $veio_node"; exit 1 ;;
esac

passo "pnpm na versão fixada no Dockerfile"
esperado="$(sed -n 's/^ARG PNPM_VERSION=//p' Dockerfile)"
veio="$(no_app pnpm --version | tr -d '\r')"
[ "$veio" = "$esperado" ] || { echo "esperado pnpm $esperado, veio $veio"; exit 1; }
echo "$veio"

passo "o Chromium do Playwright abre dentro do contêiner"
versao_pw="$(sed -n 's/^ARG PLAYWRIGHT_VERSION=//p' Dockerfile)"
no_app sh -c "cd /tmp && npm_config_cache=/tmp/.npm npx --yes playwright@${versao_pw} screenshot --browser chromium 'data:text/html,<h1>TireShop</h1>' /tmp/fumaca.png && test -s /tmp/fumaca.png"

passo "o contêiner escreve na pasta do projeto com o uid de quem chama"
no_app sh -c 'test -w . && test "$(id -u)" = "$(stat -c %u .)" && id -u'

if [ -z "${SO_IMAGEM:-}" ]; then
  passo "os verificadores das specs e do contrato passam"
  docker compose --profile ferramentas build handoff
  docker compose --profile ferramentas run --rm -T handoff
fi

printf '\nambiente ok\n'
