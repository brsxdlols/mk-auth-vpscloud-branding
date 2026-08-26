<?php

$root = dirname(__DIR__);
$backupDir = '/opt/mk-auth/backups/vpscloud-branding';
$mode = $argv[1] ?? '--all';

if (!in_array($mode, ['--all', '--central-only'], true)) {
    fwrite(STDERR, "Uso: php installer/install.php [--central-only]\n");
    exit(1);
}

if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    fwrite(STDERR, "Nao foi possivel criar a pasta de backup: $backupDir.\n");
    exit(1);
}

function copyTree($source, $destination)
{
    if (!is_dir($destination) && !mkdir($destination, 0755, true)) {
        throw new RuntimeException("Nao foi possivel criar $destination.");
    }
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($iterator as $item) {
        $relative = substr($item->getPathname(), strlen($source) + 1);
        $target = $destination . '/' . $relative;
        if ($item->isDir()) {
            if (!is_dir($target) && !mkdir($target, 0755, true)) {
                throw new RuntimeException("Nao foi possivel criar $target.");
            }
        } elseif (!copy($item->getPathname(), $target)) {
            throw new RuntimeException("Falha ao copiar $relative.");
        } else {
            chmod($target, 0644);
        }
    }
}

function installCentral($root, $backupDir)
{
    $source = $root . '/central/layout/abgs_center-2026';
    $destination = '/opt/mk-auth/central/layout/abgs_center-2026';
    if (!is_dir($source)) throw new RuntimeException('Tema da Central nao encontrado no pacote.');

    if (is_dir($destination)) {
        $backup = $backupDir . '/central-abgs_center-2026-before-' . date('Ymd-His');
        copyTree($destination, $backup);
        echo "Backup da Central criado: $backup\n";
    }
    copyTree($source, $destination);

    $connectionFile = '/opt/mk-auth/include/conexao.php';
    if (!is_file($connectionFile)) throw new RuntimeException('Arquivo de conexao do MK-Auth nao encontrado.');
    require $connectionFile;
    if (!isset($LOADMYSQL) || !($LOADMYSQL instanceof mysqli) || $LOADMYSQL->connect_errno) {
        throw new RuntimeException('Nao foi possivel configurar a Central.');
    }
    foreach (['laycentral' => 'abgs_center-2026', 'fsenha' => 'cpf'] as $name => $value) {
        $stmt = $LOADMYSQL->prepare(
            'INSERT INTO sis_opcao (nome, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)'
        );
        if (!$stmt) throw new RuntimeException('Falha ao preparar configuracao da Central.');
        $stmt->bind_param('ss', $name, $value);
        if (!$stmt->execute()) throw new RuntimeException('Falha ao salvar configuracao da Central.');
        $stmt->close();
    }
    echo "Tema abgs_center-2026 instalado, selecionado e configurado para CPF.\n";
}

function installLogin($root, $backupDir)
{
    $admin = '/opt/mk-auth/admin';
    $nativeJs = $admin . '/scripts/mk-auth.js';
    $marker = 'VPSCLOUD_LOGIN_LOADER_20260801';
    if (!is_file($nativeJs)) throw new RuntimeException("MK-Auth nao encontrado em $admin.");

    $files = [
        $root . '/admin/img/vpscloud-mkauth.svg' => $admin . '/img/vpscloud-mkauth.svg',
        $root . '/admin/img/network-consulting-symbol.svg' => $admin . '/img/network-consulting-symbol.svg',
        $root . '/admin/img/vpscloud-login-background.svg' => $admin . '/img/vpscloud-login-background.svg',
        $root . '/admin/estilos/vpscloud-login.css' => $admin . '/estilos/vpscloud-login.css',
        $root . '/admin/scripts/vpscloud-login.js' => $admin . '/scripts/vpscloud-login.js',
    ];
    foreach ($files as $source => $destination) {
        if (!is_file($source) || !copy($source, $destination)) {
            throw new RuntimeException("Falha ao instalar $destination.");
        }
        chmod($destination, 0644);
    }

    $contents = file_get_contents($nativeJs);
    if ($contents === false) throw new RuntimeException("Falha ao ler $nativeJs.");
    if (strpos($contents, $marker) === false) {
        $backup = $backupDir . '/mk-auth.js.before-vpscloud-' . date('Ymd-His');
        if (!copy($nativeJs, $backup)) throw new RuntimeException('Falha ao criar backup do login.');
        $contents .= <<<'JS'

/* VPSCLOUD_LOGIN_LOADER_20260801 */
(function () {
  'use strict';
  if (!/\/admin\/login\.hhvm$/.test(window.location.pathname)) return;
  if (!document.querySelector('link[data-vpscloud-login]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'estilos/vpscloud-login.css?v=20260826-1';
    link.setAttribute('data-vpscloud-login', 'true');
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[data-vpscloud-login]')) {
    var script = document.createElement('script');
    script.src = 'scripts/vpscloud-login.js?v=20260826-1';
    script.defer = true;
    script.setAttribute('data-vpscloud-login', 'true');
    document.head.appendChild(script);
  }
}());
JS;
        echo "Backup do login criado: $backup\n";
    } else {
        $contents = preg_replace(
            ['/vpscloud-login\.css\?v=[0-9-]+/', '/vpscloud-login\.js\?v=[0-9-]+/'],
            ['vpscloud-login.css?v=20260826-1', 'vpscloud-login.js?v=20260826-1'],
            $contents
        );
        if ($contents === null) throw new RuntimeException('Falha ao atualizar loader do login.');
    }
    if (file_put_contents($nativeJs, $contents) === false) {
        throw new RuntimeException('Falha ao instalar loader do login.');
    }
    chmod($nativeJs, 0644);
    echo "Identidade do login MK-AUTH VPS CLOUD instalada.\n";
}

try {
    installCentral($root, $backupDir);
    if ($mode !== '--central-only') installLogin($root, $backupDir);
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
