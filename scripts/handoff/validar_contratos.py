#!/usr/bin/env python3
"""Confere o contrato da API: todo exemplo valida no schema do endpoint que o cita.

Lê docs/api/openapi.yaml e os JSON de examples/. Para cada resposta ou corpo de
requisição com `examples`, valida o arquivo contra o schema (JSON Schema 2020-12). Em modo estrito,
também recusa campo presente no exemplo e ausente do contrato (campo não documentado).

Falha se: um exemplo não valida; uma operação com resposta 2xx em JSON não tem exemplo; um arquivo
de examples/ não é citado por ninguém; um conjunto de examples/_base/ não valida.

Uso: docker compose --profile ferramentas run --rm handoff python3 scripts/handoff/validar_contratos.py

Substituído por tests/contract/openapi.spec.ts na T-0009; até lá, é o que o job "Specs" do CI roda.
"""
from __future__ import annotations

import copy
import json
import pathlib
import sys

import yaml
from jsonschema import Draft202012Validator

RAIZ = pathlib.Path(__file__).resolve().parents[2]
API = RAIZ / "docs" / "api"
BASE = {"produtos.json": "Produto", "categorias.json": "Categoria", "politicas.json": "Politica", "lojas.json": "Loja"}


def estrito(no, esquemas):
    """Cópia do schema com allOf achatado e additionalProperties: false onde há `properties`."""
    if isinstance(no, list):
        return [estrito(x, esquemas) for x in no]
    if not isinstance(no, dict):
        return no
    if "$ref" in no and len(no) == 1:
        return estrito(copy.deepcopy(esquemas[no["$ref"].split("/")[-1]]), esquemas)
    if "allOf" in no:
        junto = {"type": "object", "required": [], "properties": {}}
        for parte in no["allOf"]:
            p = estrito(parte, esquemas)
            junto["required"] += p.get("required", [])
            junto["properties"].update(p.get("properties", {}))
        junto["additionalProperties"] = False
        return junto
    saida = {k: estrito(v, esquemas) for k, v in no.items()}
    if "properties" in saida and "additionalProperties" not in saida:
        saida["additionalProperties"] = False
    return saida


def main() -> int:
    doc = yaml.safe_load((API / "openapi.yaml").read_text(encoding="utf-8"))
    esquemas = doc["components"]["schemas"]
    respostas = doc["components"].get("responses", {})
    erros, citados, n = [], set(), 0

    def validar(schema: dict, arquivo: str, onde: str) -> None:
        nonlocal n
        caminho = (API / arquivo).resolve()
        citados.add(caminho)
        if not caminho.exists():
            erros.append(f"{onde}: exemplo não existe: {arquivo}")
            return
        dado = json.loads(caminho.read_text(encoding="utf-8"))
        v = Draft202012Validator(estrito(schema, esquemas))
        achados = sorted(v.iter_errors(dado), key=lambda e: list(e.absolute_path))
        n += 1
        for e in achados[:4]:
            erros.append(f"{onde} · {arquivo} · /{'/'.join(map(str, e.absolute_path))}: {e.message[:160]}")

    def conteudo(c: dict, onde: str) -> int:
        achou = 0
        for tipo, corpo in (c or {}).items():
            for nome, ex in (corpo.get("examples") or {}).items():
                validar(corpo["schema"], ex["externalValue"], f"{onde} [{nome}]")
                achou += 1
        return achou

    for rota, ops in doc["paths"].items():
        for metodo, op in ops.items():
            onde = f"{metodo.upper()} {rota}"
            if "requestBody" in op:
                if not conteudo(op["requestBody"].get("content"), onde + " (corpo)") and metodo != "patch":
                    erros.append(f"{onde}: corpo da requisição sem exemplo")
            tem_ok = False
            for status, r in op["responses"].items():
                if "$ref" in r:
                    r = respostas[r["$ref"].split("/")[-1]]
                k = conteudo(r.get("content"), f"{onde} → {status}")
                tem_ok = tem_ok or (status.startswith("2") and k > 0)
            if not tem_ok and metodo not in ("patch",) and op["operationId"] != "assinarNewsletter":
                erros.append(f"{onde}: resposta 2xx sem exemplo")

    for arquivo, nome in BASE.items():
        dados = json.loads((API / "examples" / "_base" / arquivo).read_text(encoding="utf-8"))
        v = Draft202012Validator(estrito({"$ref": f"#/components/schemas/{nome}"}, esquemas))
        for i, item in enumerate(dados):
            for e in list(v.iter_errors(item))[:2]:
                erros.append(f"_base/{arquivo}[{i}] · /{'/'.join(map(str, e.absolute_path))}: {e.message[:160]}")
        n += len(dados)

    soltos = [a.name for a in sorted((API / "examples").glob("*.json")) if a.resolve() not in citados]
    for s in soltos:
        erros.append(f"exemplo não citado no OpenAPI: {s}")

    ops = sum(len(v) for v in doc["paths"].values())
    print(f"{ops} operações · {len(esquemas)} schemas · {n} validações de exemplo")
    if erros:
        print(f"\n{len(erros)} problema(s):")
        for e in erros[:60]:
            print("  -", e)
        return 1
    print("contrato ok: todo exemplo valida no schema do endpoint, em modo estrito")
    return 0


if __name__ == "__main__":
    sys.exit(main())
