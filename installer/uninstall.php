<?php

$file = '/opt/mk-auth/admin/scripts/mk-auth.js';
$backupDir = '/opt/mk-auth/backups/vpscloud-branding';
$contents = file_get_contents($file);

if ($contents === false) {
    fwrite(STDERR, "JavaScript nativo nao encontrado.\n");
    exit(1);
}

$pattern = '/\n\/\* VPSCLOUD_LOGIN_LOADER_20260801 \*\/[\s\S]*?\n\}\(\)\);\n?/';
$updated = preg_replace($pattern, "\n", $contents, 1, $count);

if ($count === 0) {
    echo "Loader VPS CLOUD nao estava instalado.\n";
} else {
    if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) exit(1);
    $backup = $backupDir . '/mk-auth.js.before-uninstall-' . date('Ymd-His');
    if (!copy($file, $backup) || file_put_contents($file, $updated) === false) exit(1);
    chmod($file, 0644);
    echo "Loader VPS CLOUD removido. Backup: $backup\n";
}
