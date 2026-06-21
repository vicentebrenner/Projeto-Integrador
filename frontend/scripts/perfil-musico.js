document.addEventListener('DOMContentLoaded', function() {

    // --- VERIFICA LOGIN E PERMISSÃO ---
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
        return;
    }

    const usuarioLogado = JSON.parse(usuarioLogadoString);
    if (usuarioLogado && usuarioLogado.tipoUsuario !== 'MUSICO') {
        window.location.href = 'dashboard.html'; // Redireciona gestor para o painel da banda
        return;
    }

    // --- DADOS DO PERFIL (Integrado com API) ---
    let dadosPerfil = {
        nome: usuarioLogado.nome || "Músico",
        username: "",
        email: usuarioLogado.email || "",
        corAvatar: "#fa9848",
        local: "",
        instrumentos: "",
        nivelHabilidade: "",
        tempoExperiencia: "",
        generosMusicais: "",
        influencias: "",
        statusBusca: "",
        disponibilidade: "",
        equipamento: "",
        redesSociais: "",
        bio: "",
        videos: []
    };

    function inicializarPerfil() {
        const token = localStorage.getItem('authToken');
        fetch(`http://localhost:8080/api/musicos/usuario/${usuarioLogado.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Perfil não encontrado");
                return res.json();
            })
            .then(data => {
                const usuario = data.usuario || usuarioLogado;
                dadosPerfil.nome = usuario.nome || dadosPerfil.nome;
                dadosPerfil.username = usuario.username || "";
                dadosPerfil.email = usuario.email || dadosPerfil.email;
                dadosPerfil.corAvatar = usuario.corAvatar || "#fa9848";
                dadosPerfil.local = data.localizacao || "";
                dadosPerfil.instrumentos = data.instrumentosPrincipais || "";
                dadosPerfil.nivelHabilidade = data.nivelHabilidade || "";
                dadosPerfil.tempoExperiencia = data.tempoExperiencia || "";
                dadosPerfil.generosMusicais = data.generosMusicais || "";
                dadosPerfil.influencias = data.influencias || "";
                dadosPerfil.statusBusca = data.statusBusca || "";
                dadosPerfil.disponibilidade = data.disponibilidade || "";
                dadosPerfil.equipamento = data.equipamento || "";
                dadosPerfil.redesSociais = data.redesSociais || "";
                dadosPerfil.bio = data.biografia || "";
                if (data.linkVideos) {
                    try { dadosPerfil.videos = JSON.parse(data.linkVideos); } catch(e) {}
                }
                
                carregarPerfil();
                carregarPortfolio();
            })
            .catch(err => {
                console.warn(err);
                carregarPerfil();
                carregarPortfolio();
            });
    }

    function salvarDados() {
        const dto = {
            nome: dadosPerfil.nome,
            username: dadosPerfil.username,
            corAvatar: dadosPerfil.corAvatar,
            localizacao: dadosPerfil.local,
            instrumentosPrincipais: dadosPerfil.instrumentos,
            nivelHabilidade: dadosPerfil.nivelHabilidade,
            tempoExperiencia: dadosPerfil.tempoExperiencia,
            generosMusicais: dadosPerfil.generosMusicais,
            influencias: dadosPerfil.influencias,
            statusBusca: dadosPerfil.statusBusca,
            disponibilidade: dadosPerfil.disponibilidade,
            equipamento: dadosPerfil.equipamento,
            redesSociais: dadosPerfil.redesSociais,
            biografia: dadosPerfil.bio,
            linkVideos: JSON.stringify(dadosPerfil.videos)
        };

        const token = localStorage.getItem('authToken');
        fetch(`http://localhost:8080/api/musicos/usuario/${usuarioLogado.id}/completo`, {
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
            usuarioLogado.username = dadosPerfil.username;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            
            showSnackbar("Perfil salvo com sucesso!");
            
            const inputUsername = document.getElementById('perfilUsername');
            if (inputUsername) inputUsername.style.borderColor = ''; // Limpa borda de erro se houver
        })
        .catch(err => {
            console.error(err);
            showSnackbar(err.message || "Erro ao salvar perfil.");
            
            if (err.message && err.message.includes("Username já está em uso")) {
                const inputUsername = document.getElementById('perfilUsername');
                if (inputUsername) {
                    inputUsername.style.borderColor = 'var(--cor-destaque)';
                    inputUsername.focus();
                }
            }
        });
    }

    // --- LÓGICA DAS ABAS ---
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(item => item.classList.remove('ativo'));
            contents.forEach(item => item.classList.remove('ativo'));
            const target = document.getElementById(this.dataset.tab);
            this.classList.add('ativo');
            if (target) target.classList.add('ativo');
        });
    });

    // --- FUNÇÃO DE NOTIFICAÇÃO (Snackbar) ---
    function showSnackbar(message) {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            snackbar.innerHTML = `
                <div class="snackbar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#28a745" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
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
        document.getElementById('perfilUsername').value = dadosPerfil.username || '';
        // document.getElementById('perfilLocal').value = dadosPerfil.local || '';
        if (dadosPerfil.local) {
            let partes = dadosPerfil.local.split('/');
            if (partes.length !== 2) partes = dadosPerfil.local.split('-');
            
            if (partes.length === 2) {
                const cidade = partes[0].trim();
                const uf = partes[1].trim();
                
                const selectEstado = document.getElementById('perfilEstado');
                const checkInterval = setInterval(() => {
                    if (selectEstado && selectEstado.options.length > 1) {
                        selectEstado.value = uf;
                        carregarCidades(uf, cidade);
                        clearInterval(checkInterval);
                    }
                }, 100);
            }
        }
        const listaInst = document.getElementById('listaInstrumentos');
        if (listaInst) listaInst.innerHTML = '';
        
        const strInst = dadosPerfil.instrumentos || '';
        
        if (strInst.includes('::')) {
            const blocos = strInst.split('|').filter(b => b.trim());
            blocos.forEach(b => {
                const parts = b.split('::');
                const iNome = parts[0] || '';
                const iNivel = parts[1] || '';
                const iExp = parts[2] || '';
                adicionarBlocoInstrumento(iNome, iNivel, iExp);
            });
        } else if (strInst) {
            const nomes = strInst.split(',').map(s => s.trim()).filter(s => s);
            const globalNivel = dadosPerfil.nivelHabilidade || '';
            const globalExp = dadosPerfil.tempoExperiencia || '';
            nomes.forEach((nome, idx) => {
                if (idx === 0) {
                    adicionarBlocoInstrumento(nome, globalNivel, globalExp);
                } else {
                    adicionarBlocoInstrumento(nome, '', '');
                }
            });
        } else {
            adicionarBlocoInstrumento();
        }
        
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
        
        document.getElementById('perfilInfluencias').value = dadosPerfil.influencias || '';
        document.getElementById('perfilStatusBusca').value = dadosPerfil.statusBusca || '';
        document.getElementById('perfilDisponibilidade').value = dadosPerfil.disponibilidade || '';
        document.getElementById('perfilEquipamento').value = dadosPerfil.equipamento || '';
        document.getElementById('perfilRedesSociais').value = dadosPerfil.redesSociais || '';
        document.getElementById('perfilBio').value = dadosPerfil.bio || '';
        
        // Conta e Segurança
        const emailInput = document.getElementById('contaEmail');
        if (emailInput) emailInput.value = dadosPerfil.email || '';

        atualizarAvatarView();
    }

    // Carrega os vídeos no portfólio
    function carregarPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;
        grid.innerHTML = ''; // Limpa o grid

        if (dadosPerfil.videos.length === 0) {
            grid.innerHTML = '<p class="loading-ai">Nenhum vídeo no portfólio. Adicione seu primeiro vídeo!</p>';
            return;
        }

        dadosPerfil.videos.forEach((video, index) => {
            const videoId = extrairVideoID(video.url);
            if (!videoId) return; // Pula se a URL for inválida

            const videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

            const item = document.createElement('div');
            item.className = 'video-card';
            item.innerHTML = `
                <div class="video-embed">
                    <iframe
                        src="${videoEmbedUrl}"
                        title="${video.titulo}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <h4>${video.titulo}</h4>
                <div class="video-actions">
                    <button class="btn-icon btn-remover" data-tipo="video" data-index="${index}" title="Remover vídeo">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            grid.appendChild(item);
        });
    }

    // Função mágica para extrair o ID de um link do YouTube
    function extrairVideoID(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v');
            }
        } catch (e) {
            console.error("URL do YouTube inválida:", url);
            return null;
        }
        return null;
    }

    // --- CONTROLE DOS MODAIS ---
    function setupModal(modalId, abrirBtnId, formId, onSave) {
        const modal = document.getElementById(modalId);
        const abrirBtn = document.getElementById(abrirBtnId);
        const form = document.getElementById(formId);
        const closeButton = modal ? modal.querySelector('.close-button') : null;

        if (modal && abrirBtn && closeButton && form) {
            abrirBtn.onclick = () => { modal.style.display = "block"; };
            const closeModal = () => { modal.style.display = "none"; form.reset(); };
            closeButton.onclick = closeModal;
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal();
                }
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                onSave(this);
                closeModal(); // Fecha o modal após salvar
            });
        } else {
             console.error(`Erro ao configurar o modal: ${modalId}, ${abrirBtnId}, ${formId}`);
        }
    }

    // Configura o modal de Adicionar Vídeo
    setupModal('videoModal', 'abrirModalVideoBtn', 'formAdicionarVideo', (form) => {
        const titulo = form.videoTitulo.value;
        const url = form.videoUrl.value;
        const videoId = extrairVideoID(url);

        if (!videoId) {
            showSnackbar("Erro: URL do YouTube inválida ou não suportada.");
            return;
        }

        // Adiciona o novo vídeo (simulação)
        dadosPerfil.videos.push({
            id: new Date().getTime(), // ID único
            titulo: titulo,
            url: url
        });

        carregarPortfolio(); // Atualiza a lista de vídeos
        salvarDados(); // Salva no localStorage
        showSnackbar("Vídeo adicionado ao portfólio!");
    });


    // --- EVENTOS DE FORMULÁRIO E CLIQUES ---

    // Avatar Color Picker
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            dadosPerfil.corAvatar = this.dataset.color;
            atualizarAvatarView();
        });
    });

    // Atualizar Iniciais ao digitar o nome
    const inputNome = document.getElementById('perfilNome');
    if (inputNome) {
        inputNome.addEventListener('input', function() {
            dadosPerfil.nome = this.value;
            atualizarAvatarView();
        });
    }

    // Gerar Username Aleatório
    const btnGerarUsername = document.getElementById('btnGerarUsername');
    if (btnGerarUsername && inputNome) {
        btnGerarUsername.addEventListener('click', () => {
            const nomeCompleto = inputNome.value.trim();
            if (!nomeCompleto) {
                showSnackbar("Preencha seu Nome Completo primeiro!");
                return;
            }
            
            // Pega primeiro nome e último nome
            const partes = nomeCompleto.split(' ').filter(p => p.length > 0);
            let base = partes[0].toLowerCase();
            if (partes.length > 1) {
                base += '.' + partes[partes.length - 1].toLowerCase();
            }
            
            // Remove acentos
            base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            
            const numAleatorio = Math.floor(Math.random() * 999);
            const usernameGerado = `${base}${numAleatorio}`;
            
            const inputUsername = document.getElementById('perfilUsername');
            if (inputUsername) {
                inputUsername.value = usernameGerado;
                dadosPerfil.username = usernameGerado;
                showSnackbar("Username gerado!");
            }
        });
    }

    // Lógica de Estrelas (Nível de Habilidade)
    const starContainer = document.getElementById('starRatingContainer');
    const inputNivel = document.getElementById('perfilNivel');
    const nivelTexto = document.getElementById('nivelTexto');

    const nivelMap = {
        1: 'Iniciante',
        2: 'Básico',
        3: 'Intermediário',
        4: 'Avançado',
        5: 'Profissional'
    };

    window.updateStars = function(value) {
        if (!starContainer) return;
        const stars = starContainer.querySelectorAll('i');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
        
        if (value > 0) {
            if (nivelTexto) nivelTexto.textContent = `${value} - ${nivelMap[value]}`;
            if (inputNivel) inputNivel.value = nivelMap[value];
        } else {
            if (nivelTexto) nivelTexto.textContent = 'Selecione seu nível';
            if (inputNivel) inputNivel.value = '';
        }
    }

    if (starContainer) {
        starContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'I') {
                const value = parseInt(e.target.getAttribute('data-value'));
                window.updateStars(value);
            }
        });
    }

    // Lógica de Pílulas (Gêneros Favoritos)
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
    const formPerfil = document.getElementById('formPerfilMusico');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            dadosPerfil.nome = document.getElementById('perfilNome').value;
            dadosPerfil.username = document.getElementById('perfilUsername').value;
            const uf = document.getElementById('perfilEstado').value;
            const cidade = document.getElementById('perfilCidade').value;
            dadosPerfil.local = (cidade && uf) ? `${cidade}/${uf}` : '';
            const blocos = document.querySelectorAll('#listaInstrumentos .instrument-block');
            let arrayBlocos = [];
            blocos.forEach(bloco => {
                const selectInst = bloco.querySelector('.perfilInstrumentos');
                const iNome = selectInst ? selectInst.value : '';
                
                const inputNivel = bloco.querySelector('.perfilNivel');
                const iNivel = inputNivel ? inputNivel.value : '';
                
                const selectExp = bloco.querySelector('.perfilExperiencia');
                const iExp = selectExp ? selectExp.value : '';
                
                if (iNome && iNome.trim() !== '') {
                    arrayBlocos.push(`${iNome}::${iNivel}::${iExp}`);
                }
            });
            console.log("Salvando instrumentos:", arrayBlocos.join('|'));
            dadosPerfil.instrumentos = arrayBlocos.join('|');
            dadosPerfil.nivelHabilidade = '';
            dadosPerfil.tempoExperiencia = '';
            
            dadosPerfil.generosMusicais = document.getElementById('perfilGeneros').value;
            
            dadosPerfil.influencias = document.getElementById('perfilInfluencias').value;
            dadosPerfil.statusBusca = document.getElementById('perfilStatusBusca').value;
            dadosPerfil.disponibilidade = document.getElementById('perfilDisponibilidade').value;
            dadosPerfil.equipamento = document.getElementById('perfilEquipamento').value;
            dadosPerfil.redesSociais = document.getElementById('perfilRedesSociais').value;
            dadosPerfil.bio = document.getElementById('perfilBio').value;

            salvarDados(); // O salvarDados agora gerencia o popup
        });
    }

    // Salvar Formulário de Email
    const formEmail = document.getElementById('formContaEmail');
    if (formEmail) {
        formEmail.addEventListener('submit', (e) => {
            e.preventDefault();
            dadosPerfil.email = document.getElementById('contaEmail').value;
            showSnackbar("E-mail atualizado com sucesso!");
            salvarDados(); // Salva no localStorage
        });
    }

    // Salvar Formulário de Senha
    const formSenha = document.getElementById('formContaSenha');
    if (formSenha) {
        formSenha.addEventListener('submit', (e) => {
            e.preventDefault();
            const novaSenha = document.getElementById('novaSenha').value;
            const confirmaSenha = document.getElementById('confirmaSenha').value;
            
            if (novaSenha !== confirmaSenha) {
                showSnackbar("As senhas não coincidem!");
                return;
            }
            if (novaSenha.length < 6) {
                showSnackbar("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }
            
            showSnackbar("Senha alterada com sucesso!");
            formSenha.reset();
        });
    }

    // Delegação de eventos para botões de remover vídeo
    document.body.addEventListener('click', function(e) {
        const btnRemover = e.target.closest('.btn-remover');
        if (btnRemover && btnRemover.dataset.tipo === 'video') {
            const index = parseInt(btnRemover.dataset.index);
            if (!isNaN(index) && index < dadosPerfil.videos.length) {

                // Confirmação antes de remover
                if (confirm(`Tem certeza que deseja remover o vídeo "${dadosPerfil.videos[index].titulo}"?`)) {
                    dadosPerfil.videos.splice(index, 1); // Remove o vídeo
                    carregarPortfolio(); // Atualiza a tela
                    salvarDados(); // Salva no localStorage
                    showSnackbar("Vídeo removido.");
                }
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    inicializarPerfil();
    // --- LÓGICA DE EXCLUSÃO DE CONTA ---
    const btnExcluirConta = document.getElementById("btnExcluirConta");
    const modalExcluirConta = document.getElementById("modalExcluirConta");
    const closeModalExcluir = document.getElementById("closeModalExcluir");
    const formExcluirConta = document.getElementById("formExcluirConta");

    if (btnExcluirConta && modalExcluirConta) {
        btnExcluirConta.addEventListener("click", () => {
            modalExcluirConta.style.display = "block";
        });

        closeModalExcluir.addEventListener("click", () => {
            modalExcluirConta.style.display = "none";
        });

        window.addEventListener("click", (e) => {
            if (e.target === modalExcluirConta) {
                modalExcluirConta.style.display = "none";
            }
        });

        formExcluirConta.addEventListener("submit", async (e) => {
            e.preventDefault();
            const senha = document.getElementById("senhaExclusao").value;

            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioLogado.id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ senha })
                });

                if (response.ok) {
                    showSnackbar("Conta excluída com sucesso. Adeus!");
                    setTimeout(() => {
                        localStorage.removeItem('usuarioLogado');
                        localStorage.removeItem('authToken');
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    const errorText = await response.text();
                    showSnackbar(`Erro: ${errorText}`);
                }
            } catch (error) {
                console.error("Erro ao excluir conta:", error);
                showSnackbar("Erro de rede ao tentar excluir conta.");
            }
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
    // --- NOVA LÓGICA DE INSTRUMENTOS MODULARES ---
    const instrumentosContainer = document.getElementById('listaInstrumentos');
    const instrumentoTemplate = document.getElementById('instrumentoTemplate');
    const btnAddInstrumentoNovo = document.getElementById('btnAddInstrumento');

    function inicializarEstrelasBloco(block) {
        const starContainer = block.querySelector('.star-rating');
        const inputNivel = block.querySelector('.perfilNivel');
        const nivelTexto = block.querySelector('.nivelTexto');

        if (starContainer) {
            starContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'I') {
                    const value = parseInt(e.target.getAttribute('data-value'));
                    const stars = starContainer.querySelectorAll('i');
                    stars.forEach(star => {
                        const starValue = parseInt(star.getAttribute('data-value'));
                        if (starValue <= value) {
                            star.classList.remove('far');
                            star.classList.add('fas', 'active');
                        } else {
                            star.classList.remove('fas', 'active');
                            star.classList.add('far');
                        }
                    });
                    
                    if (value > 0) {
                        if (nivelTexto) nivelTexto.textContent = value + ' - ' + nivelMap[value];
                        if (inputNivel) inputNivel.value = nivelMap[value];
                    } else {
                        if (nivelTexto) nivelTexto.textContent = 'Selecione seu nível';
                        if (inputNivel) inputNivel.value = '';
                    }
                }
            });
        }
    }

    function adicionarBlocoInstrumento(instrumento = '', nivel = '', experiencia = '') {
        if (!instrumentoTemplate || !instrumentosContainer) return;

        const novoBloco = instrumentoTemplate.cloneNode(true);
        novoBloco.id = '';
        novoBloco.style.display = 'block';

        const selectInst = novoBloco.querySelector('.perfilInstrumentos');
        const inputNivel = novoBloco.querySelector('.perfilNivel');
        const selectExp = novoBloco.querySelector('.perfilExperiencia');
        const btnRemover = novoBloco.querySelector('.btnRemoverInstrumento');
        const nivelTexto = novoBloco.querySelector('.nivelTexto');

        if (selectInst) selectInst.value = instrumento;
        if (selectExp) selectExp.value = experiencia;
        
        let starValue = 0;
        for (let key in nivelMap) {
            if (nivelMap[key] === nivel) {
                starValue = parseInt(key);
                break;
            }
        }
        
        const stars = novoBloco.querySelectorAll('.star-rating i');
        stars.forEach(star => {
            const sv = parseInt(star.getAttribute('data-value'));
            if (sv <= starValue && starValue > 0) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            }
        });
        if (inputNivel) inputNivel.value = nivel;
        if (starValue > 0 && nivelTexto) {
            nivelTexto.textContent = starValue + ' - ' + nivel;
        }

        inicializarEstrelasBloco(novoBloco);

        btnRemover.addEventListener('click', () => {
            if (instrumentosContainer.children.length > 1) {
                novoBloco.remove();
            } else {
                showSnackbar("Você precisa ter pelo menos um instrumento.");
            }
        });

        instrumentosContainer.appendChild(novoBloco);
    }

    if (btnAddInstrumentoNovo) {
        btnAddInstrumentoNovo.addEventListener('click', () => {
            adicionarBlocoInstrumento();
        });
    }

});