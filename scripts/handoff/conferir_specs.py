#!/usr/bin/env python3
"""Confere a coerência das specs (specs/).

Falha se:
  - um id de task se repete, ou não segue T-NNxx com NN = número do módulo;
  - uma task depende de um id que não existe, ou de uma task que vem DEPOIS dela na ordem de execução
    (ordem = a do comentário `ordem-de-execucao` do roadmap; sem ele, módulos em ordem numérica);
  - uma task não tem um dos campos obrigatórios (Requisito, Camada, Teste primeiro, Pronto quando, Arquivos);
  - um requisito REQ-NN-xx da spec não é atendido por nenhuma task;
  - uma task cita um requisito que não existe na spec do módulo;
  - um RF do PRD não aparece em nenhuma spec.

Uso: docker compose --profile ferramentas run --rm handoff python3 scripts/handoff/conferir_specs.py [--tabela]
     (--tabela imprime a contagem por módulo em Markdown)

Portado para tests/infra/specs.spec.ts na T-1316; até lá, é o que o job "Specs" do CI roda.
"""
from __future__ import annotations

import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
CAMPOS = ("Requisito", "Camada", "Teste primeiro", "Pronto quando", "Arquivos")
CAMADAS = {"domínio", "aplicação", "adaptador", "mock", "ui", "e2e", "infra"}


def main() -> int:
    erros: list[str] = []
    ordem: list[str] = []            # ids na ordem de execução
    tasks: dict[str, dict] = {}
    linhas_tabela = []
    rf_prd = set(re.findall(r"\|\s*(RF-\d+)\s*\|", (RAIZ / "docs" / "prd.md").read_text(encoding="utf-8")))
    rnf_prd = set(re.findall(r"\|\s*(RNF-\d+)\s*\|", (RAIZ / "docs" / "prd.md").read_text(encoding="utf-8")))
    rf_citados: set[str] = set()

    modulos = sorted(p for p in (RAIZ / "specs").iterdir() if p.is_dir() and re.match(r"\d\d-", p.name))
    for mod in modulos:
        nn = mod.name[:2]
        spec, tk = mod / "spec.md", mod / "tasks.md"
        if not spec.exists() or not tk.exists():
            erros.append(f"{mod.name}: falta spec.md ou tasks.md")
            continue
        s = spec.read_text(encoding="utf-8")
        reqs = set(re.findall(rf"\|\s*(REQ-{nn}-\d+)\s*\|", s))
        rf_citados |= set(re.findall(r"\b(RN?F-\d+)\b", s))
        criterios = len(set(re.findall(rf"\*\*(CA-{nn}-\d+)", s)))
        t = tk.read_text(encoding="utf-8")
        blocos = re.split(r"^### ", t, flags=re.M)[1:]
        atendidos: set[str] = set()
        camadas: dict[str, int] = {}
        for b in blocos:
            m = re.match(r"\[.\]\s*(T-\d{4})\s*·\s*(.+)", b)
            if not m:
                erros.append(f"{mod.name}: título de task fora do padrão: {b.splitlines()[0][:60]}")
                continue
            tid, titulo = m.group(1), m.group(2).strip()
            if tid[2:4] != nn:
                erros.append(f"{tid}: número não bate com o módulo {nn}")
            if tid in tasks:
                erros.append(f"{tid}: id repetido")
            for c in CAMPOS:
                if not re.search(rf"\*\*{c}:\*\*", b):
                    erros.append(f"{tid}: falta o campo '{c}'")
            cam = re.search(r"\*\*Camada:\*\*\s*([^\n]+)", b)
            cam_v = cam.group(1).strip().lower() if cam else "?"
            if cam and cam_v not in CAMADAS:
                erros.append(f"{tid}: camada desconhecida '{cam_v}'")
            camadas[cam_v] = camadas.get(cam_v, 0) + 1
            if not re.search(r"\*\*Teste primeiro:\*\*\s*`[^`]+`", b):
                erros.append(f"{tid}: 'Teste primeiro' sem o caminho do arquivo de teste")
            req_l = re.search(r"\*\*Requisito:\*\*\s*([^\n]+)", b)
            cit = set(re.findall(r"REQ-\d\d-\d+", req_l.group(1))) if req_l else set()
            for r in cit:
                if r not in reqs:
                    erros.append(f"{tid}: cita {r}, que não existe na spec do módulo")
            atendidos |= cit
            dep_l = re.search(r"\*\*Depende de:\*\*\s*([^\n]+)", b)
            deps = re.findall(r"T-\d{4}", dep_l.group(1)) if dep_l else []
            tasks[tid] = {"titulo": titulo, "deps": deps, "mod": mod.name}
            ordem.append(tid)
        for r in sorted(reqs - atendidos):
            erros.append(f"{mod.name}: {r} sem task")
        if not reqs:
            erros.append(f"{mod.name}: spec sem requisitos REQ-{nn}-xx")
        linhas_tabela.append((mod.name, len(reqs), criterios, len(blocos), camadas))

    # a ordem de execução pode ser redefinida no roadmap: <!-- ordem-de-execucao: 00, 01, 12:T-1201..T-1213, 09, ... -->
    rm = RAIZ / "specs" / "roadmap.md"
    marca = re.search(r"<!--\s*ordem-de-execucao:\s*([^>]+?)\s*-->", rm.read_text(encoding="utf-8")) if rm.exists() else None
    if marca:
        nova: list[str] = []
        for trecho in [x.strip() for x in marca.group(1).split(",")]:
            m = re.match(r"^(\d\d)(?::(T-\d{4})\.\.(T-\d{4}))?$", trecho)
            if not m:
                erros.append(f"roadmap: trecho de ordem inválido: {trecho}")
                continue
            do_mod = [t for t in ordem if t[2:4] == m.group(1)]
            if m.group(2):
                do_mod = [t for t in do_mod if m.group(2) <= t <= m.group(3)]
            nova += do_mod
        if sorted(nova) != sorted(ordem):
            erros.append(f"roadmap: a ordem de execução não cobre cada task exatamente uma vez ({len(nova)} de {len(ordem)})")
        else:
            ordem = nova
    pos = {t: i for i, t in enumerate(ordem)}
    for tid in ordem:
        for d in tasks[tid]["deps"]:
            if d not in tasks:
                erros.append(f"{tid}: depende de {d}, que não existe")
            elif pos[d] >= pos[tid]:
                erros.append(f"{tid}: depende de {d}, que vem depois na ordem de execução")
    for rf in sorted(rf_prd - rf_citados):
        erros.append(f"PRD: {rf} não aparece em nenhuma spec")
    for rf in sorted(rnf_prd - rf_citados):
        erros.append(f"PRD: {rf} não aparece em nenhuma spec")

    if "--tabela" in sys.argv:
        print("| Módulo | Requisitos | Critérios de aceite | Tasks |\n|---|---|---|---|")
        for nome, r, c, n, _ in linhas_tabela:
            print(f"| [{nome}]({nome}/spec.md) | {r} | {c} | [{n}]({nome}/tasks.md) |")
        print(f"| **Total** | **{sum(x[1] for x in linhas_tabela)}** | **{sum(x[2] for x in linhas_tabela)}** | **{sum(x[3] for x in linhas_tabela)}** |")
    print(f"{len(modulos)} módulos · {len(ordem)} tasks · {sum(x[1] for x in linhas_tabela)} requisitos · "
          f"{len(rf_prd & rf_citados)}/{len(rf_prd)} RF e {len(rnf_prd & rf_citados)}/{len(rnf_prd)} RNF do PRD cobertos", file=sys.stderr)
    if erros:
        print(f"\n{len(erros)} problema(s):", file=sys.stderr)
        for e in erros[:80]:
            print("  -", e, file=sys.stderr)
        return 1
    print("specs ok", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
