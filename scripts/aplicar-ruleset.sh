#!/usr/bin/env sh
# Aplica .github/ruleset-main.json no repositório do GitHub e confere que ficou ativo.
# Um arquivo de ruleset versionado não protege nada sozinho: é este script que o aplica.
#
#   sh scripts/aplicar-ruleset.sh              aplica (cria ou atualiza) e confere
#   sh scripts/aplicar-ruleset.sh --conferir   só confere, sem alterar nada
#
# Precisa do gh autenticado, com permissão de administração no repositório.
set -eu
cd "$(dirname "$0")/.."

arquivo=".github/ruleset-main.json"
repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
nome="$(jq -r .name "$arquivo")"
id="$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$nome\") | .id")"

if [ "${1:-}" != "--conferir" ]; then
  if [ -n "$id" ]; then
    gh api --method PUT "repos/$repo/rulesets/$id" --input "$arquivo" > /dev/null
    echo "ruleset \"$nome\" atualizado em $repo"
  else
    id="$(gh api --method POST "repos/$repo/rulesets" --input "$arquivo" --jq .id)"
    echo "ruleset \"$nome\" criado em $repo"
  fi
fi

[ -n "$id" ] || { echo "o ruleset \"$nome\" não existe em $repo"; exit 1; }

estado="$(gh api "repos/$repo/rulesets/$id" --jq .enforcement)"
[ "$estado" = "active" ] || { echo "ruleset em \"$estado\", esperado \"active\""; exit 1; }

padrao="$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"
exigidos="$(gh api "repos/$repo/rules/branches/$padrao" \
  --jq '[.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context] | sort | join(", ")')"
esperados="$(jq -r '[.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context] | sort | join(", ")' "$arquivo")"
[ "$exigidos" = "$esperados" ] || { echo "checks exigidos na $padrao: [$exigidos]; esperado: [$esperados]"; exit 1; }

echo "ativo na $padrao · checks obrigatórios: $exigidos"
