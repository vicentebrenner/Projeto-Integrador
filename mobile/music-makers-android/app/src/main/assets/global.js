// APAGUE TUDO DO SEU global.js E COLE ESTE CÓDIGO:

document.addEventListener('DOMContentLoaded', function() {

    // --- INÍCIO: LÓGICA DO MENU DE PERFIL (NATIVO) ---

    // 1. Verifica se a "Ponte" (Android) existe
    if (typeof Android !== "undefined" && typeof Android.getNomeUsuario === "function") {
        
        // 2. Busca o nome do usuário direto do Kotlin (nativo)
        const nomeCompleto = Android.getNomeUsuario();
        const menuPrincipalUl = document.querySelector('.menuPrincipal ul');

        // 3. Se o nome existir (usuário está logado), modifica o menu
        if (nomeCompleto && menuPrincipalUl) {
            
            // Remove o botão "Login" antigo (se existir)
            const btnLoginAntigo = document.querySelector('.btnLogin');
            if (btnLoginAntigo && btnLoginAntigo.id !== "btn-logout-musico") {
                btnLoginAntigo.parentElement.remove();
            }

            // Prepara os dados do usuário
            const inicial = nomeCompleto.charAt(0).toUpperCase();
            const primeiroNome = nomeCompleto.split(' ')[0];

            // Cria o novo menu de perfil
            const perfilLi = document.createElement('li');
            perfilLi.classList.add('perfil-container');

            perfilLi.innerHTML = `
                <div class="perfil-icone" id="perfilIcone">${inicial}</div>
                <div class="perfil-dropdown" id="perfilDropdown">
                    <p>Olá, ${primeiroNome}!</p>
                    <hr>
                    <a href="#" id="btnLogout">Sair</a>
                </div>
            `;

            menuPrincipalUl.appendChild(perfilLi);

            // --- Adiciona os 'listeners' (ouvintes) ---
            const perfilIcone = document.getElementById('perfilIcone');
            const perfilDropdown = document.getElementById('perfilDropdown');
            const btnLogout = document.getElementById('btnLogout'); // Botão do menu novo

            if (perfilIcone) {
                perfilIcone.addEventListener('click', () => {
                    perfilDropdown.classList.toggle('ativo');
                });
            }

            // Listener do BOTÃO "SAIR" (do menu novo)
            if (btnLogout) {
                btnLogout.addEventListener('click', (event) => {
                    event.preventDefault();
                    
                    if (typeof Android.fazerLogout === "function") {
                        Android.fazerLogout();
                    } else {
                        alert("Erro ao sair [Interface nativa não encontrada]");
                    }
                });
            }

            // Listener para fechar o menu ao clicar fora
            window.addEventListener('click', function(event) {
                if (perfilIcone && !perfilIcone.contains(event.target) && perfilDropdown && !perfilDropdown.contains(event.target)) {
                    perfilDropdown.classList.remove('ativo');
                }
            });
        }
    } else {
        console.warn("Interface Android não disponível.");
    }

    // --- FIM: LÓGICA DO MENU DE PERFIL ---


    // --- INÍCIO: LÓGICA DE LOGOUT (Botão da página perfil-musico.html) ---
    
    // Procura o botão "Sair" (da página perfil-musico.html)
    const btnLogoutMusico = document.getElementById("btn-logout-musico");
    
    if (btnLogoutMusico) {
        btnLogoutMusico.addEventListener("click", function(event) {
            event.preventDefault(); 

            if (typeof Android.fazerLogout === "function") {
                Android.fazerLogout();
            } else {
                alert("Erro ao sair [Interface nativa não encontrada]");
            }
        });
    }

    // --- FIM: LÓGICA DE LOGOUT ---

    // =================================================================
    // NÃO DEVE EXISTIR NENHUM CÓDIGO DE REDIRECIONAMENTO
    // (if localStorage.getItem...) AQUI EMBAIXO
    // =================================================================

});