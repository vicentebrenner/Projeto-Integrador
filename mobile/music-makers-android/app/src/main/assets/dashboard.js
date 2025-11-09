document.addEventListener('DOMContentLoaded', function() {

    // --- INÍCIO DA MUDANÇA (PASSO 4) ---

    // 1. Verifica se a "Ponte" (Android) existe
    if (typeof Android === "undefined" || typeof Android.getNomeUsuario !== "function") {
        alert("Erro fatal: Interface nativa (Android) não encontrada.");
        return;
    }

    // 2. Busca o nome do usuário direto do Kotlin (nativo)
    const nomeCompleto = Android.getNomeUsuario();

    if (!nomeCompleto) {
        // Se não há nome, o WebFragment deveria ter barrado
        // o carregamento do dashboard.
        alert("Sessão inválida. Por favor, reinicie o app.");
        return;
    }

    // 3. Personaliza a mensagem de boas-vindas
    const nomeUsuarioElement = document.getElementById('nomeUsuario');
    const mensagemBoasVindasElement = document.getElementById('mensagemBoasVindas');

    try {
        const primeiroNome = nomeCompleto.split(' ')[0];

        // NOTA: A lógica de "primeiroAcesso" foi removida,
        // pois o login nativo não define 'localStorage.setItem("primeiroAcesso", "true")'.
        // Estamos usando uma saudação direta.

        if (mensagemBoasVindasElement) {
            // Se o seu HTML tem <h2 id="mensagemBoasVindas">...</h2>
            // Esta linha vai preenchê-lo
            mensagemBoasVindasElement.innerHTML = `Bem-vindo(a), <span id="nomeUsuario">${primeiroNome}</span>!`;

        } else if (nomeUsuarioElement) {
            // Se o seu HTML só tem o <span id="nomeUsuario">...</span>
            // Esta linha vai preenchê-lo
            nomeUsuarioElement.textContent = primeiroNome;
        }

    } catch (e) {
        console.error("Erro ao processar nome do usuário:", e);
    }

    // --- FIM DA MUDANÇA (PASSO 4) ---


    // ==========================================================
    // IMPORTANTE:
    // Qualquer função de 'fetch' (busca de dados) que você
    // adicionar abaixo DEVE usar o token da "Ponte":
    //
    // Exemplo:
    // const token = Android.getAuthToken();
    // fetch('/api/minha-banda', {
    //     headers: { 'Authorization': `Bearer ${token}` }
    // }).then(...)
    // ==========================================================

});