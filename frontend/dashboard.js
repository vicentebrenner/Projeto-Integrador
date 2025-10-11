document.addEventListener('DOMContentLoaded', function() {
    // 1. Verifica se o usuário está logado
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        window.location.href = 'login.html';
        return; 
    }
    
    // 2. Personaliza a mensagem de boas-vindas
    const nomeUsuarioElement = document.getElementById('nomeUsuario');
    const mensagemBoasVindasElement = document.getElementById('mensagemBoasVindas');

    try {
        const usuarioLogado = JSON.parse(usuarioLogadoString);
        if (usuarioLogado && usuarioLogado.nome && nomeUsuarioElement) {
            const primeiroNome = usuarioLogado.nome.split(' ')[0];
            
            // 3. Verifica se é o primeiro acesso
            const primeiroAcesso = localStorage.getItem('primeiroAcesso');

            if (primeiroAcesso === 'true' && mensagemBoasVindasElement) {
                // Se for, mostra a mensagem de primeiro acesso
                mensagemBoasVindasElement.innerHTML = `Seja bem-vindo(a), <span id="nomeUsuario">${primeiroNome}</span>!`;
                // E remove a flag para não mostrar novamente
                localStorage.removeItem('primeiroAcesso');
            } else {
                // Se não, mantém a mensagem padrão de "bem-vindo de volta"
                nomeUsuarioElement.textContent = primeiroNome;
            }
        }
    } catch (e) {
        console.error("Erro ao analisar dados do usuário logado:", e);
    }
});