document.addEventListener('DOMContentLoaded', function() {
    // 1. Verifica se o usuário está logado
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    const nomeUsuarioElement = document.getElementById('nomeUsuario');

    if (!usuarioLogadoString) {
        // Se não houver usuário logado, redireciona para a página de login
        window.location.href = 'login.html';
        return; 
    }
    
    // 2. Personaliza a mensagem de boas-vindas
    try {
        const usuarioLogado = JSON.parse(usuarioLogadoString);
        if (usuarioLogado && usuarioLogado.nome && nomeUsuarioElement) {
            // Exibe apenas o primeiro nome
            const primeiroNome = usuarioLogado.nome.split(' ')[0];
            nomeUsuarioElement.textContent = primeiroNome;
        }
    } catch (e) {
        console.error("Erro ao analisar dados do usuário logado:", e);
    }
    
    // *O global.js já cuida da remoção do botão "Login" e adição do ícone de Perfil no cabeçalho.
});