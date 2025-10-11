// Aguarda o HTML ser completamente carregado para executar o script
document.addEventListener('DOMContentLoaded', function() {

    console.log("banda.js carregado e executando.");

    // --- LÓGICA DAS ABAS (MAIS SEGURA) ---
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0 && contents.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                console.log("Clique na aba:", this.dataset.tab); // Mensagem de diagnóstico
                
                tabs.forEach(item => item.classList.remove('ativo'));
                contents.forEach(item => item.classList.remove('ativo'));

                const target = document.getElementById(this.dataset.tab);
                this.classList.add('ativo');
                if (target) {
                    target.classList.add('ativo');
                } else {
                    console.error("Erro: Conteúdo da aba não encontrado para o ID:", this.dataset.tab);
                }
            });
        });
    } else {
        console.error("Erro: Abas ou conteúdos não encontrados. Verifique as classes '.tab-link' e '.tab-content' no seu HTML.");
        return; // Para a execução se os elementos principais não existem
    }
    
    // --- DADOS DE EXEMPLO ---
    const dadosFinanceiros = [ { data: '01/10', descricao: 'Cachê Show', valor: 800.00 }, { data: '03/10', descricao: 'Despesa: Cordas', valor: -80.00 }];
    let dadosMembros = [ { nome: 'Vicente Brenner', instrumento: 'Vocal e Guitarra' }, { nome: 'Alex Turner', instrumento: 'Bateria' }];
    const dadosRepertorio = [ { nome: 'Du, du liegst mir im Herzen', origem: 'Folclore Alemão', partitura: 'Du, Du Acordeon 2.pdf' }, { nome: 'Lili Marleen', origem: 'Hans Leip', partitura: null }];

    // --- FUNÇÕES PARA CADA ABA (COM VERIFICAÇÃO DE ERRO) ---

    function carregarFinanceiro() {
        const tabela = document.getElementById('corpoTabelaFinanceira');
        if (!tabela) return; // Se não achar a tabela, para aqui.
        tabela.innerHTML = '';
        dadosFinanceiros.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.data}</td><td>${item.descricao}</td><td class="${item.valor > 0 ? 'receita' : 'despesa'}">R$ ${item.valor.toFixed(2)}</td>`;
            tabela.appendChild(tr);
        });

        const canvas = document.getElementById('graficoFinanceiro');
        if (canvas) new Chart(canvas.getContext('2d'), { type: 'bar', data: { labels: ['Set', 'Out', 'Nov'], datasets: [{ label: 'Receitas', data: [1200, 1900, 3000], backgroundColor: 'rgba(46, 204, 113, 0.7)' }, { label: 'Despesas', data: [800, 1000, 1500], backgroundColor: 'rgba(231, 76, 60, 0.7)' }] }, options: { responsive: true } });
    }

    function carregarMembros() {
        const tabela = document.getElementById('corpoTabelaMembros');
        if (!tabela) return;
        tabela.innerHTML = '';
        dadosMembros.forEach((membro, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${membro.nome}</td><td>${membro.instrumento}</td><td><button class="btn-remover" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>`;
            tabela.appendChild(tr);
        });
    }

    function carregarRepertorio() {
        const tabela = document.getElementById('corpoTabelaRepertorio');
        if (!tabela) return;
        tabela.innerHTML = '';
        dadosRepertorio.forEach(musica => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${musica.nome}</td><td>${musica.origem}</td><td>${musica.partitura ? `<button class="btn-ver-partitura" data-partitura="${musica.partitura}"><i class="fas fa-file-pdf"></i> Ver Partitura</button>` : ''}</td>`;
            tabela.appendChild(tr);
        });
    }

    // --- EVENTOS DE INTERAÇÃO ---
    const formMembros = document.getElementById('formAdicionarMembro');
    if(formMembros) formMembros.addEventListener('submit', function(e) {
        e.preventDefault();
        const nomeInput = document.getElementById('nomeMembro');
        const instrumentoInput = document.getElementById('instrumentoMembro');
        dadosMembros.push({ nome: nomeInput.value, instrumento: instrumentoInput.value });
        carregarMembros();
        this.reset();
    });

    const tabelaMembros = document.getElementById('corpoTabelaMembros');
    if(tabelaMembros) tabelaMembros.addEventListener('click', function(e) {
        if (e.target.closest('.btn-remover')) {
            dadosMembros.splice(e.target.closest('.btn-remover').dataset.index, 1);
            carregarMembros();
        }
    });

    const tabelaRepertorio = document.getElementById('corpoTabelaRepertorio');
    if(tabelaRepertorio) tabelaRepertorio.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-ver-partitura');
        if (btn) {
            const pdfViewer = document.getElementById('visualizadorPdf');
            if(pdfViewer) pdfViewer.innerHTML = `<embed src="${btn.dataset.partitura}" type="application/pdf" width="100%" height="600px" />`;
        }
    });

    // --- INICIALIZAÇÃO ---
    carregarFinanceiro();
    carregarMembros();
    carregarRepertorio();
});