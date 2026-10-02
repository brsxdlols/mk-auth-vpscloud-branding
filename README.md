# MK-Auth VPS CLOUD

Tema de login com feedback de autenticação, senha visível pelo botão de olho e página de logout. Inclui rede arrastável, pause, foguete com turbo e fumaça, modo Galaxya, pouso e lançamento. Os efeitos de fundo ficam ocultos no mobile.

## Instalar ou atualizar somente o login

Execute como root no servidor MK-Auth:

```sh
curl -fsSL https://raw.githubusercontent.com/brsxdlols/mk-auth-vpscloud-branding/main/install.sh | sh -s -- --login-only
```

Atualize o navegador com Ctrl+F5. O Hotsite Provedor abre a raiz do domínio de cada sistema.

O instalador preserva os scripts nativos de autenticação e cria backups em /opt/mk-auth/backups/vpscloud-branding/login-before-DATA. Configura um adaptador PHP em /var/www/vpscloud-auth-prepend.php e regras específicas para executar_login.hhvm e logout.hhvm em admin/.htaccess. Requer Apache/PHP com suporte a essas regras; homologado em consultoria.vpscloud.net.br. Instalações com configuração de servidor diferente precisam validar login e logout após instalar.

## Central do Assinante

--central-only instala apenas o tema da Central e configura CPF como senha. Sem argumentos, o instalador altera login e Central. Use --login-only para manter a Central atual.

## Restaurar

Restaure os arquivos do backup para seus destinos: mk-auth.js e vpscloud-login.js em admin/scripts, vpscloud-login.css em admin/estilos, arquivos SVG em admin/img, .htaccess em admin e vpscloud-auth-prepend.php em /var/www. Caso não existisse adaptador anterior, remova o bloco BEGIN/END VPSCLOUD AUTH PRESENTATION do .htaccess para voltar ao comportamento nativo.
