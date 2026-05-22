document.addEventListener('DOMContentLoaded', function() {
    
    // --- CÓDIGO DO OLHINHO ---
    // Verifica se a função existe (carregada do utils.js) e a executa
    if (typeof setupPasswordToggle === 'function') {
        setupPasswordToggle('senha', 'toggleSenha');
    }

    const formLogin = document.getElementById('formLogin');
    if (!formLogin) {
        console.error('O formulário de login não foi encontrado.');
        return;
    }

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const erroLogin = document.getElementById('erroLogin');

    // Função para mostrar mensagens de erro
    const mostrarErro = (mensagem) => {
        if (erroLogin) {
            erroLogin.textContent = mensagem;
            erroLogin.classList.add('visivel');
        }
    };

    formLogin.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário
        
        // Limpa erros anteriores
        if (erroLogin) erroLogin.classList.remove('visivel');

        const email = emailInput.value;
        const senha = senhaInput.value;

        // Validação simples no frontend
        if (!email || !senha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Faz a requisição para a API de login no backend
            const response = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (response.ok) {
                // Se o login for bem-sucedido (status 200 OK)
                // O backend retorna dados soltos (token, id, nome, role).
                // Precisamos criar o objeto 'usuario' manualmente para salvar no localStorage.
                const usuarioParaSalvar = {
                    id: data.id,
                    nome: data.nome,
                    tipoUsuario: data.role
                };

                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
                localStorage.setItem('authToken', data.token);

                showSuccessPopup('Login realizado com sucesso!', () => {
                    // Redireciona conforme o tipo de usuário (Músico -> perfil-musico.html, Gestor -> dashboard.html)
                    if (usuarioParaSalvar.tipoUsuario === 'GESTOR') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'perfil-musico.html';
                    }
                });
            } else {
                // Se houver erro (status 401, 403, etc.)
                const mensagemErro = (data && typeof data === 'object') ? (data.message || 'Erro ao realizar login') : (data || 'Erro ao realizar login'); 
                mostrarErro(mensagemErro);
            }
        } catch (error) {
            // Erro de rede ou conexão (ex: backend desligado)
            console.error('Erro na requisição de login:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});