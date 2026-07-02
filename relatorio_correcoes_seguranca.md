# Relatório de Auditoria de Segurança e Qualidade — MusicMakers

Auditoria completa de segurança (XSS, autorização client-side, clickjacking, IDOR), qualidade de JavaScript/HTML e UX no frontend, com os respectivos ajustes de backend quando necessário. Todas as correções seguem as regras combinadas: nenhuma aparência visual, rota de API ou funcionalidade existente foi alterada; nenhum recurso foi removido; nenhuma refatoração grande foi feita além do necessário para corrigir cada problema.

---

## 1. Problemas encontrados (pedido original, 6 itens)

1. **XSS crítico** — vários arquivos JS inseriam dados vindos da API ou digitados por outros usuários (nomes, descrições, bios, títulos de vaga, etc.) diretamente em `innerHTML`, sem qualquer escape. Um nome de banda, descrição de vaga ou bio contendo `<img src=x onerror=...>` seria executado no navegador de quem visualizasse a tela.
2. **Autorização baseada só em localStorage** — `global.js`, `index.html`, `perfil-gestor.js`, `perfil-musico.js`, `configurar-banda.js` e `banda.js` decidiam o que exibir (menus, abas, botões de gestor) lendo `usuarioLogado.tipoUsuario`/`.gestor` do `localStorage`, que é editável via DevTools.
3. **Link "Esqueceu a senha"** em `login.html` apontava para `href="#"`.
4. **Vazamento de escopo global** — `window.updateStars` em `perfil-musico.js` era uma função pública desnecessária.
5. **Ícone de mostrar/ocultar senha** em `login.html`/`cadastro.html` usava `<svg>` inline copiado; o toggle de classes (`bi-eye`/`bi-eye-slash`) não tinha efeito visual nenhum nesse tipo de elemento.
6. **CSS injetado via JavaScript** — `showSuccessPopup()` em `utils.js` criava uma tag `<style>` inteira a cada chamada.

## 2. Achados adicionais da auditoria ampla

- **IDOR em `POST /api/bandas`**: `BandaService.criarBanda` não validava que o `idUsuario` do query param era o usuário autenticado, nem que o usuário era GESTOR — qualquer conta MUSICO autenticada podia criar uma banda "em nome" de outro usuário.
- **Clickjacking**: nem `nginx.conf` nem `SecurityConfig.java` bloqueavam o carregamento do site em `<iframe>` de terceiros.
- **Formulário de login falso na home** (`index.html`): o card de login tinha `<form action="dashboard.html">` (página inexistente) sem nenhum handler de submit — um clique real enviaria e-mail e **senha em texto puro na URL** (GET), ficando exposta no histórico do navegador e em logs de servidor.
- **ID duplicado em `redefinir.html`**: dois `<input id="novaSenha">` no mesmo formulário — um deles morto/sem função.
- **Listener duplicado em `perfil-musico.js`**: dois `submit` registrados no mesmo formulário "Alterar Senha" — um handler legado, morto, exibia "Senha alterada com sucesso!" sem chamar a API e limpava os campos, disparando junto com o handler real a cada envio (mensagem falsa e confusa).
- **Acessibilidade**: ícones clicáveis (navegação do calendário, toggles de senha) sem `aria-label`; campos de senha/e-mail sem `autocomplete`; link `sobre.html` referenciado em 4 páginas mas inexistente.
- **Falhas silenciosas**: vários `fetch` com `catch` que só faziam `console.warn`/`console.error`, deixando o usuário sem qualquer feedback em caso de erro de rede.
- **Double-submit**: vários formulários/botões (aprovar/rejeitar candidatura, enviar convite, salvar perfil, alterar senha, excluir conta, editar banda/vaga) não desabilitavam o botão antes do `fetch`, permitindo requisições duplicadas em cliques rápidos.

## 3. Correções aplicadas

### Segurança — XSS
Adicionada a função utilitária `escapeHtml(str)` em `frontend/scripts/utils.js` (cria uma `<div>`, define `textContent`, lê `innerHTML` de volta) e aplicada em todo ponto de interpolação perigoso dentro de templates `innerHTML`, incluindo dentro de atributos (`data-*`, `style=""`), em:
- `banda.js` (36 pontos: financeiro, membros, repertório, convites, busca de músicos, vagas, candidatos/candidaturas, sino de notificações, `showSnackbar`).
- `perfil-musico.js` (14 pontos: convites de banda, sino, vagas, portfólio de vídeo, `showSnackbar`).
- `perfil-gestor.js` (`showSnackbar`, por defesa em profundidade).
- `global.js` (dropdown de perfil: cor do avatar, iniciais, nome).
- `index.html` (card de "bem-vindo de volta": cor, iniciais, nome).
- `financeiro-dashboard.js` (descrição/categoria de transações).
- `recuperarSenha.js` (mensagem de resposta da API).
- `utils.js` (`showSuccessPopup`, mensagem exibida no popup de sucesso).

Caso especial: o visualizador de PDF de partitura em `banda.js` foi refeito para construir o `<embed>` via `document.createElement('embed')` + atribuição de propriedades (`.src`, `.type`, etc.) em vez de montar a URL dentro de uma string `innerHTML`.

### Segurança — Autorização client-side
- Adicionadas as funções `decodeJwtPayload(token)` e `getTipoUsuarioSeguro()` em `utils.js`. O JWT emitido pelo backend já carrega a claim `role` assinada (`TokenService.java`); essas funções decodificam esse payload (sem validar assinatura — usado só para leitura de UI, nunca como prova de autenticidade) e retornam a role real do usuário.
- Todos os pontos que decidiam UI sensível (mostrar aba de configurações, botão de remover membro, redirecionar para tela de gestor, mostrar itens de menu) em `banda.js`, `perfil-musico.js`, `perfil-gestor.js`, `global.js`, `index.html` e `configurar-banda.js` passaram a usar `getTipoUsuarioSeguro()` como fonte de verdade, caindo de volta no valor de `localStorage` apenas quando não há token válido decodificável.
- Tratamento de `401`: `configurar-banda.js` e os principais `fetch` de carregamento de dados em `banda.js` agora limpam a sessão e redirecionam para `login.html` quando o backend responde 401, em vez de cair silenciosamente no tratamento de erro genérico.

### Segurança — IDOR no backend (`BandaService.criarBanda`)
```java
Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
autorizacaoService.exigirDonoRecurso(idUsuarioCriador, usuarioAtual);
if (!"GESTOR".equals(usuarioAtual.getTipoUsuario())) {
    throw new AcessoNegadoException("Apenas gestores podem criar bandas.");
}
```
Mesmo padrão já usado em `deletarBanda`/`removerMembro`/`atualizarBanda`. Rota e assinatura do controller (`POST /api/bandas?idUsuario=`) não mudaram.

### Segurança — Clickjacking
- `frontend/nginx.conf`: `add_header X-Frame-Options "SAMEORIGIN" always;` e `add_header Content-Security-Policy "frame-ancestors 'self';" always;`.
- `SecurityConfig.java`: `.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))` adicionado à cadeia de segurança, sem alterar nenhuma outra regra existente.

### Segurança — formulário de login falso na home
`index.html`: o `<form action="dashboard.html">` (GET para página inexistente, vazando senha na URL) foi trocado por um `<form id="formLoginHome">` com `preventDefault()` que redireciona para `login.html` (a página de login real). Não havia autenticação de verdade nesse card antes (o destino nunca existiu), então a correção não remove nenhuma funcionalidade — apenas fecha a falha de segurança.

### Problemas 3, 4, 5, 6 (pedido original)
- `login.html`: `href="#"` → `href="esqueceuSenha.html"`.
- `perfil-musico.js`: `window.updateStars` → `function updateStars(value)` privada (uso interno confirmado, sem referência externa).
- `login.html`/`cadastro.html`: `<svg>` inline do ícone de senha substituído por `<i class="bi bi-eye-slash" id="toggleSenha">` (mesmo padrão que já funcionava em `redefinir.html`).
- `utils.js`: `showSuccessPopup()` não cria mais `<style>` dinamicamente; CSS movido para `styles.css` e duplicado nos `<style>` embutidos de `login.html`/`cadastro.html` (as únicas 2 páginas que não carregam `styles.css`).

### Correções de qualidade JS/HTML
- **`perfil-musico.js`**: removido o listener de `submit` duplicado/morto do formulário "Alterar Senha" (mostrava mensagem de sucesso falsa sem chamar a API).
- **`redefinir.html`**: removido o `<input id="novaSenha">` duplicado/morto (mantido apenas o funcional, com toggle de senha).
- **`sobre.html`**: criada página placeholder (reaproveitando header/footer e classes CSS já existentes), corrigindo o link quebrado referenciado em `banda.html`, `index.html`, `perfil-gestor.html` e `perfil-musico.html`.
- **Acessibilidade**: `aria-label` adicionado aos ícones de navegação do calendário e aos toggles de senha (com `role="button"`/`tabindex="0"` nos casos em que o elemento era um `<i>` solto); `autocomplete` (`email`, `current-password`, `new-password`) adicionado aos campos relevantes de login/cadastro/redefinição/alteração de senha.
- **JSON.parse seguro**: adicionada `parseJsonSeguro(str, fallback)` em `utils.js` e usada em `banda.js`, `global.js`, `perfil-musico.js`, `perfil-gestor.js`, `financeiro-dashboard.js`, `configurar-banda.js`, `index.html` — um valor corrompido em `localStorage` não derruba mais a página inteira.
- **Double-submit**: botão desabilitado antes do `fetch` (reabilitado em `finally`/sucesso+erro) em: aprovar/rejeitar candidatura, enviar convite, salvar perfil (músico e gestor), alterar senha (músico e gestor), excluir conta (músico e gestor), editar banda, adicionar/editar vaga, buscar músico para convite.
- **Feedback de erro**: `showSnackbar` de erro adicionado em `catch` que antes só logavam no console (carregar financeiro, repertório, membros, convites, estados/cidades do IBGE em `banda.js`; convites e estados em `perfil-musico.js`).

## 4. Arquivos modificados

**Backend:**
- `backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/service/BandaService.java` — autorização em `criarBanda`.
- `backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/config/SecurityConfig.java` — header anti-clickjacking.

**Frontend:**
- `frontend/scripts/utils.js` — `escapeHtml`, `decodeJwtPayload`, `getTipoUsuarioSeguro`, `parseJsonSeguro`, popup sem CSS injetado, toggle de senha acessível por teclado.
- `frontend/scripts/banda.js`, `perfil-musico.js`, `perfil-gestor.js`, `global.js`, `financeiro-dashboard.js`, `recuperarSenha.js`, `configurar-banda.js` — XSS, autorização via JWT, double-submit, JSON.parse seguro.
- `frontend/index.html` — XSS, autorização via JWT, correção do form de login falso.
- `frontend/login.html`, `cadastro.html` — ícone de senha, CSS do popup, `aria-label`/`autocomplete`.
- `frontend/redefinir.html` — remoção de ID duplicado, `aria-label`/`autocomplete`.
- `frontend/banda.html`, `perfil-gestor.html`, `perfil-musico.html`, `esqueceuSenha.html` — `aria-label`/`autocomplete`.
- `frontend/styles.css` — CSS do popup de sucesso.
- `frontend/nginx.conf` — header anti-clickjacking.
- `frontend/sobre.html` — nova página (corrige link quebrado).

## 5. Alterações de backend necessárias?

Sim, duas, ambas mínimas e sem mudança de rota/contrato:
1. `BandaService.criarBanda` — checagem de dono do recurso + role GESTOR (fecha uma falha de IDOR real).
2. `SecurityConfig.java` — header `X-Frame-Options`/frame-options (proteção contra clickjacking).

## 6. Confirmação de que nada quebrou

- `node --check` passou em todos os arquivos JS tocados (`utils.js`, `banda.js`, `perfil-musico.js`, `perfil-gestor.js`, `global.js`, `financeiro-dashboard.js`, `recuperarSenha.js`, `configurar-banda.js`).
- Backend: `mvnw clean compile` sem erros; boot completo contra um Postgres descartável via Docker — as 8 migrations do Flyway aplicaram normalmente, Hibernate validou o schema (`ddl-auto=validate`) sem divergências, a cadeia de segurança (incluindo o novo header) carregou, e a aplicação respondeu a requisições reais (`/api/auth/login` retornou 401 para credenciais inválidas, como esperado).
- Todas as correções de XSS/autorização foram feitas por adição de escape/guard clauses, sem remover, renomear ou reestruturar nenhuma função, id, classe ou rota existente.

## 7. Problemas que não puderam/foram propositalmente não resolvidos agora

- **`verificar.html` — link "Reenviar código" morto**: não existe endpoint de reenvio de código no backend; não foi implementado por estar fora do escopo de uma correção pontual (exigiria uma nova funcionalidade de backend). Recomenda-se como trabalho futuro.
- **Permissão granular por módulo (`PermissaoMembro`) a nível de API**: `FinanceiroService`/`MusicaService` hoje validam apenas "é membro da banda", não a permissão específica do módulo (financeiro/repertório) já modelada no sistema de convites. Ampliar isso é uma mudança de escopo maior (feature, não bugfix pontual) — recomendado como trabalho futuro, não implementado agora.
- **Divisão de arquivos grandes (`banda.js`, `perfil-musico.js`)**: identificada duplicação de código considerável entre `perfil-musico.js`/`perfil-gestor.js` (toggleSenha, showSnackbar, getInitials, máscara de WhatsApp, carregarEstados/Cidades, blocos de alterar-senha/excluir-conta) e funções grandes demais (`DOMContentLoaded` de ambos os arquivos, `carregarFinanceiro`). Não foi refatorado agora por ser uma mudança estrutural grande, fora do pedido de "só corrigir o necessário" — recomendado como trabalho futuro (ex.: extrair para um `scripts/perfil-shared.js`).

## 8. Recomendações futuras de segurança e manutenção

1. Implementar um endpoint real de reenvio de código de verificação e ligar o link em `verificar.html`.
2. Elevar a checagem de `FinanceiroService`/`MusicaService` de "membro da banda" para a permissão granular por módulo já existente em `PermissaoMembro`.
3. Extrair a lógica duplicada entre `perfil-musico.js` e `perfil-gestor.js` para um script compartilhado, reduzindo o risco de as duas cópias divergirem (já ocorreu: `showSnackbar` tinha implementações levemente diferentes).
4. Considerar quebrar o `DOMContentLoaded` monolítico de `banda.js`/`perfil-musico.js` em módulos menores por funcionalidade (agenda, financeiro, vagas, perfil) para facilitar manutenção e testes.
5. Content-Security-Policy mais completa (hoje só `frame-ancestors`) — por exemplo restringir `script-src`/`style-src` — pode ser adicionada de forma incremental, testando cada página antes.
6. Adicionar testes automatizados (hoje o projeto não tem suíte de testes); mesmo um conjunto básico de testes de integração no backend teria pego o bug de payload de vaga corrigido na sessão anterior mais cedo.

---

**Verificação end-to-end recomendada para o usuário testar manualmente**: login/cadastro, toggles de senha (login/cadastro/redefinir/perfil), link "Esqueceu a senha", popup de sucesso pós-login, edição de perfil (músico e gestor), criação de banda como MUSICO (deve dar 403) e como GESTOR (deve funcionar normalmente), envio/aceite de convite, aprovar/rejeitar candidatura, alterar senha (deve mostrar só uma mensagem, não duas), excluir conta, e inspecionar o console do navegador em cada tela (não deve haver erros novos).
