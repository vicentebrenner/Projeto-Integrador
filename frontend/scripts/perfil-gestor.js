document.addEventListener('DOMContentLoaded', function () {

    // --- VERIFICA LOGIN E PERMISSÃO ---
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
        return;
    }

    const usuarioLogado = JSON.parse(usuarioLogadoString);
    if (usuarioLogado && usuarioLogado.tipoUsuario !== 'GESTOR') {
        window.location.href = 'perfil-musico.html'; // Redireciona músico para o perfil dele
        return;
    }

    // --- DADOS DO PERFIL (Integrado com API) ---
    let dadosPerfil = {
        nome: usuarioLogado.nome || "Gestor",
        whatsapp: "",
        email: usuarioLogado.email || "",
        corAvatar: "#fa9848",
        estado: "",
        cidade: "",
        nomeProdutora: "",
        tempoExperienciaGestao: "",
        generosMusicais: "",
        bio: "",
        linksProfissionais: ""
    };

    function inicializarPerfil() {
        const token = localStorage.getItem('authToken');
        fetch(getApiUrl(`/api/gestores/usuario/${usuarioLogado.id}`), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) {
                    const erroAuth = new Error("Sessão expirada");
                    erroAuth.status = 401;
                    throw erroAuth;
                }
                if (!res.ok) throw new Error("Perfil não encontrado");
                return res.json();
            })
            .then(data => {
                dadosPerfil.nome = data.nome || dadosPerfil.nome;
                dadosPerfil.email = data.email || dadosPerfil.email;
                dadosPerfil.whatsapp = data.whatsapp || "";
                dadosPerfil.corAvatar = data.corAvatar || "#fa9848";
                dadosPerfil.estado = data.estado || "";
                dadosPerfil.cidade = data.cidade || "";
                dadosPerfil.nomeProdutora = data.nomeProdutora || "";
                dadosPerfil.tempoExperienciaGestao = data.tempoExperienciaGestao || "";
                dadosPerfil.generosMusicais = data.generosMusicais || "";
                dadosPerfil.bio = data.bio || "";
                dadosPerfil.linksProfissionais = data.linksProfissionais || "";

                carregarPerfil();
            })
            .catch(err => {
                if (err && err.status === 401) {
                    showSnackbar('Sua sessão expirou. Faça login novamente.', 'error');
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('authToken');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                    return;
                }
                console.warn(err);
                showSnackbar('Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.', 'error');
                carregarPerfil();
            });
    }

    function salvarDados() {
        const dto = {
            nome: dadosPerfil.nome,
            corAvatar: dadosPerfil.corAvatar,
            whatsapp: dadosPerfil.whatsapp,
            estado: dadosPerfil.estado,
            cidade: dadosPerfil.cidade,
            nomeProdutora: dadosPerfil.nomeProdutora,
            tempoExperienciaGestao: dadosPerfil.tempoExperienciaGestao,
            generosMusicais: dadosPerfil.generosMusicais,
            bio: dadosPerfil.bio,
            linksProfissionais: dadosPerfil.linksProfissionais
        };

        const token = localStorage.getItem('authToken');
        fetch(getApiUrl(`/api/gestores/usuario/${usuarioLogado.id}/completo`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dto)
        })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || "Falha ao salvar no servidor");
                }
                return res.json();
            })
            .then(data => {
                // ATUALIZAR INTERFACE (COR DO AVATAR NA NAVBAR)
                const navIcone = document.getElementById('perfilIcone');
                if (navIcone) {
                    navIcone.style.backgroundColor = dadosPerfil.corAvatar;
                }

                // ATUALIZAR LOCAL STORAGE PARA PERSISTIR A COR NAS OUTRAS PÁGINAS
                usuarioLogado.corAvatar = dadosPerfil.corAvatar;
                usuarioLogado.nome = dadosPerfil.nome;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

                // MARCAR QUE O PERFIL FOI CONFIGURADO (usado no index.html para redirecionar corretamente)
                localStorage.setItem('perfilConfigurado', 'true');

                showSnackbar("Perfil salvo com sucesso!");

                // REDIRECIONAR: se ainda não tem banda, vai configurar; se já tem, vai pro painel
                const destino = (usuarioLogado.bandaId === null || usuarioLogado.bandaId === undefined)
                    ? 'configurar-banda.html'
                    : 'banda.html';

                setTimeout(() => {
                    window.location.href = destino;
                }, 1000);
            })
            .catch(err => {
                console.error(err);
                showSnackbar(err.message || "Erro ao salvar perfil.", 'error');
            });
    }

    // --- LÓGICA DAS ABAS ---
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

    // --- FUNÇÃO DE NOTIFICAÇÃO (Snackbar) ---
    function showSnackbar(message, type = 'success') {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            const isError = type === 'error';
            const iconColor = isError ? '#e74c3c' : '#28a745';
            const svgPath = isError
                ? '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>' // Red X
                : '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>'; // Green check

            snackbar.style.borderLeftColor = iconColor;

            snackbar.innerHTML = `
                <div class="snackbar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${iconColor}" viewBox="0 0 16 16">
                        ${svgPath}
                    </svg>
                </div>
                <div class="snackbar-text">${message}</div>
                <button class="snackbar-close" onclick="document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace('show', '')">&times;</button>
            `;
            snackbar.className = "show";
            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        } else {
            console.warn("Elemento snackbar não encontrado!");
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    // Gera iniciais do nome
    function getInitials(name) {
        if (!name) return "MM";
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Atualiza a visualização do Avatar
    function atualizarAvatarView() {
        const initials = getInitials(dadosPerfil.nome);
        document.getElementById('avatarInitials').textContent = initials;
        document.getElementById('avatarPreview').style.backgroundColor = dadosPerfil.corAvatar;

        // Atualiza a cor selecionada nos swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (swatch.dataset.color === dadosPerfil.corAvatar) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });
    }

    // Carrega dados do perfil no formulário
    function carregarPerfil() {
        document.getElementById('perfilNome').value = dadosPerfil.nome;
        if (document.getElementById("perfilWhatsapp")) document.getElementById("perfilWhatsapp").value = dadosPerfil.whatsapp || "";

        if (dadosPerfil.estado) {
            const selectEstado = document.getElementById('perfilEstado');
            const checkInterval = setInterval(() => {
                if (selectEstado && selectEstado.options.length > 1) {
                    selectEstado.value = dadosPerfil.estado;
                    carregarCidades(dadosPerfil.estado, dadosPerfil.cidade);
                    clearInterval(checkInterval);
                }
            }, 100);
        }

        if (document.getElementById('perfilNomeProdutora')) document.getElementById('perfilNomeProdutora').value = dadosPerfil.nomeProdutora || '';
        if (document.getElementById('perfilTempoExperienciaGestao')) document.getElementById('perfilTempoExperienciaGestao').value = dadosPerfil.tempoExperienciaGestao || '';

        const generosSalvos = dadosPerfil.generosMusicais || '';
        const genrePillsContainer = document.getElementById('genrePillsContainer');
        const inputGeneros = document.getElementById('perfilGeneros');
        if (genrePillsContainer) {
            const arr = generosSalvos.split(',').map(s => s.trim());
            const pills = genrePillsContainer.querySelectorAll('.genre-pill');
            pills.forEach(pill => {
                if (arr.includes(pill.getAttribute('data-value'))) {
                    pill.classList.add('selected');
                } else {
                    pill.classList.remove('selected');
                }
            });
            if (inputGeneros) inputGeneros.value = generosSalvos;
        }

        document.getElementById('perfilBio').value = dadosPerfil.bio || '';
        if (document.getElementById('perfilLinksProfissionais')) document.getElementById('perfilLinksProfissionais').value = dadosPerfil.linksProfissionais || '';

        // Conta e Segurança
        const emailInput = document.getElementById('contaEmail');
        if (emailInput) emailInput.value = dadosPerfil.email || '';

        atualizarAvatarView();
    }

    // --- EVENTOS DE FORMULÁRIO E CLIQUES ---

    // Avatar Color Picker
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function () {
            dadosPerfil.corAvatar = this.dataset.color;
            atualizarAvatarView();
        });
    });

    // Atualizar Iniciais ao digitar o nome
    const inputNome = document.getElementById('perfilNome');
    if (inputNome) {
        inputNome.addEventListener('input', function () {
            dadosPerfil.nome = this.value;
            atualizarAvatarView();
        });
    }

    // Máscara para WhatsApp / Telefone
    const inputWhatsapp = document.getElementById('perfilWhatsapp');
    if (inputWhatsapp) {
        inputWhatsapp.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    // Lógica de Pílulas (Gêneros Musicais)
    const genrePillsContainer = document.getElementById('genrePillsContainer');
    const inputGeneros = document.getElementById('perfilGeneros');

    if (genrePillsContainer) {
        genrePillsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('genre-pill')) {
                e.target.classList.toggle('selected');

                const selectedPills = genrePillsContainer.querySelectorAll('.genre-pill.selected');
                const selectedValues = Array.from(selectedPills).map(pill => pill.getAttribute('data-value'));
                if (inputGeneros) inputGeneros.value = selectedValues.join(', ');
            }
        });
    }

    // Salvar o formulário de Perfil Geral
    const formPerfil = document.getElementById('formPerfilGestor');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            dadosPerfil.nome = document.getElementById('perfilNome').value;
            if (document.getElementById("perfilWhatsapp")) dadosPerfil.whatsapp = document.getElementById("perfilWhatsapp").value;
            const uf = document.getElementById('perfilEstado').value;
            const cidade = document.getElementById('perfilCidade').value;
            dadosPerfil.estado = uf;
            dadosPerfil.cidade = cidade;

            if (document.getElementById('perfilNomeProdutora')) dadosPerfil.nomeProdutora = document.getElementById('perfilNomeProdutora').value;
            if (document.getElementById('perfilTempoExperienciaGestao')) dadosPerfil.tempoExperienciaGestao = document.getElementById('perfilTempoExperienciaGestao').value;

            dadosPerfil.generosMusicais = document.getElementById('perfilGeneros').value;

            dadosPerfil.bio = document.getElementById('perfilBio').value;
            if (document.getElementById('perfilLinksProfissionais')) dadosPerfil.linksProfissionais = document.getElementById('perfilLinksProfissionais').value;

            salvarDados();
        });
    }

    // --- LÓGICA DE ESTADOS E CIDADES (IBGE) ---
    const selectEstado = document.getElementById('perfilEstado');
    const selectCidade = document.getElementById('perfilCidade');

    async function carregarEstados() {
        if (!selectEstado) return;
        try {
            const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
            const estados = await res.json();
            estados.forEach(uf => {
                const option = document.createElement('option');
                option.value = uf.sigla;
                option.textContent = uf.nome;
                selectEstado.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
        }
    }

    async function carregarCidades(uf, cidadeSelecionada = null) {
        if (!selectCidade || !uf) return;
        selectCidade.innerHTML = '<option value="">Carregando...</option>';
        selectCidade.disabled = true;
        try {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
            const cidades = await res.json();
            selectCidade.innerHTML = '<option value="">Selecione a cidade...</option>';
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                selectCidade.appendChild(option);
            });
            selectCidade.disabled = false;

            if (cidadeSelecionada) {
                selectCidade.value = cidadeSelecionada;
            }
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
            selectCidade.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    if (selectEstado) {
        selectEstado.addEventListener('change', (e) => {
            const uf = e.target.value;
            if (uf) {
                carregarCidades(uf);
            } else {
                selectCidade.innerHTML = '<option value="">Selecione o estado primeiro...</option>';
                selectCidade.disabled = true;
            }
        });
        carregarEstados();
    }

    // --- INICIALIZAÇÃO ---
    inicializarPerfil();

    // --- LÓGICA DE EXCLUSÃO DE CONTA ---
    const btnExcluirConta = document.getElementById("btnExcluirConta");
    const modalExcluirConta = document.getElementById("modalExcluirConta");
    const closeModalExcluir = document.getElementById("closeModalExcluir");
    const cancelarExclusaoBtn = document.getElementById("cancelarExclusaoBtn");
    const formExcluirConta = document.getElementById("formExcluirConta");

    let cacheSenhaExclusao = '';

    const fecharModalExcluir = () => {
        modalExcluirConta.style.display = "none";
        if (formExcluirConta) formExcluirConta.reset();
        cacheSenhaExclusao = '';
    };

    if (btnExcluirConta && modalExcluirConta) {
        btnExcluirConta.addEventListener("click", () => {
            modalExcluirConta.style.display = "block";
        });

        closeModalExcluir.addEventListener("click", fecharModalExcluir);
        if (cancelarExclusaoBtn) cancelarExclusaoBtn.addEventListener("click", fecharModalExcluir);

        // Cache do campo de senha (mesmo fix do Chrome)
        const senhaExclusaoInput = document.getElementById("senhaExclusao");
        if (senhaExclusaoInput) {
            senhaExclusaoInput.addEventListener('input', e => cacheSenhaExclusao = e.target.value);
        }

        window.addEventListener("click", (e) => {
            if (e.target === modalExcluirConta) {
                fecharModalExcluir();
            }
        });

        formExcluirConta.addEventListener("submit", async (e) => {
            e.preventDefault();
            const senha = document.getElementById("senhaExclusao").value || cacheSenhaExclusao;

            if (!senha) {
                showSnackbar('Por favor, informe sua senha para confirmar a exclusão.', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(getApiUrl(`/api/usuarios/${usuarioLogado.id}`), {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ senha })
                });

                if (response.ok) {
                    fecharModalExcluir();
                    showSnackbar('Conta excluída com sucesso.', 'success');
                    setTimeout(() => {
                        localStorage.removeItem('usuarioLogado');
                        localStorage.removeItem('authToken');
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    const errorText = await response.text();
                    if (response.status === 401 || (errorText && errorText.includes('incorreta'))) {
                        showSnackbar('Senha incorreta. Tente novamente.', 'error');
                    } else if (response.status === 404) {
                        showSnackbar('Conta não encontrada. Tente fazer login novamente.', 'error');
                    } else if (response.status >= 500) {
                        showSnackbar('Erro no servidor. Pode haver dados vinculados (bandas). Tente novamente.', 'error');
                    } else {
                        showSnackbar('Não foi possível excluir a conta. Tente novamente.', 'error');
                    }
                }
            } catch (error) {
                console.error("Erro ao excluir conta:", error);
                showSnackbar('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
            }
        });
    }

    // --- ALTERAR SENHA ---
    const formContaSenha = document.getElementById('formContaSenha');
    if (formContaSenha) {
        let cacheSenhaAtual = '';
        let cacheNovaSenha = '';
        let cacheConfirmaSenha = '';

        document.getElementById('senhaAtual').addEventListener('input', e => cacheSenhaAtual = e.target.value);
        document.getElementById('novaSenha').addEventListener('input', e => cacheNovaSenha = e.target.value);
        document.getElementById('confirmaSenha').addEventListener('input', e => cacheConfirmaSenha = e.target.value);

        formContaSenha.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Usar os valores capturados em tempo real, caso algo limpe os inputs no submit
            const senhaAtual = document.getElementById('senhaAtual').value || cacheSenhaAtual;
            const novaSenha = document.getElementById('novaSenha').value || cacheNovaSenha;
            const confirmaSenha = document.getElementById('confirmaSenha').value || cacheConfirmaSenha;

            // Validações client-side antes de enviar ao servidor
            if (!senhaAtual) {
                showSnackbar('Por favor, informe sua senha atual.', 'error');
                return;
            }
            if (!novaSenha) {
                showSnackbar('Por favor, informe a nova senha.', 'error');
                return;
            }
            if (!confirmaSenha) {
                showSnackbar('Por favor, confirme a nova senha.', 'error');
                return;
            }
            if (novaSenha !== confirmaSenha) {
                showSnackbar('As senhas não coincidem. Verifique e tente novamente.', 'error');
                return;
            }
            if (novaSenha === senhaAtual) {
                showSnackbar('A nova senha não pode ser igual à senha atual.', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(getApiUrl(`/api/usuarios/${usuarioLogado.id}/senha`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ senhaAtual, novaSenha })
                });

                if (response.ok) {
                    showSnackbar('Senha alterada com sucesso!', 'success');
                    formContaSenha.reset();
                    cacheSenhaAtual = '';
                    cacheNovaSenha = '';
                    cacheConfirmaSenha = '';
                } else {
                    const errorText = await response.text();

                    // Mapeamento de mensagens do servidor para mensagens amigáveis
                    const mensagensErro = {
                        'Senha atual incorreta.': 'Senha atual incorreta. Verifique e tente novamente.',
                        'Senha atual e nova senha são obrigatórias.': 'Por favor, preencha todos os campos de senha.',
                        'Usuário não encontrado.': 'Conta não encontrada. Tente fazer login novamente.',
                        'Unauthorized': 'Sua sessão expirou. Faça login novamente.',
                    };

                    // Busca por correspondência parcial nas mensagens do servidor
                    let mensagemFinal = null;
                    for (const [chave, valor] of Object.entries(mensagensErro)) {
                        if (errorText && errorText.includes(chave)) {
                            mensagemFinal = valor;
                            break;
                        }
                    }

                    // Mapear por status HTTP se não encontrou mensagem específica
                    if (!mensagemFinal) {
                        if (response.status === 401) {
                            mensagemFinal = 'Senha atual incorreta. Verifique e tente novamente.';
                        } else if (response.status === 404) {
                            mensagemFinal = 'Conta não encontrada. Tente fazer login novamente.';
                        } else if (response.status === 400) {
                            mensagemFinal = 'Requisição inválida. Verifique os campos e tente novamente.';
                        } else if (response.status >= 500) {
                            mensagemFinal = 'Erro interno no servidor. Tente novamente mais tarde.';
                        } else {
                            mensagemFinal = 'Não foi possível alterar a senha. Tente novamente.';
                        }
                    }

                    showSnackbar(mensagemFinal, 'error');
                }
            } catch (error) {
                console.error('Erro na alteração de senha:', error);
                showSnackbar('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
            }
        });

    }

});

// --- TOGGLE SENHA ---
window.toggleSenha = function (inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }
};
