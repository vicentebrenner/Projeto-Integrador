document.addEventListener('DOMContentLoaded', function () {

    // --- CÓDIGO DO OLHINHO (NOVO) ---
    // Ativa a função para o campo de Senha
    if (typeof setupPasswordToggle === 'function') {
        setupPasswordToggle('senha', 'toggleSenha');
    }
    // --------------------------------

    // --- LÓGICA DAS ABAS (Mantida) ---
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(item => item.classList.remove('ativo'));
            contents.forEach(item => item.classList.remove('ativo'));
            const target = document.getElementById(this.dataset.tab);
            this.classList.add('ativo');
            if (target) target.classList.add('ativo');
        });
    });

    // --- DADOS DE EXEMPLO (Mantido) ---
    // ... (Seu código original de dados aqui, se houver) ...
    // Vou incluir a parte do formulário de cadastro que é o principal desta página

    const formCadastro = document.getElementById('formCadastro');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const erroGeral = document.getElementById('mensagemErroCadastro');
    const tipoUsuarioInput = document.getElementById('tipoUsuario');

    // --- SELEÇÃO DE TIPO DE CONTA ---
    const roleOptions = document.querySelectorAll('.role-option');
    if (roleOptions && tipoUsuarioInput) {
        roleOptions.forEach(option => {
            option.addEventListener('click', function () {
                roleOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                tipoUsuarioInput.value = this.dataset.role;
            });
        });
    }

    // Função auxiliar para mostrar erro
    const mostrarErro = (elementoId, mensagem) => {
        const el = document.getElementById(elementoId);
        if (el) {
            el.textContent = mensagem;
            el.classList.add('visivel');
        }
    };

    const limparErros = () => {
        document.querySelectorAll('.mensagemErro').forEach(el => {
            el.textContent = '';
            el.classList.remove('visivel');
        });
    };

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function (event) {
            event.preventDefault();
            limparErros();

            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const senha = senhaInput.value;
            const tipoUsuario = tipoUsuarioInput ? tipoUsuarioInput.value : 'MUSICO';
            let temErro = false;

            // Validações básicas
            if (!nome) { mostrarErro('erroNome', 'Nome é obrigatório.'); temErro = true; }
            if (!email) { mostrarErro('erroEmail', 'E-mail é obrigatório.'); temErro = true; }
            if (senha.length < 6) { mostrarErro('erroSenha', 'A senha deve ter no mínimo 6 caracteres.'); temErro = true; }

            if (temErro) return;
            try {
                const response = await fetch(getApiUrl('/api/auth/register'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, tipoUsuario })
                });

                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                if (response.ok) {
                    // Tenta fazer login automático pós-cadastro
                    try {
                        const loginResponse = await fetch(getApiUrl('/api/auth/login'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, senha })
                        });

                        let loginData;
                        const loginContentType = loginResponse.headers.get('content-type');
                        if (loginContentType && loginContentType.includes('application/json')) {
                            loginData = await loginResponse.json();
                        } else {
                            loginData = await loginResponse.text();
                        }

                        if (loginResponse.ok) {
                            const usuarioParaSalvar = {
                                id: loginData.id,
                                nome: loginData.nome,
                                tipoUsuario: loginData.role
                            };

                            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
                            localStorage.setItem('authToken', loginData.token);

                            showSuccessPopup('Cadastro realizado com sucesso!', () => {
                                if (usuarioParaSalvar.tipoUsuario === 'GESTOR') {
                                    window.location.href = 'dashboard.html';
                                } else {
                                    window.location.href = 'perfil-musico.html';
                                }
                            });
                            return;
                        }
                    } catch (loginErr) {
                        console.error('Erro no login automático pós-cadastro:', loginErr);
                    }

                    // Caso o login automático falhe, redireciona para a tela de login como fallback
                    showSuccessPopup('Cadastro realizado com sucesso! Faça login.', () => {
                        window.location.href = 'login.html';
                    });
                } else {
                    const msg = (data && typeof data === 'object') ? (data.message || 'Erro ao cadastrar.') : (data || 'Erro ao cadastrar.');
                    mostrarErro('mensagemErroCadastro', msg);
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                mostrarErro('mensagemErroCadastro', 'Erro de conexão com o servidor.');
            }
        });
    }
});