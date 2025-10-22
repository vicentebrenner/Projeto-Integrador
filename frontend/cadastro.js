document.addEventListener('DOMContentLoaded', function() {

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

    // --- DADOS DE EXEMPLO ---
    let dadosAgenda = [
        { data: '2025-08-15', titulo: 'Ensaio Pré-Show', local: 'Estúdio X, Porto Alegre/RS', tipo: 'ensaio' },
        { data: '2025-09-10', titulo: 'Gravação Demo', local: 'Estúdio Som Livre, Canoas/RS', tipo: 'gravacao' },
        { data: '2025-10-20', titulo: 'Ensaio Geral', local: 'Estúdio AmpliFire, Montenegro/RS', tipo: 'ensaio' },
        { data: '2025-10-25', titulo: 'Show de Lançamento', local: 'Bar Opinião, Porto Alegre/RS', tipo: 'show' },
        { data: '2025-11-05', titulo: 'Show Acústico', local: 'Café Fon Fon, Porto Alegre/RS', tipo: 'show' },
    ];
    let dadosMembros = [
        { idUsuario: 1, nome: 'Vicente Brenner', email: 'vicente@email.com', instrumento: 'Vocal e Guitarra' },
        { idUsuario: 2, nome: 'Alex Turner', email: 'alex@email.com', instrumento: 'Bateria' }
    ];
    let dadosFinanceiros = [
        { data: '2025-08-01', descricao: 'Venda Camiseta Modelo 1', valor: 45.00, tipo: 'RECEITA', categoria: 'Merchandising' },
        { data: '2025-08-10', descricao: 'Aluguel Sala Ensaio Agosto', valor: 150.00, tipo: 'DESPESA', categoria: 'Estúdio' },
        { data: '2025-09-05', descricao: 'Cachê Show Bar XYZ', valor: 800.00, tipo: 'RECEITA', categoria: 'Show' },
        { data: '2025-09-06', descricao: 'Alimentação Pós-Show', valor: 120.50, tipo: 'DESPESA', categoria: 'Alimentação' },
        { data: '2025-09-10', descricao: 'Pagamento Estúdio Gravação', valor: 400.00, tipo: 'DESPESA', categoria: 'Estúdio' },
        { data: '2025-10-05', descricao: 'Cachê do Bar Opinião', valor: 1200.00, tipo: 'RECEITA', categoria: 'Show' },
        { data: '2025-10-06', descricao: 'Venda de camisetas (Show Opinião)', valor: 350.50, tipo: 'RECEITA', categoria: 'Merchandising' },
        { data: '2025-10-07', descricao: 'Aluguel da van (Show Opinião)', valor: 250.00, tipo: 'DESPESA', categoria: 'Transporte' },
        { data: '2025-10-10', descricao: 'Cordas e palhetas', valor: 85.90, tipo: 'DESPESA', categoria: 'Equipamento' },
        { data: '2025-10-15', descricao: 'Anúncio Show Lançamento Facebook', valor: 50.00, tipo: 'DESPESA', categoria: 'Marketing' },
        { data: '2025-11-01', descricao: 'Adiantamento Cachê Café Fon Fon', valor: 200.00, tipo: 'RECEITA', categoria: 'Show' },
        { data: '2025-11-02', descricao: 'Gasolina Viagem', valor: 75.00, tipo: 'DESPESA', categoria: 'Transporte' },
    ];
    let dadosRepertorio = [
        { nome: 'Du, du liegst mir im Herzen', origem: 'Folclore Alemão', partituraUrl: 'Du, Du Acordeon 2.pdf' },
        { nome: 'Lili Marleen', origem: 'Hans Leip', partituraUrl: null },
        { nome: 'Música Nova', origem: 'Autoral', partituraUrl: null }
    ];

    // NOVO: Simulação de usuários cadastrados no sistema
    const dadosUsuariosSimulados = [
        { id: 1, nome: 'Vicente Brenner', email: 'vicente@email.com' },
        { id: 2, nome: 'Alex Turner', email: 'alex@email.com' },
        { id: 3, nome: 'Fulano Silva', email: 'fulano@email.com' },
        { id: 4, nome: 'Ciclana Souza', email: 'ciclana@email.com' }
    ];

    // NOVO: Array para guardar convites pendentes
    let dadosConvitesPendentes = [
        // Ex: { emailConvidado: 'fulano@email.com', nomeConvidado: 'Fulano Silva', instrumento: 'Baixo', dataConvite: new Date() }
    ];


    // --- FUNÇÃO DE NOTIFICAÇÃO (Snackbar) ---
    function showSnackbar(message) {
        const snackbar = document.getElementById("snackbar");
        if (snackbar) {
            snackbar.textContent = message;
            snackbar.className = "show"; // Adiciona a classe que torna visível
            // Remove a classe após 3 segundos
            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        } else {
            console.warn("Elemento snackbar não encontrado!");
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function carregarAgenda() {
        const agendaList = document.getElementById('agendaList');
        if (!agendaList) return;
        agendaList.innerHTML = ''; // Limpa a lista
        dadosAgenda.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena por data

        if (dadosAgenda.length === 0) {
            agendaList.innerHTML = '<p>Nenhum evento agendado.</p>';
            return;
        }

        dadosAgenda.forEach((evento, index) => {
            const dataObj = new Date(evento.data + "T12:00:00"); // Adiciona hora para evitar problemas de fuso
            const dia = dataObj.getDate();
            const mes = dataObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

            const item = document.createElement('div');
            item.className = `agenda-item ${evento.tipo}`; // Classe baseada no tipo
            item.innerHTML = `
                <div class="agenda-data">
                    <span class="dia">${dia}</span>
                    <span class="mes">${mes}</span>
                </div>
                <div class="agenda-details">
                    <h4>${evento.titulo}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>
                </div>
                <div class="agenda-actions">
                    <button class="btn-icon btn-remover" data-tipo="agenda" data-index="${index}" title="Remover evento">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    </div>
            `;
            agendaList.appendChild(item);
        });
    }

    function carregarFinanceiro() {
        const tabela = document.getElementById('corpoTabelaFinanceira');
        const saldoEl = document.getElementById('saldoAtual');
        const receitaEl = document.getElementById('receitaMes');
        const despesaEl = document.getElementById('despesaMes');
        const canvasEvolucao = document.getElementById('graficoEvolucao');

        if (!tabela || !saldoEl || !receitaEl || !despesaEl || !canvasEvolucao) {
            console.error("Elementos essenciais do financeiro não encontrados.");
            return;
        }

        let saldoTotal = 0;
        let receitaMes = 0;
        let despesaMes = 0;
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const evolucaoMensal = {}; // Objeto para agrupar dados por mês (ex: {'2025-10': {receita: 100, despesa: 50}})

        tabela.innerHTML = ''; // Limpa a tabela
        dadosFinanceiros.sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data (mais recente primeiro)

        if (dadosFinanceiros.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma transação registrada.</td></tr>';
        } else {
            dadosFinanceiros.forEach(item => {
                const valor = parseFloat(item.valor);
                const dataItem = new Date(item.data + "T12:00:00");
                const mesItem = dataItem.getMonth();
                const anoItem = dataItem.getFullYear();
                const chaveMesAno = `${anoItem}-${String(mesItem + 1).padStart(2, '0')}`; // Formato YYYY-MM

                const isDespesa = item.tipo === 'DESPESA';

                // Calcula Saldo Total
                saldoTotal += isDespesa ? -valor : valor;

                // Calcula Métricas do Mês Atual
                if (mesItem === mesAtual && anoItem === anoAtual) {
                    isDespesa ? (despesaMes += valor) : (receitaMes += valor);
                }

                // Agrupa dados para o gráfico de linha
                if (!evolucaoMensal[chaveMesAno]) {
                    evolucaoMensal[chaveMesAno] = { receita: 0, despesa: 0 };
                }
                isDespesa ? (evolucaoMensal[chaveMesAno].despesa += valor) : (evolucaoMensal[chaveMesAno].receita += valor);

                // Adiciona linha na tabela
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dataItem.toLocaleDateString('pt-BR')}</td>
                    <td>${item.descricao}</td>
                    <td><span class="categoria-tag">${item.categoria}</span></td>
                    <td class="${isDespesa ? 'despesa' : 'receita'}">${isDespesa ? '-' : '+'} R$ ${valor.toFixed(2).replace('.', ',')}</td>
                `;
                tabela.appendChild(tr);
            });
        }

        // Atualiza os cards de métricas
        saldoEl.textContent = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;
        receitaEl.textContent = `R$ ${receitaMes.toFixed(2).replace('.', ',')}`;
        despesaEl.textContent = `R$ ${despesaMes.toFixed(2).replace('.', ',')}`;

        // --- Lógica do Gráfico de Linha ---
        const labelsEvolucao = Object.keys(evolucaoMensal).sort(); // Ordena os meses
        const dadosReceitaEvolucao = labelsEvolucao.map(mes => evolucaoMensal[mes].receita);
        const dadosDespesaEvolucao = labelsEvolucao.map(mes => evolucaoMensal[mes].despesa);

        // Destruir gráfico anterior se existir
        if (window.graficoLinha) {
            window.graficoLinha.destroy();
        }

        // Criar novo gráfico de linha
        const ctxEvolucao = canvasEvolucao.getContext('2d');
        window.graficoLinha = new Chart(ctxEvolucao, {
            type: 'line',
            data: {
                labels: labelsEvolucao, // Meses no eixo X
                datasets: [
                    {
                        label: 'Receita',
                        data: dadosReceitaEvolucao,
                        borderColor: 'rgba(46, 204, 113, 1)', // Verde (cor sucesso)
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        fill: true,
                        tension: 0.1 // Suaviza a linha
                    },
                    {
                        label: 'Despesa',
                        data: dadosDespesaEvolucao,
                        borderColor: 'rgba(231, 76, 60, 1)', // Vermelho (cor erro)
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            // Formatar ticks do eixo Y como moeda
                            callback: function(value, index, values) {
                                return 'R$ ' + value.toFixed(0);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Formatar tooltips como moeda
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function carregarMembros() {
        const tabela = document.getElementById('corpoTabelaMembros');
        if (!tabela) return;
        tabela.innerHTML = '';
        // Modificado: colspan para 4
        if (dadosMembros.length === 0) { tabela.innerHTML = '<tr><td colspan="4">Nenhum membro cadastrado nesta banda.</td></tr>'; return; }
        dadosMembros.forEach((membro, index) => {
            const tr = document.createElement('tr');
            // Modificado: Adiciona coluna de email
            tr.innerHTML = `
                <td>${membro.nome || '(Nome não disponível)'}</td>
                <td>${membro.email}</td>
                <td>${membro.instrumento}</td>
                <td><button class="btn-icon btn-remover" data-tipo="membro" data-index="${index}" title="Remover membro"><i class="fas fa-trash-alt"></i></button></td>`;
            tabela.appendChild(tr);
        });
    }

    // NOVA Função para carregar convites pendentes
    function carregarConvitesPendentes() {
        const listaUl = document.getElementById('listaConvitesPendentes');
        if (!listaUl) return;
        listaUl.innerHTML = ''; // Limpa a lista

        if (dadosConvitesPendentes.length === 0) {
            listaUl.innerHTML = '<li>Nenhum convite pendente.</li>';
            return;
        }

        dadosConvitesPendentes.forEach((convite, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>
                    <i class="fas fa-user-clock"></i>
                    <strong>${convite.nomeConvidado || convite.emailConvidado}</strong> (${convite.emailConvidado}) - ${convite.instrumento}
                </span>
                <button class="btn-icon btn-cancelar-convite" data-index="${index}" title="Cancelar Convite">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            listaUl.appendChild(li);
        });
    }


    function carregarRepertorio() {
        const tabela = document.getElementById('corpoTabelaRepertorio');
        if (!tabela) return;
        tabela.innerHTML = '';
        if (dadosRepertorio.length === 0) { tabela.innerHTML = '<tr><td colspan="3">Nenhuma música no repertório.</td></tr>'; return; }
        dadosRepertorio.forEach((musica, index) => {
            const tr = document.createElement('tr');
            // Modificado para usar musica.partituraUrl e data-partitura-url
            tr.innerHTML = `
                <td>${musica.nome}</td>
                <td>${musica.origem || '-'}</td>
                <td>
                    ${musica.partituraUrl ? `<button class="btn-ver-partitura" data-partitura-url="${musica.partituraUrl}"><i class="fas fa-file-pdf"></i> Ver Partitura</button>` : ''}
                    <button class="btn-icon btn-remover" data-tipo="repertorio" data-index="${index}" title="Remover música"><i class="fas fa-trash-alt"></i></button>
                </td>`;
            tabela.appendChild(tr);
        });
    }

    function carregarAnaliseIA() {
        const aiContent = document.getElementById('aiInsightsContent');
        if (!aiContent) return;
        aiContent.innerHTML = `<p class="loading-ai"><i class="fas fa-spinner fa-spin"></i> Analisando dados financeiros...</p>`;
        setTimeout(() => {
            // Lógica simples de análise (exemplo)
            const totalReceita = dadosFinanceiros.filter(t => t.tipo === 'RECEITA').reduce((sum, t) => sum + parseFloat(t.valor), 0);
            const totalDespesa = dadosFinanceiros.filter(t => t.tipo === 'DESPESA').reduce((sum, t) => sum + parseFloat(t.valor), 0);
            const categoriasDespesa = dadosFinanceiros.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => {
                acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.valor);
                return acc;
            }, {});
            const maiorDespesa = Object.entries(categoriasDespesa).sort(([,a],[,b]) => b-a)[0];

            let insightsHTML = '';
            if (totalReceita > totalDespesa * 1.5) {
                insightsHTML += `<div class="insight-item success"><i class="fas fa-chart-line"></i><p>Excelente! Suas receitas superam significativamente as despesas.</p></div>`;
            } else if (totalDespesa > totalReceita) {
                 insightsHTML += `<div class="insight-item alert"><i class="fas fa-exclamation-triangle"></i><p>Atenção: As despesas (${totalDespesa.toFixed(2).replace('.', ',')}) estão maiores que as receitas (${totalReceita.toFixed(2).replace('.', ',')}) no período analisado.</p></div>`;
            }

            if (maiorDespesa) {
                 insightsHTML += `<div class="insight-item"><i class="fas fa-info-circle"></i><p>Sua maior despesa é com <strong>${maiorDespesa[0]}</strong> (R$ ${maiorDespesa[1].toFixed(2).replace('.', ',')}). Considere analisar esses custos.</p></div>`;
            }

            if (insightsHTML === '') {
                 insightsHTML = `<div class="insight-item"><i class="fas fa-info-circle"></i><p>Mantenha seus registros atualizados para melhores análises.</p></div>`;
            }

            aiContent.innerHTML = insightsHTML;

        }, 1500); // Simula 1.5 segundos de "pensamento"
    }

    // --- CONTROLE DOS MODAIS ---
    function setupModal(modalId, abrirBtnId, formId, onSave) {
        const modal = document.getElementById(modalId);
        const abrirBtn = document.getElementById(abrirBtnId);
        const form = document.getElementById(formId);
        const closeButton = modal ? modal.querySelector('.close-button') : null;

        if (modal && abrirBtn && closeButton && form) {
            abrirBtn.onclick = () => { modal.style.display = "block"; };
            const closeModal = () => { modal.style.display = "none"; form.reset(); }; // Limpa o form ao fechar
            closeButton.onclick = closeModal;
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal(); // Limpa o form ao fechar clicando fora
                }
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                onSave(this); // Chama a função específica de salvar
                // Não chama closeModal aqui se onSave já faz validações que podem impedir o fechamento
                // A função onSave será responsável por chamar closeModal se tudo der certo
            });
        } else {
             console.error(`Erro ao configurar o modal: ${modalId}, ${abrirBtnId}, ${formId}`);
        }
    }

    // Configura os modais específicos
    setupModal('transacaoModal', 'abrirModalTransacaoBtn', 'formAdicionarTransacao', (form) => {
        const valor = parseFloat(form.valor.value);
        if (isNaN(valor) || valor <= 0) {
            showSnackbar("Valor inválido.");
            // Não fecha o modal aqui, permite corrigir
            document.getElementById(form.id).querySelector('.close-button').onclick(); // Fecha manualmente se der erro
            return;
        }
        dadosFinanceiros.push({
            tipo: form.tipo.value,
            descricao: form.descricao.value,
            valor: valor, // Usar o valor validado
            data: form.data.value,
            categoria: form.categoria.value
        });
        carregarFinanceiro(); // Atualiza a tabela e o gráfico
        carregarAnaliseIA(); // Reanalisa os dados
        showSnackbar("Transação adicionada!");
        document.getElementById(form.id).querySelector('.close-button').onclick(); // Fecha modal
    });

    // Modificado: Setup do Modal de Membro para ENVIAR CONVITE
    setupModal('membroModal', 'abrirModalMembroBtn', 'formAdicionarMembro', (form) => {
        const emailConvidado = form.emailMembro.value.trim().toLowerCase();
        const instrumentoConvidado = form.instrumentoMembro.value.trim();
        const modalContent = form.closest('.modal-content'); // Para fechar
        const closeButton = modalContent ? modalContent.querySelector('.close-button') : null;


        if (!emailConvidado || !instrumentoConvidado) {
            showSnackbar("Preencha o e-mail e o instrumento.");
             if(closeButton) closeButton.onclick(); // Fecha modal se der erro
            return;
        }

        // Verifica se o usuário já é membro
        const jaEhMembro = dadosMembros.some(membro => membro.email === emailConvidado);
        if (jaEhMembro) {
            showSnackbar(`Este usuário já faz parte da banda.`);
             if(closeButton) closeButton.onclick(); // Fecha modal se der erro
            return;
        }

        // Verifica se já existe um convite pendente para este email
        const convitePendente = dadosConvitesPendentes.some(convite => convite.emailConvidado === emailConvidado);
        if (convitePendente) {
            showSnackbar(`Já existe um convite pendente para ${emailConvidado}.`);
             if(closeButton) closeButton.onclick(); // Fecha modal se der erro
            return;
        }

        // *** SIMULAÇÃO: Busca o usuário na lista de usuários cadastrados ***
        const usuarioEncontrado = dadosUsuariosSimulados.find(user => user.email === emailConvidado);

        if (!usuarioEncontrado) {
            showSnackbar(`Erro: Usuário com e-mail ${emailConvidado} não encontrado no Music Makers.`);
             if(closeButton) closeButton.onclick(); // Fecha modal se der erro
            // *** LÓGICA REAL (Backend): A API retornaria um erro aqui ***
            return;
        }

        // Adiciona à lista de convites pendentes
        dadosConvitesPendentes.push({
            emailConvidado: emailConvidado,
            nomeConvidado: usuarioEncontrado.nome, // Pega o nome real (simulado)
            instrumento: instrumentoConvidado,
            dataConvite: new Date() // Guarda a data do convite (opcional)
        });

        carregarConvitesPendentes(); // Atualiza a lista de convites na tela
        showSnackbar(`Convite enviado para ${usuarioEncontrado.nome} (${emailConvidado})!`);
        if(closeButton) closeButton.onclick(); // Fecha modal após sucesso

    });

    setupModal('eventoModal', 'abrirModalEventoBtn', 'formAdicionarEvento', (form) => {
        dadosAgenda.push({
            titulo: form.tituloEvento.value,
            data: form.dataEvento.value,
            local: form.localEvento.value,
            tipo: form.tipoEvento.value
        });
        carregarAgenda(); // Atualiza a lista
        showSnackbar("Evento adicionado!");
        document.getElementById(form.id).querySelector('.close-button').onclick(); // Fecha modal
    });

    setupModal('musicaModal', 'abrirModalMusicaBtn', 'formAdicionarMusica', (form) => {
        const nomeMusica = form.nomeMusica.value;
        const origemMusica = form.origemMusica.value;
        const fileInput = form.partituraMusica;
        let partituraUrlTemp = null; // Usaremos URL temporária
        const closeButton = document.getElementById(form.id).querySelector('.close-button');


        // Verifica se um arquivo foi selecionado e é PDF
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.type === "application/pdf") {
                partituraUrlTemp = URL.createObjectURL(file);
                console.log("URL temporária criada:", partituraUrlTemp);
            } else {
                showSnackbar("Erro: Selecione um arquivo PDF.");
                 if(closeButton) closeButton.onclick(); // Fecha modal
                return; // Impede o salvamento se não for PDF
            }
        }

        // Adiciona a música ao array de dados
        dadosRepertorio.push({
            nome: nomeMusica,
            origem: origemMusica,
            partituraUrl: partituraUrlTemp // Salva a URL temporária (ou null)
        });

        carregarRepertorio(); // Atualiza a tabela
        showSnackbar("Música adicionada ao repertório!");
        if(closeButton) closeButton.onclick(); // Fecha modal
    });

    // --- EVENTOS DE CLIQUE GERAIS (Delegação de eventos) ---
    document.body.addEventListener('click', function(e) {

        // Botão Remover (Membro, Agenda, Repertório)
        const btnRemover = e.target.closest('.btn-remover');
        if (btnRemover) {
            const tipo = btnRemover.dataset.tipo;
            const index = parseInt(btnRemover.dataset.index); // Converter para número

            if (isNaN(index)) return; // Se o índice não for válido

            let itemRemovido = null;

            if (tipo === 'agenda' && index < dadosAgenda.length) {
                itemRemovido = dadosAgenda.splice(index, 1)[0];
                carregarAgenda();
            } else if (tipo === 'membro' && index < dadosMembros.length) {
                itemRemovido = dadosMembros.splice(index, 1)[0];
                carregarMembros();
            } else if (tipo === 'repertorio' && index < dadosRepertorio.length) {
                const musicaRemovida = dadosRepertorio[index];
                // Antes de remover, revogar a URL temporária se existir (boa prática)
                if (musicaRemovida.partituraUrl && musicaRemovida.partituraUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(musicaRemovida.partituraUrl);
                    console.log("URL temporária revogada:", musicaRemovida.partituraUrl);
                }
                itemRemovido = dadosRepertorio.splice(index, 1)[0];
                carregarRepertorio();
                // Limpar visualizador se a música removida era a exibida
                const visualizadorPdf = document.getElementById('visualizadorPdf');
                if (visualizadorPdf && visualizadorPdf.querySelector(`embed[src="${musicaRemovida.partituraUrl}"]`)) {
                     visualizadorPdf.innerHTML = '<p>Selecione uma música para ver a partitura.</p>';
                }
            }
             // Adicionar remoção de transação financeira se necessário
             // else if (tipo === 'financeiro' && index < dadosFinanceiros.length) { ... }


            if (itemRemovido) {
                 showSnackbar(`"${itemRemovido.titulo || itemRemovido.nome || itemRemovido.email || 'Item'}" removido.`);
                 // Se for financeiro, recarregar análise
                 if (tipo === 'financeiro') {
                    carregarFinanceiro();
                    carregarAnaliseIA();
                 }
            }
        }

        // Botão Ver Partitura
        const partituraBtn = e.target.closest('.btn-ver-partitura');
        if (partituraBtn) {
            // Modificado para usar data-partitura-url
            const pdfUrl = partituraBtn.dataset.partituraUrl;
            const pdfViewer = document.getElementById('visualizadorPdf');
            if(pdfViewer && pdfUrl) {
                 // Usa <embed> para visualização inline
                 pdfViewer.innerHTML = `<embed src="${pdfUrl}" type="application/pdf" width="100%" height="600px" />`;
            } else if (pdfViewer) {
                 pdfViewer.innerHTML = '<p>Erro ao carregar a partitura.</p>';
            }
        }

        // NOVO: Botão Cancelar Convite
        const btnCancelarConvite = e.target.closest('.btn-cancelar-convite');
        if (btnCancelarConvite) {
            const index = parseInt(btnCancelarConvite.dataset.index);
            if (!isNaN(index) && index < dadosConvitesPendentes.length) {
                const conviteCancelado = dadosConvitesPendentes.splice(index, 1)[0];
                carregarConvitesPendentes(); // Atualiza a lista na tela
                showSnackbar(`Convite para ${conviteCancelado.emailConvidado} cancelado.`);
                // *** LÓGICA REAL (Backend): Chamaria API para cancelar o convite ***
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    // Simulação: Verificar se o usuário "pertence" a uma banda (poderia vir do localStorage após login)
    const usuarioPertenceBanda = true; // Mude para false para testar o cenário sem banda
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')); // Pega info do usuário logado

    if (usuarioPertenceBanda) {
        carregarAgenda();
        carregarFinanceiro();
        carregarMembros();
        carregarConvitesPendentes(); // Carrega a lista de convites
        carregarRepertorio();
        carregarAnaliseIA();
    } else {
        // Esconde as tabs e mostra uma mensagem alternativa
        const tabsContainer = document.querySelector('.banda-tabs');
        const contentContainers = document.querySelectorAll('.tab-content');
        const mainContainer = document.querySelector('.banda-container .container'); // Container principal do conteúdo

        if (tabsContainer) tabsContainer.style.display = 'none';
        contentContainers.forEach(content => content.style.display = 'none');

        if (mainContainer) {
             const userEmail = usuarioLogado ? usuarioLogado.email : 'seu email'; // Pega email do usuário logado
             mainContainer.innerHTML = `
                <h1>Bem-vindo ao Music Makers!</h1>
                <div class="card-style" style="text-align: center;">
                    <p>Você ainda não faz parte de nenhuma banda.</p>
                    <p>Peça para um membro de uma banda existente convidá-lo usando seu e-mail (${userEmail}).</p>
                    <button class="btnCta" style="margin-top: 20px;" onclick="alert('Funcionalidade \\'Criar Nova Banda\\' ainda não implementada.')">Criar Nova Banda</button>
                    </div>
            `;
        }
    }

});