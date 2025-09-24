document.addEventListener('DOMContentLoaded', function() {
    const formVerificacao = document.getElementById('formVerificacao');
    if (!formVerificacao) {
        console.error('O formulário de verificação não foi encontrado.');
        return;
    }

    const codigoInput = document.getElementById('codigo');
    const mensagemErroVerificacao = document.getElementById('mensagemErroVerificacao');
    
    const email = localStorage.getItem('emailParaVerificacao');

    if (!email) {
        mostrarErro('E-mail para verificação não encontrado. Por favor, tente se cadastrar novamente.');
        return;
    }

    const mostrarErro = (mensagem) => {
        if (mensagemErroVerificacao) {
            mensagemErroVerificacao.textContent = mensagem;
            mensagemErroVerificacao.classList.add('visivel');
        }
    };

    formVerificacao.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const codigo = codigoInput.value;
        if (!codigo || codigo.length !== 6) {
            mostrarErro('Por favor, insira um código válido de 6 dígitos.');
            return;
        }

        const apiUrl = `http://localhost:8080/auth/verify-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(codigo)}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                alert('Conta verificada com sucesso!');
                localStorage.removeItem('emailParaVerificacao');
                window.location.href = 'login.html';
            } else {
                const errorText = await response.text();
                mostrarErro(errorText || 'Código de verificação inválido.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            mostrarErro('Não foi possível conectar ao servidor.');
        }
    });
});