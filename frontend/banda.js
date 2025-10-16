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



    // --- DADOS DE EXEMPLO (SIMULANDO UM BANCO DE DADOS) ---

    let dadosAgenda = [

        { data: '2025-10-20', titulo: 'Ensaio Geral', local: 'Estúdio AmpliFire, Montenegro/RS', tipo: 'ensaio' },

        { data: '2025-10-25', titulo: 'Show de Lançamento', local: 'Bar Opinião, Porto Alegre/RS', tipo: 'show' },

    ];

    let dadosMembros = [ { nome: 'Vicente Brenner', instrumento: 'Vocal e Guitarra' }, { nome: 'Alex Turner', instrumento: 'Bateria' }];

    let dadosFinanceiros = [

        { data: '2025-10-05', descricao: 'Cachê do Bar Opinião', valor: 1200.00, tipo: 'RECEITA', categoria: 'Show' },

        { data: '2025-10-06', descricao: 'Venda de camisetas', valor: 350.50, tipo: 'RECEITA', categoria: 'Merchandising' },

        { data: '2025-10-07', descricao: 'Aluguel da van', valor: 250.00, tipo: 'DESPESA', categoria: 'Transporte' },

        { data: '2025-10-10', descricao: 'Cordas e palhetas', valor: 85.90, tipo: 'DESPESA', categoria: 'Equipamento' }

    ];

    const dadosRepertorio = [ { nome: 'Du, du liegst mir im Herzen', origem: 'Folclore Alemão', partitura: 'Du, Du Acordeon 2.pdf' }, { nome: 'Lili Marleen', origem: 'Hans Leip', partitura: null }];



    // --- FUNÇÃO DE NOTIFICAÇÃO ---

    function showSnackbar(message) {

        const snackbar = document.getElementById("snackbar");

        if (snackbar) {

            snackbar.textContent = message;

            snackbar.className = "show";

            setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 3000);

        }

    }



    // --- FUNÇÕES DE RENDERIZAÇÃO (DESENHAR NA TELA) ---

    function carregarAgenda() {

        const agendaList = document.getElementById('agendaList');

        if (!agendaList) return;

        agendaList.innerHTML = '';

        dadosAgenda.sort((a, b) => new Date(a.data) - new Date(b.data));

        dadosAgenda.forEach((evento, index) => {

            const dataObj = new Date(evento.data + "T12:00:00");

            const dia = dataObj.getDate();

            const mes = dataObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

            const item = document.createElement('div');

            item.className = `agenda-item ${evento.tipo}`;

            item.innerHTML = `

                <div class="agenda-data"><span class="dia">${dia}</span><span class="mes">${mes}</span></div>

                <div class="agenda-details"><h4>${evento.titulo}</h4><p><i class="fas fa-map-marker-alt"></i> ${evento.local}</p></div>

                <div class="agenda-actions"><button class="btn-icon btn-remover" data-tipo="agenda" data-index="${index}"><i class="fas fa-trash-alt"></i></button></div>

            `;

            agendaList.appendChild(item);

        });

    }



    function carregarFinanceiro() {

        const tabela = document.getElementById('corpoTabelaFinanceira');

        const saldoEl = document.getElementById('saldoAtual');

        const receitaEl = document.getElementById('receitaMes');

        const despesaEl = document.getElementById('despesaMes');

        if (!tabela || !saldoEl) return;



        let saldoTotal = 0, receitaMes = 0, despesaMes = 0;

        const despesasPorCategoria = {};

        const mesAtual = new Date().getMonth();



        tabela.innerHTML = '';

        dadosFinanceiros.sort((a, b) => new Date(b.data) - new Date(a.data));

        dadosFinanceiros.forEach(item => {

            const valor = parseFloat(item.valor);

            const isDespesa = item.tipo === 'DESPESA';

            saldoTotal += isDespesa ? -valor : valor;

            if (new Date(item.data + "T12:00:00").getMonth() === mesAtual) {

                isDespesa ? (despesaMes += valor) : (receitaMes += valor);

            }

            if (isDespesa) {

                despesasPorCategoria[item.categoria] = (despesasPorCategoria[item.categoria] || 0) + valor;

            }

            const tr = document.createElement('tr');

            tr.innerHTML = `

                <td>${new Date(item.data + "T12:00:00").toLocaleDateString('pt-BR')}</td>

                <td>${item.descricao}</td>

                <td><span class="categoria-tag">${item.categoria}</span></td>

                <td class="${isDespesa ? 'despesa' : 'receita'}">${isDespesa ? '-' : '+'} R$ ${valor.toFixed(2)}</td>

            `;

            tabela.appendChild(tr);

        });



        saldoEl.textContent = `R$ ${saldoTotal.toFixed(2)}`;

        receitaEl.textContent = `R$ ${receitaMes.toFixed(2)}`;

        despesaEl.textContent = `R$ ${despesaMes.toFixed(2)}`;



        const canvas = document.getElementById('graficoCategorias');

        if (canvas) {

             if (window.graficoPizza) window.graficoPizza.destroy();

             window.graficoPizza = new Chart(canvas.getContext('2d'), {

                type: 'doughnut',

                data: {

                    labels: Object.keys(despesasPorCategoria),

                    datasets: [{ data: Object.values(despesasPorCategoria), backgroundColor: ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#1abc9c'] }]

                },

                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

            });

        }

    }



    function carregarMembros() {

        const tabela = document.getElementById('corpoTabelaMembros');

        if (tabela) {

            tabela.innerHTML = '';

            dadosMembros.forEach((membro, index) => {

                const tr = document.createElement('tr');

                tr.innerHTML = `<td>${membro.nome}</td><td>${membro.instrumento}</td><td><button class="btn-remover" data-tipo="membro" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>`;

                tabela.appendChild(tr);

            });

        }

    }



    function carregarRepertorio() {

        const tabela = document.getElementById('corpoTabelaRepertorio');

        if (tabela) {

            tabela.innerHTML = '';

            dadosRepertorio.forEach(musica => {

                const tr = document.createElement('tr');

                tr.innerHTML = `<td>${musica.nome}</td><td>${musica.origem}</td><td>${musica.partitura ? `<button class="btn-ver-partitura" data-partitura="${musica.partitura}"><i class="fas fa-file-pdf"></i> Ver Partitura</button>` : ''}</td>`;

                tabela.appendChild(tr);

            });

        }

    }

   

    function carregarAnaliseIA() {

        const aiContent = document.getElementById('aiInsightsContent');

        if (!aiContent) return;

        aiContent.innerHTML = `<p class="loading-ai">Analisando...</p>`;

        setTimeout(() => {

            aiContent.innerHTML = `

                <div class="insight-item alert"><i class="fas fa-exclamation-triangle"></i><p>Gastos com <strong>Transporte</strong> aumentaram 25% este mês.</p></div>

                <div class="insight-item success"><i class="fas fa-chart-line"></i><p><strong>Merchandising</strong> foi sua 2ª maior fonte de receita. Ótimo!</p></div>

                <div class="insight-item"><i class="fas fa-info-circle"></i><p><strong>Dica:</strong> Alocar 10% da receita para um fundo de gravação.</p></div>

            `;

        }, 2000);

    }



    // --- CONTROLE DOS MODAIS ---

    function setupModal(modalId, abrirBtnId, formId, onSave) {

        const modal = document.getElementById(modalId);

        const abrirBtn = document.getElementById(abrirBtnId);

        const form = document.getElementById(formId);

        const closeButton = modal ? modal.querySelector('.close-button') : null;



        if (modal && abrirBtn && closeButton && form) {

            abrirBtn.onclick = () => { modal.style.display = "block"; };

            closeButton.onclick = () => { modal.style.display = "none"; };

            window.addEventListener('click', (event) => { if (event.target == modal) { modal.style.display = "none"; } });

            form.addEventListener('submit', function(e) {

                e.preventDefault();

                onSave(this);

                this.reset();

                modal.style.display = "none";

            });

        }

    }



    setupModal('transacaoModal', 'abrirModalTransacaoBtn', 'formAdicionarTransacao', (form) => {

        dadosFinanceiros.push({ tipo: form.tipo.value, descricao: form.descricao.value, valor: form.valor.value, data: form.data.value, categoria: form.categoria.value });

        carregarFinanceiro();

        showSnackbar("Transação adicionada!");

    });



    setupModal('membroModal', 'abrirModalMembroBtn', 'formAdicionarMembro', (form) => {

        dadosMembros.push({ nome: form.nomeMembro.value, instrumento: form.instrumentoMembro.value });

        carregarMembros();

        showSnackbar("Membro adicionado!");

    });

   

    setupModal('eventoModal', 'abrirModalEventoBtn', 'formAdicionarEvento', (form) => {

        dadosAgenda.push({ titulo: form.tituloEvento.value, data: form.dataEvento.value, local: form.localEvento.value, tipo: form.tipoEvento.value });

        carregarAgenda();

        showSnackbar("Evento adicionado!");

    });



    // --- EVENTOS DE CLIQUE GERAIS ---

    document.body.addEventListener('click', function(e) {

        const btnRemover = e.target.closest('.btn-remover');

        if (btnRemover) {

            const tipo = btnRemover.dataset.tipo;

            const index = btnRemover.dataset.index;

            if (tipo === 'agenda') {

                dadosAgenda.splice(index, 1);

                carregarAgenda();

            } else if (tipo === 'membro') {

                dadosMembros.splice(index, 1);

                carregarMembros();

            }

            showSnackbar("Item removido.");

        }

       

        const partituraBtn = e.target.closest('.btn-ver-partitura');

        if (partituraBtn) {

            const pdfViewer = document.getElementById('visualizadorPdf');

            if(pdfViewer) pdfViewer.innerHTML = `<embed src="${partituraBtn.dataset.partitura}" type="application/pdf" width="100%" height="600px" />`;

        }

    });



    // --- INICIALIZAÇÃO ---

    carregarAgenda();

    carregarFinanceiro();

    carregarMembros();

    carregarRepertorio();

    carregarAnaliseIA();

});