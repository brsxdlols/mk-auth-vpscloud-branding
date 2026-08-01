#!/bin/sh
set -eu

ARCHIVE_URL="https://github.com/brsxdlols/mk-auth-vpscloud-branding/archive/refs/heads/main.tar.gz"

if [ "$(id -u)" -ne 0 ]; then
  echo "Execute este instalador como root." >&2
  exit 1
fi

for command_name in curl tar php; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Dependencia ausente: $command_name" >&2
    exit 1
  fi
done

work_dir="$(mktemp -d /tmp/mk-auth-vpscloud.XXXXXX)"
cleanup() {
  rm -rf -- "$work_dir"
}
trap cleanup EXIT INT TERM

echo "Baixando identidade MK-AUTH VPS CLOUD..."
curl -fsSL --retry 3 --connect-timeout 20 "$ARCHIVE_URL" |
  tar -xz -C "$work_dir"

php "$work_dir/mk-auth-vpscloud-branding-main/installer/install.php"
echo "Instalacao concluida. Atualize a tela de login com Ctrl+F5."
