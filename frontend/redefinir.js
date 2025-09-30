document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const mensagemErroElemento = document.getElementById('mensagemErroRedefinicao');

    const mostrarErro = (mensagem) => {
        if (mensagemErroElemento) {
            mensagemErroElemento.textContent = mensagem;
            mensagemErroElemento.classList.add('visivel');
        }
    };

    if (!token) {
        mostrarErro('Erro: Link de redefinição inválido ou ausente.');
        if (form) form.style.display = 'none';
        return;
    }

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const novaSenha = document.getElementById('novaSenha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;
            
            if (mensagemErroElemento) mensagemErroElemento.classList.remove('visivel');

            if (novaSenha !== confirmarSenha) {
                mostrarErro('As senhas não coincidem.');
                return;
            }
            if (novaSenha.length < 6) {
                mostrarErro('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token,
                        novaSenha: novaSenha
                    })
                });

                const mensagem = await response.text();

                if (response.ok) {
                    alert('Senha redefinida com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    mostrarErro(mensagem || 'Ocorreu um erro ao redefinir a senha.');
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            }
        });
    }
});