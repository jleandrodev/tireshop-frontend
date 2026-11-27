#!/usr/bin/env sh
# Aplica a proteção da main no repositório do GitHub e confere que ficou ativa. São duas partes:
#   1. o ruleset de .github/ruleset-main.json (PR obrigatório, checks, sem force-push);
#   2. as configurações de merge do repositório: só squash, e a branch some depois do merge.
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

  gh repo edit "$repo" \
    --enable-squash-merge \
    --enable-merge-commit=false \
    --enable-rebase-merge=false \
    --delete-branch-on-merge > /dev/null
  echo "merge do repositório: só squash, branch apagada depois do merge"
fi

[ -n "$id" ] || { echo "o ruleset \"$nome\" não existe em $repo"; exit 1; }

estado="$(gh api "repos/$repo/rulesets/$id" --jq .enforcement)"
[ "$estado" = "active" ] || { echo "ruleset em \"$estado\", esperado \"active\""; exit 1; }

padrao="$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"
exigidos="$(gh api "repos/$repo/rules/branches/$padrao" \
  --jq '[.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context] | sort | join(", ")')"
esperados="$(jq -r '[.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context] | sort | join(", ")' "$arquivo")"
[ "$exigidos" = "$esperados" ] || { echo "checks exigidos na $padrao: [$exigidos]; esperado: [$esperados]"; exit 1; }

merge="$(gh repo view "$repo" --json squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge \
  --jq '"squash=\(.squashMergeAllowed) merge=\(.mergeCommitAllowed) rebase=\(.rebaseMergeAllowed) apaga=\(.deleteBranchOnMerge)"')"
esperado_merge="squash=true merge=false rebase=false apaga=true"
[ "$merge" = "$esperado_merge" ] || { echo "merge do repositório: [$merge]; esperado: [$esperado_merge]"; exit 1; }

echo "ativo na $padrao · checks obrigatórios: $exigidos · merge só por squash, branch apagada no merge"
