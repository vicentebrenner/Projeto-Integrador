document.addEventListener('DOMContentLoaded', function () {

    // --- VERIFICA LOGIN E PERMISSÃO ---
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
        return;
    }

    const usuarioLogado = JSON.parse(usuarioLogadoString);
    if (usuarioLogado && usuarioLogado.tipoUsuario !== 'MUSICO') {
        window.location.href = 'banda.html'; // Redireciona gestor para o painel da banda
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
                    try { dadosPerfil.videos = JSON.parse(data.linkVideos); } catch (e) { }
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

                // MARCAR QUE O PERFIL FOI CONFIGURADO (usado no index.html para redirecionar corretamente)
                localStorage.setItem('perfilConfigurado', 'true');

                showSnackbar("Perfil salvo com sucesso!");

                const inputUsername = document.getElementById('perfilUsername');
                if (inputUsername) inputUsername.style.borderColor = ''; // Limpa borda de erro se houver

                // REDIRECIONAR PARA O PAINEL (banda.html)
                setTimeout(() => {
                    window.location.href = 'banda.html';
                }, 1000);
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
        grid.innerHTML = '';

        if (dadosPerfil.videos.length === 0) {
            grid.innerHTML = `
                <div class="portfolio-empty">
                    <div class="portfolio-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
                        </svg>
                    </div>
                    <h3>Nenhum vídeo ainda</h3>
                    <p>Adicione vídeos do YouTube para montar seu portfólio musical.</p>
                </div>`;
            return;
        }

        dadosPerfil.videos.forEach((video, index) => {
            const videoId = extrairVideoID(video.url);
            if (!videoId) return;

            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

            const item = document.createElement('div');
            item.className = 'video-card';
            item.innerHTML = `
                <div class="video-thumbnail-wrapper" data-videoid="${videoId}" data-embedurl="${embedUrl}">
                    <img src="${thumbnailUrl}" alt="${video.titulo}" class="video-thumbnail" loading="lazy">
                    <div class="video-play-overlay">
                        <div class="play-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 16 16">
                                <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="video-yt-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 16 16">
                            <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
                        </svg>
                        YouTube
                    </div>
                </div>
                <div class="video-card-footer">
                    <h4 class="video-card-title">${video.titulo}</h4>
                   <div class="video-card-actions">
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn-video-yt" title="Abrir no YouTube">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button class="btn-video-remove btn-editar" data-tipo="video" data-index="${index}" title="Editar vídeo" style="transition: color 0.3s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color=''">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-video-remove btn-remover" data-tipo="video" data-index="${index}" title="Remover vídeo">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

            // Click para abrir iframe inline (embed lazy)
            const thumbWrapper = item.querySelector('.video-thumbnail-wrapper');
            thumbWrapper.addEventListener('click', () => {
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.title = video.titulo;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;border-radius:10px 10px 0 0;';
                thumbWrapper.innerHTML = '';
                thumbWrapper.appendChild(iframe);
            });

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

            form.addEventListener('submit', function (e) {
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

    window.updateStars = function (value) {
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

    // --- LÓGICA DOS MODAIS DE VÍDEO (EXCLUIR E EDITAR) ---

    let videoIndexParaExcluir = null;
    const modalExcluirVideo = document.getElementById('modalExcluirVideo');
    const nomeVideoExcluir = document.getElementById('nomeVideoExcluir');

    // Fechar modal de exclusão
    function fecharModalExcluirVideo() {
        if (modalExcluirVideo) modalExcluirVideo.style.display = "none";
        videoIndexParaExcluir = null;
    }

    document.getElementById('closeModalExcluirVideo')?.addEventListener('click', fecharModalExcluirVideo);
    document.getElementById('cancelarExclusaoVideoBtn')?.addEventListener('click', fecharModalExcluirVideo);

    // Confirmar exclusão
    document.getElementById('confirmarExclusaoVideoBtn')?.addEventListener('click', function () {
        if (videoIndexParaExcluir !== null && videoIndexParaExcluir < dadosPerfil.videos.length) {
            dadosPerfil.videos.splice(videoIndexParaExcluir, 1);
            carregarPortfolio();
            salvarDados();
            showSnackbar("Vídeo removido com sucesso.");
            fecharModalExcluirVideo();
        }
    });

    // Modal de Edição de Vídeo
    const editarVideoModal = document.getElementById('editarVideoModal');
    const formEditarVideo = document.getElementById('formEditarVideo');

    function fecharModalEditarVideo() {
        if (editarVideoModal) editarVideoModal.style.display = "none";
        if (formEditarVideo) formEditarVideo.reset();
    }

    document.getElementById('closeEditarVideo')?.addEventListener('click', fecharModalEditarVideo);

    // Salvar edição
    formEditarVideo?.addEventListener('submit', function (e) {
        e.preventDefault();
        const index = parseInt(document.getElementById('editVideoIndex').value);
        const titulo = document.getElementById('editVideoTitulo').value;
        const url = document.getElementById('editVideoUrl').value;
        const videoId = extrairVideoID(url);

        if (!videoId) {
            showSnackbar("Erro: URL do YouTube inválida ou não suportada.", "error");
            return;
        }

        if (!isNaN(index) && index < dadosPerfil.videos.length) {
            dadosPerfil.videos[index].titulo = titulo;
            dadosPerfil.videos[index].url = url;
            carregarPortfolio();
            salvarDados();
            showSnackbar("Vídeo atualizado com sucesso!");
            fecharModalEditarVideo();
        }
    });

    // Fechar clicando fora dos modais
    window.addEventListener('click', (event) => {
        if (event.target == modalExcluirVideo) fecharModalExcluirVideo();
        if (event.target == editarVideoModal) fecharModalEditarVideo();
    });

    // Delegação de eventos para botões de remover e editar vídeo
    document.body.addEventListener('click', function (e) {
        const btnRemover = e.target.closest('.btn-remover');
        const btnEditar = e.target.closest('.btn-editar');

        // Ação de Remover (Abre o pop-up de confirmar exclusão)
        if (btnRemover && btnRemover.dataset.tipo === 'video') {
            const index = parseInt(btnRemover.dataset.index);
            if (!isNaN(index) && index < dadosPerfil.videos.length) {
                videoIndexParaExcluir = index;
                if (nomeVideoExcluir) nomeVideoExcluir.textContent = dadosPerfil.videos[index].titulo;
                if (modalExcluirVideo) modalExcluirVideo.style.display = "block";
            }
        }

        // Ação de Editar (Abre o pop-up com os dados preenchidos)
        if (btnEditar && btnEditar.dataset.tipo === 'video') {
            const index = parseInt(btnEditar.dataset.index);
            if (!isNaN(index) && index < dadosPerfil.videos.length) {
                document.getElementById('editVideoIndex').value = index;
                document.getElementById('editVideoTitulo').value = dadosPerfil.videos[index].titulo;
                document.getElementById('editVideoUrl').value = dadosPerfil.videos[index].url;
                if (editarVideoModal) editarVideoModal.style.display = "block";
            }
        }
    });

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
                const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioLogado.id}`, {
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
                const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioLogado.id}/senha`, {
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