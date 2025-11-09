document.addEventListener('DOMContentLoaded', function() {

    // --- INÍCIO DA MUDANÇA (PASSO 4) ---

    // 1. Verifica se a "Ponte" (Android) existe
    if (typeof Android === "undefined" || typeof Android.getNomeUsuario !== "function") {
        // Se a ponte não existe, provavelmente estamos no index.html
        // ou o app está com erro. Não faz nada.
        console.warn("Interface Android não disponível (esperado no index.html)");
        return;
    }

    // 2. Busca o nome do usuário direto do Kotlin (nativo)
    const nomeCompleto = Android.getNomeUsuario();
    const menuPrincipalUl = document.querySelector('.menuPrincipal ul');

    // 3. Se o nome existir (usuário está logado), modifica o menu
    if (nomeCompleto && menuPrincipalUl) {
        // Remove o botão "Login"
        const btnLoginAntigo = document.querySelector('.btnLogin');
        if (btnLoginAntigo) {
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
        const btnLogout = document.getElementById('btnLogout');

        // Listener para abrir/fechar o menu
        perfilIcone.addEventListener('click', () => {
            perfilDropdown.classList.toggle('ativo');
        });

        // Listener do BOTÃO "SAIR" (LOGOUT)
        btnLogout.addEventListener('click', (event) => {
            event.preventDefault();

            // --- MUDANÇA CRÍTICA ---
            // Em vez de limpar o localStorage, chama o Kotlin
            if (typeof Android.fazerLogout === "function") {
                Android.fazerLogout();
            } else {
                alert("Erro ao sair [Interface nativa não encontrada]");
            }
        });

        // Listener para fechar o menu ao clicar fora
        window.addEventListener('click', function(event) {
            if (!perfilIcone.contains(event.target) && !perfilDropdown.contains(event.target)) {
                perfilDropdown.classList.remove('ativo');
            }
        });

    }
    // Se não houver 'nomeCompleto', o usuário não está logado,
    // e o menu (com o botão "Login") continua como está.

    // --- FIM DA MUDANÇA (PASSO 4) ---
});