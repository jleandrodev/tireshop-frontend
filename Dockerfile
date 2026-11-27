# syntax=docker/dockerfile:1

# Imagens do projeto. Nada de Node, pnpm ou Python na máquina: tudo roda aqui (ADR 0014).
#   dev      desenvolvimento e testes (Node 22, pnpm e o Chromium do Playwright)
#   handoff  verificadores das specs e do contrato (Python), até serem portados (T-0009 e T-1316)
# Os alvos de produção (build e runtime) entram na T-1317.

# A versão do Node vem do .nvmrc: o compose.yaml e o CI a passam como argumento de build.
# O padrão abaixo só vale para um `docker build` avulso e tem de ser igual ao .nvmrc
# (scripts/conferir-ambiente.sh reprova se divergir).
ARG NODE_VERSION=22

# ---------------------------------------------------------------------------- dev
# Debian, e não Alpine: o Chromium do Playwright não roda em musl.
FROM node:${NODE_VERSION}-bookworm-slim AS dev

# As duas versões abaixo têm de bater com o package.json (`packageManager` e `@playwright/test`).
# A T-0012 confere isso por teste.
ARG PNPM_VERSION=12.23.0
ARG PLAYWRIGHT_VERSION=1.65.1

ENV COREPACK_HOME=/opt/corepack \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NUXT_TELEMETRY_DISABLED=1

RUN apt-get update \
 # procps (ps): o Stryker (T-0121) usa pra encerrar os processos de teste órfãos; a imagem
 # node:bookworm-slim não traz por padrão.
 && apt-get install -y --no-install-recommends ca-certificates git procps \
 && rm -rf /var/lib/apt/lists/*

# pnpm pelo corepack, na versão fixada.
RUN corepack enable \
 && corepack prepare "pnpm@${PNPM_VERSION}" --activate

# O Chromium e as bibliotecas de sistema dele entram na imagem: o mesmo navegador e as mesmas
# fontes na máquina e no CI (é o que deixa a regressão visual comparável).
RUN npx --yes "playwright@${PLAYWRIGHT_VERSION}" install --with-deps chromium \
 && rm -rf /root/.npm /var/lib/apt/lists/*

# O contêiner roda com o uid de quem chama (compose.yaml), para os arquivos criados na pasta do
# projeto pertencerem ao dev. Por isso estes diretórios aceitam qualquer usuário.
RUN mkdir -p /pnpm/store /app \
 && chmod 1777 /pnpm/store /home/node \
 && chmod -R a+rwX /opt/corepack /ms-playwright
ENV HOME=/home/node

WORKDIR /app
EXPOSE 3000 24678 9323
CMD ["pnpm", "dev"]

# ------------------------------------------------------------------------ handoff
FROM python:3.13-slim AS handoff
COPY scripts/handoff/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
WORKDIR /app
CMD ["sh", "scripts/handoff/conferir.sh"]
