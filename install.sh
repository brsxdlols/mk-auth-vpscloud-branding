#!/bin/sh
set -eu

status() {
  status_code="$1"
  shift
  if [ -z "${NO_COLOR+x}" ] && { [ "${FORCE_COLOR:-}" = "1" ] || { [ -t 1 ] && [ "${TERM:-}" != "dumb" ]; }; }; then
    printf '\033[%sm%s\033[0m\n' "$status_code" "$*"
  else
    printf '%s\n' "$*"
  fi
}

ARCHIVE_URL="https://github.com/brsxdlols/mk-auth-vpscloud-branding/archive/refs/heads/main.tar.gz"

if [ "$(id -u)" -ne 0 ]; then
  status 31 "[ERRO] Execute este instalador como root." >&2
  exit 1
fi

for command_name in curl tar php; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    status 31 "[ERRO] Dependencia ausente: $command_name" >&2
    exit 1
  fi
done

if ! work_dir="$(mktemp -d /tmp/mk-auth-vpscloud.XXXXXX)"; then
  status 31 "[ERRO] Nao foi possivel criar a pasta temporaria." >&2
  exit 1
fi
cleanup() {
  rm -rf -- "$work_dir"
}
trap cleanup EXIT INT TERM

echo "Baixando identidade MK-AUTH VPS CLOUD..."
if ! curl -fsSL --retry 3 --connect-timeout 20 "$ARCHIVE_URL" -o "$work_dir/package.tar.gz"; then
  status 31 "[ERRO] Falha ao baixar o pacote. Instalacao nao concluida." >&2
  exit 1
fi
if ! tar -xzf "$work_dir/package.tar.gz" -C "$work_dir"; then
  status 31 "[ERRO] Falha ao extrair o pacote. Instalacao nao concluida." >&2
  exit 1
fi

if php "$work_dir/mk-auth-vpscloud-branding-main/installer/install.php" "$@"; then
  :
else
  result=$?
  status 31 "[ERRO] Instalacao nao concluida. Confira o erro acima; etapas anteriores podem ter sido aplicadas." >&2
  exit "$result"
fi

if [ "${1:-}" = "--central-only" ]; then
  status 32 "[OK] Central do Assinante instalada. Atualize a pagina com Ctrl+F5."
elif [ "${1:-}" = "--login-only" ]; then
  status 32 "[OK] Login atualizado. Atualize a pagina com Ctrl+F5."
else
  status 32 "[OK] Instalacao completa concluida. Atualize o login e a Central com Ctrl+F5."
fi
