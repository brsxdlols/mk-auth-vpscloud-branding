<?php

$root = dirname(__DIR__);
$admin = '/opt/mk-auth/admin';
$backupDir = '/opt/mk-auth/backups/vpscloud-branding';
$nativeJs = $admin . '/scripts/mk-auth.js';
$marker = 'VPSCLOUD_LOGIN_LOADER_20260801';

if (!is_file($nativeJs)) {
    fwrite(STDERR, "MK-Auth nao encontrado em $admin.\n");
    exit(1);
}

if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    fwrite(STDERR, "Nao foi possivel criar a pasta de backup: $backupDir.\n");
    exit(1);
}

$files = [
    $root . '/admin/img/vpscloud-mkauth.svg' => $admin . '/img/vpscloud-mkauth.svg',
    $root . '/admin/img/network-consulting-symbol.svg' => $admin . '/img/network-consulting-symbol.svg',
    $root . '/admin/img/vpscloud-login-background.svg' => $admin . '/img/vpscloud-login-background.svg',
    $root . '/admin/estilos/vpscloud-login.css' => $admin . '/estilos/vpscloud-login.css',
    $root . '/admin/scripts/vpscloud-login.js' => $admin . '/scripts/vpscloud-login.js',
];

foreach ($files as $source => $destination) {
    if (!is_file($source) || !copy($source, $destination)) {
        fwrite(STDERR, "Falha ao instalar $destination.\n");
        exit(1);
    }
    chmod($destination, 0644);
}

$themeSource = $root . '/central/layout/abgs_center-2026';
$themeDestination = '/opt/mk-auth/central/layout/abgs_center-2026';
if (!is_dir($themeSource)) {
    fwrite(STDERR, "Tema da central nao encontrado no pacote.\n");
    exit(1);
}

if (!is_dir($themeDestination) && !mkdir($themeDestination, 0755, true)) exit(1);
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($themeSource, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);
foreach ($iterator as $item) {
    $relative = substr($item->getPathname(), strlen($themeSource) + 1);
    $destination = $themeDestination . '/' . $relative;
    if ($item->isDir()) {
        if (!is_dir($destination) && !mkdir($destination, 0755, true)) exit(1);
    } elseif (!copy($item->getPathname(), $destination)) {
        fwrite(STDERR, "Falha ao instalar arquivo do tema: $relative.\n");
        exit(1);
    } else {
        chmod($destination, 0644);
    }
}

$connectionFile = '/opt/mk-auth/include/conexao.php';
if (!is_file($connectionFile)) {
    fwrite(STDERR, "Arquivo de conexao do MK-Auth nao encontrado.\n");
    exit(1);
}
require_once $connectionFile;
if (!isset($LOADMYSQL) || !($LOADMYSQL instanceof mysqli) || $LOADMYSQL->connect_errno) {
    fwrite(STDERR, "Nao foi possivel configurar tema e autenticacao da central.\n");
    exit(1);
}
$mysqli = $LOADMYSQL;
$settings = ['laycentral' => 'abgs_center-2026', 'fsenha' => 'cpf'];
foreach ($settings as $name => $value) {
    $stmt = $mysqli->prepare("INSERT INTO sis_opcao (nome, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
    if (!$stmt) exit(1);
    $stmt->bind_param('ss', $name, $value);
    if (!$stmt->execute()) exit(1);
    $stmt->close();
}

$contents = file_get_contents($nativeJs);
if ($contents === false) exit(1);

if (strpos($contents, $marker) === false) {
    $backup = $backupDir . '/mk-auth.js.before-vpscloud-' . date('Ymd-His');
    if (!copy($nativeJs, $backup)) exit(1);

    $loader = <<<'JS'

/* VPSCLOUD_LOGIN_LOADER_20260801 */
(function () {
  'use strict';
  if (!/\/admin\/login\.hhvm$/.test(window.location.pathname)) return;
  if (!document.querySelector('link[data-vpscloud-login]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'estilos/vpscloud-login.css?v=20260801-5';
    link.setAttribute('data-vpscloud-login', 'true');
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[data-vpscloud-login]')) {
    var script = document.createElement('script');
    script.src = 'scripts/vpscloud-login.js?v=20260801-5';
    script.defer = true;
    script.setAttribute('data-vpscloud-login', 'true');
    document.head.appendChild(script);
  }
}());
JS;

    if (file_put_contents($nativeJs, $contents . $loader) === false) exit(1);
    chmod($nativeJs, 0644);
    echo "Backup criado: $backup\n";
} else {
    $updated = preg_replace(
        "/vpscloud-login\\.css\\?v=[0-9-]+/",
        'vpscloud-login.css?v=20260801-5',
        $contents
    );
    $updated = preg_replace(
        "/vpscloud-login\\.js\\?v=[0-9-]+/",
        'vpscloud-login.js?v=20260801-5',
        $updated
    );

    if ($updated === null || file_put_contents($nativeJs, $updated) === false) exit(1);
    chmod($nativeJs, 0644);
    echo "Loader VPS CLOUD atualizado.\n";
}

echo "Identidade MK-AUTH VPS CLOUD instalada.\n";
echo "Tema abgs_center-2026 selecionado e central configurada para CPF.\n";
