<?php
/* Presentation adapter: native MK-Auth scripts still perform authentication/logout. */
$vpscloudScript = basename($_SERVER['SCRIPT_FILENAME'] ?? '');
if ($vpscloudScript === 'executar_login.hhvm' && ($_SERVER['HTTP_X_VPSCLOUD_FEEDBACK'] ?? '') === '1') {
    ob_start(function ($html) {
        $destination = '';
        foreach (headers_list() as $header) {
            if (stripos($header, 'Location:') === 0) $destination = trim(substr($header, 9));
        }
        if ($destination === '' && preg_match('/(?:window\.)?location(?:\.href)?\s*=\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]/', $html, $match)) $destination = $match[1];
        $path = parse_url($destination, PHP_URL_PATH);
        $ok = is_string($path) && preg_match('~(?:^|/)index\.(hhvm|php)$~', $path) === 1;
        $message = 'Não foi possível confirmar o acesso. Atualize a página e tente novamente.';
        if (!$ok && preg_match('/(?:window\.)?alert\(\s*([\x27\x22])((?:\\\\.|(?!\1)[\s\S])*)\1\s*\)/', $html, $match)) {
            $message = strip_tags(str_replace(['\\n', '\\r', '\\"', "\\'"], ["\n", '', '"', "'"], $match[2]));
        }
        if (!mb_check_encoding($message, 'UTF-8')) $message = mb_convert_encoding($message, 'UTF-8', 'ISO-8859-1');
        header_remove('Location');
        http_response_code(200);
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-store');
        return json_encode(['success' => $ok, 'redirect' => $ok ? '/admin/index.hhvm' : null, 'message' => $message], JSON_UNESCAPED_UNICODE);
    });
} elseif ($vpscloudScript === 'logout.hhvm') {
    ob_start(function ($html) {
        if (strpos($html, 'Logout efetuado com sucesso') === false) return $html;
        $operation = '';
        if (preg_match('/Opera(?:cao|ção)\s*:\s*([0-9]+)/i', $html, $match)) $operation = $match[1];
        header_remove('Location');
        http_response_code(200);
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-store');
        $detail = $operation !== '' ? '<br>Operação ' . htmlspecialchars($operation, ENT_QUOTES, 'UTF-8') : '';
        return '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sessão encerrada</title><style>html{min-height:100%;background:#0b1027}body{margin:0;min-height:100vh;min-height:100svh;display:grid;place-items:center;background:radial-gradient(ellipse at 75% 40%,#132746,#0b1027 75%);font-family:Arial,sans-serif;color:#281d43}.card{box-sizing:border-box;width:min(388px,calc(100% - 32px));padding:24px;text-align:center;border-radius:20px;background:#f9f7fc;box-shadow:0 18px 50px #0002}.icon{margin:auto;display:grid;place-items:center;width:66px;height:66px;background:#fff2d6;color:#c67b00;border:1px solid #ecdab7;border-radius:50%;font-size:34px}h1{font-size:23px;margin:14px 0 6px}p{font-size:14px;line-height:1.5;color:#706582;margin:0 0 18px}a{display:inline-block;padding:10px 16px;border-radius:9px;background:#dc8b00;color:#fff;font-size:14px;font-weight:bold;text-decoration:none}a:focus-visible{outline:3px solid #071c38;outline-offset:3px}</style><main class="card"><div class="icon" aria-hidden="true">&#10149;</div><h1>Sessão encerrada</h1><p>Logout efetuado com sucesso.' . $detail . '</p><a href="/admin/login.hhvm">Voltar ao login</a></main></html>';
    });
}
