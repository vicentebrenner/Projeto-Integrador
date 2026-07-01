document.addEventListener('DOMContentLoaded', function () {

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

    const mostrarErro = (mensagem) => {
        if (erroLogin) {
            erroLogin.textContent = mensagem;
            erroLogin.classList.add('visivel');
        }
    };

    formLogin.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (erroLogin) erroLogin.classList.remove('visivel');

        const email = emailInput.value;
        const senha = senhaInput.value;

        if (!email || !senha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }

        try {
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
                const usuarioParaSalvar = {
                    id: data.id,
                    nome: data.nome,
                    email: email,
                    corAvatar: data.corAvatar || null,
                    
                    tipoUsuario: data.role,
                    membroId: data.membroId || null,
                    bandaId: data.bandaId || null,
                    gestor: data.gestor || false
                };

                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('primeiroAcesso', 'true');

                // Verifica se o usuário já configurou o perfil anteriormente
                try {
                    const perfilRes = await fetch(getApiUrl(`/api/musicos/usuario/${data.id}`), {
                        headers: { 'Authorization': `Bearer ${data.token}` }
                    });
                    if (perfilRes.ok) {
                        const perfilData = await perfilRes.json();
                        // Verifica se o perfil tem dados reais (localizacao preenchida)
                        if (perfilData.localizacao && perfilData.localizacao.trim() !== '') {
                            localStorage.setItem('perfilConfigurado', 'true');
                        } else {
                            // Usuário GESTOR sem perfilMusico
                            localStorage.setItem('perfilConfigurado', data.bandaId ? 'true' : 'false');
                        }
                        // Atualizar corAvatar no localStorage com o valor real do banco
                        if (perfilData.corAvatar) {
                            usuarioParaSalvar.corAvatar = perfilData.corAvatar;
                            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
                        }
                    } else {
                        localStorage.setItem('perfilConfigurado', data.bandaId ? 'true' : 'false');
                    }
                } catch (perfilErr) {
                    console.warn('Não foi possível verificar perfil:', perfilErr);
                    localStorage.setItem('perfilConfigurado', data.bandaId ? 'true' : 'false');
                }

                showSuccessPopup('Login realizado com sucesso!', () => {
                    window.location.href = 'index.html';
                });
            } else {
                const mensagemErro = (data && typeof data === 'object') ? (data.message || 'Erro ao realizar login') : (data || 'Erro ao realizar login');
                mostrarErro(mensagemErro);
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            mostrarErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});
