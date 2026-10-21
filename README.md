# MK-Auth VPS CLOUD

Tema de login com autenticação nativa do MK-Auth, senha visível pelo botão de olho e página de logout. Inclui rede arrastável, pause, foguete com turbo e fumaça, modo Galaxya, pouso e lançamento. Os efeitos de fundo ficam ocultos no mobile.

## Instalar ou atualizar somente o login

Execute como root no servidor MK-Auth:

```sh
curl -fsSL https://raw.githubusercontent.com/brsxdlols/mk-auth-vpscloud-branding/main/install.sh | sh -s -- --login-only
```

Atualize o navegador com Ctrl+F5. O Hotsite Provedor abre a raiz do domínio de cada sistema.

A versão `20261021-nativeprogress1` mantém o envio nativo do formulário, por clique ou Enter, com os campos de validação e token da própria página. Não busca outro formulário antes de entrar e não intercepta o envio para exigir JSON. O indicador visual “Verificando seu acesso” acompanha o envio nativo sem cancelar, atrasar ou repetir o POST. As mensagens de resultado continuam sendo as nativas do MK-Auth. O indicador é restaurado ao voltar pelo navegador e deixa de aparecer após 15 segundos se a navegação não ocorrer; esse prazo não cancela nem reenvia a autenticação. Isso corrige a etapa adicional que apresentava “Não foi possível atualizar o formulário de acesso” na versão instalada `20261008-freshvalidation1`.

O instalador preserva os scripts nativos de autenticação e cria backups em /opt/mk-auth/backups/vpscloud-branding/login-before-DATA. Configura um adaptador PHP em /var/www/vpscloud-auth-prepend.php e regras específicas para executar_login.hhvm e logout.hhvm em admin/.htaccess. Requer Apache/PHP com suporte a essas regras; usado anteriormente em consultoria.vpscloud.net.br. Correção aplicada em consultoria.vpscloud.net.br; arquivos publicados conferidos por HTTPS. O acesso completo com uma conta válida ainda precisa ser confirmado. Instalações com configuração de servidor diferente precisam validar login e logout após instalar.

## Central do Assinante

--central-only instala apenas o tema da Central e configura CPF como senha. Sem argumentos, o instalador altera login e Central. Use --login-only para manter a Central atual.

## Restaurar

Restaure os arquivos do backup para seus destinos: mk-auth.js e vpscloud-login.js em admin/scripts, vpscloud-login.css em admin/estilos, arquivos SVG em admin/img, .htaccess em admin e vpscloud-auth-prepend.php em /var/www. Caso não existisse adaptador anterior, remova o bloco BEGIN/END VPSCLOUD AUTH PRESENTATION do .htaccess para voltar ao comportamento nativo.
