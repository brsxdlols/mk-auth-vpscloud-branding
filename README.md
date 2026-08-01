# Identidade visual MK-AUTH · VPS CLOUD · Network Consulting

Pacote de personalização da tela de login e da Central do Assinante do MK-Auth, validado em ambiente de homologação em 01/08/2026.

## Instalação automática

Execute como `root` no servidor MK-Auth:

```bash
curl -fsSL https://raw.githubusercontent.com/brsxdlols/mk-auth-vpscloud-branding/main/install.sh | sh
```

O instalador baixa a versão mais recente, aplica o login personalizado, instala o tema da Central do Assinante e configura autenticação por CPF.

## Diagnóstico

- Página de login principal: `/opt/mk-auth/admin/login.hhvm`.
- Fundos originais: `/opt/mk-auth/admin/img/fundo01AM.jpg` até `fundo31PM.jpg` (seleção dinâmica por dia/período).
- Logo original do login: JPEG de 128 × 128 px embutido em Base64 no próprio `login.hhvm`.
- CSS nativo: `/opt/mk-auth/admin/estilos/mk-auth.css`.
- JavaScript nativo: `/opt/mk-auth/admin/scripts/mk-auth.js`.
- O arquivo `login.hhvm` possui proteção/ofuscação e verificação de integridade. Por isso, este pacote não o altera.

## Solução aplicada

O instalador adiciona um carregador isolado ao final do JavaScript nativo. Ele só é executado quando o caminho é `/admin/login.hhvm` e carrega:

- fundo vetorial responsivo VPS CLOUD;
- logo vetorial `MK-AUTH / VPS CLOUD` com o símbolo oficial de conexões da Network Consulting;
- assinatura visual `VPS CLOUD / Network Consulting`;
- marca e logo clicáveis para `https://vpscloud.net.br/`;
- link “VPS CLOUD - Network Consulting” para o site da empresa;
- link “MK-Auth em Cloud”;
- direitos autorais “Bruno Fontes - Network Consulting”;
- botão “Central do assinante” apontando para `/central`;
- instalação do tema `abgs_center-2026` na central;
- seleção automática do tema e autenticação por CPF.
- adaptação para desktop, tablet e celular.

## Instalação

No servidor MK-Auth, como `root`:

```bash
php installer/install.php
```

O instalador utiliza automaticamente a conexão definida pelo próprio MK-Auth em `/opt/mk-auth/include/conexao.php`; nenhuma senha de banco é armazenada no projeto.

O instalador cria backup em `/opt/mk-auth/backups/vpscloud-branding/` antes de alterar `mk-auth.js`.

## Desinstalação

```bash
php installer/uninstall.php
```

A desinstalação remove somente o bloco carregador. Os assets ficam no servidor sem uso, permitindo reinstalação rápida.

## Estrutura sugerida para o GitHub

```text
mk-auth-vpscloud-branding/
├── admin/
│   ├── estilos/vpscloud-login.css
│   ├── img/
│   │   ├── vpscloud-login-background.svg
│   │   ├── vpscloud-mkauth.svg
│   └── scripts/vpscloud-login.js
├── central/
│   └── layout/abgs_center-2026/
├── installer/
│   ├── install.php
│   └── uninstall.php
└── README.md
```

Nenhuma credencial ou dado de acesso ao ambiente de teste faz parte deste pacote.
