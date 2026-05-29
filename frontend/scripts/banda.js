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
        { nome: 'Querência Amada', origem: 'Teixeirinha', partituraUrl: null },
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

    // ============================================================
    // MOTOR DO CALENDÁRIO (Google Calendar Style)
    // ============================================================
    const CAL = {
        today: new Date(),
        cursor: new Date(),       // data de navegação atual
        miniCursor: new Date(),   // cursor do mini-calendário
        visao: 'semana',          // 'mes' | 'semana' | 'dia'
        filtros: new Set(['show','ensaio','gravacao','outro']),
        draggingIdx: null,
    };

    const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const HORAS = Array.from({length:24}, (_,i) => i); // 00h – 23h

    const COR_TIPO = { show:'#fa9848', ensaio:'#10b981', gravacao:'#8b5cf6', outro:'#3b82f6' };

    function isoToday() {
        const d = CAL.today;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    function isoDate(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    function eventosDosDia(dataIso) {
        return dadosAgenda.filter(e => e.data === dataIso && CAL.filtros.has(e.tipo || 'outro'));
    }
    function iniciarCalendario() {
        // Toolbar nav
        document.getElementById('calBtnHoje')?.addEventListener('click', () => { CAL.cursor = new Date(CAL.today); renderCal(); });
        document.getElementById('calPrev')?.addEventListener('click', () => { navegar(-1); });
        document.getElementById('calNext')?.addEventListener('click', () => { navegar(1); });

        // View switcher
        document.querySelectorAll('.cal-view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                CAL.visao = this.dataset.view;
                renderCal();
            });
        });

        // Mini-calendário nav
        document.getElementById('miniPrev')?.addEventListener('click', () => { CAL.miniCursor.setMonth(CAL.miniCursor.getMonth()-1); renderMini(); });
        document.getElementById('miniNext')?.addEventListener('click', () => { CAL.miniCursor.setMonth(CAL.miniCursor.getMonth()+1); renderMini(); });

        // Sidebar toggle (mobile)
        document.getElementById('calSidebarToggle')?.addEventListener('click', () => {
            document.getElementById('calSidebar')?.classList.toggle('aberto');
        });

        // Filtros de categoria
        document.querySelectorAll('.cat-filter').forEach(cb => {
            cb.addEventListener('change', function() {
                if (this.checked) CAL.filtros.add(this.dataset.tipo);
                else CAL.filtros.delete(this.dataset.tipo);
                renderCal();
            });
        });

        renderMini();
        renderCal();
        renderProximosEventos();
    }

    function navegar(dir) {
        if (CAL.visao === 'mes') {
            CAL.cursor.setMonth(CAL.cursor.getMonth() + dir);
        } else if (CAL.visao === 'semana') {
            CAL.cursor.setDate(CAL.cursor.getDate() + dir * 7);
        } else {
            CAL.cursor.setDate(CAL.cursor.getDate() + dir);
        }
        CAL.miniCursor = new Date(CAL.cursor);
        renderCal();
        renderMini();
    }

    function renderCal() {
        const label = document.getElementById('calCurrentDate');
        const content = document.getElementById('calContent');
        if (!content) return;
        content.innerHTML = '';
        content.className = 'cal-content cal-anim';
        void content.offsetWidth; // força reflow para animar

        if (CAL.visao === 'mes') {
            if (label) label.textContent = `${MESES[CAL.cursor.getMonth()]} ${CAL.cursor.getFullYear()}`;
            renderMes(content);
        } else if (CAL.visao === 'semana') {
            const semana = getSemana(CAL.cursor);
            const ini = semana[0], fim = semana[6];
            if (label) label.textContent = ini.getMonth() === fim.getMonth()
                ? `${ini.getDate()} – ${fim.getDate()} de ${MESES[ini.getMonth()]} ${ini.getFullYear()}`
                : `${ini.getDate()} ${MESES[ini.getMonth()].slice(0,3)} – ${fim.getDate()} ${MESES[fim.getMonth()].slice(0,3)} ${fim.getFullYear()}`;
            renderSemana(content, semana);
        } else {
            if (label) label.textContent = `${DIAS_SEMANA[CAL.cursor.getDay()]}, ${CAL.cursor.getDate()} de ${MESES[CAL.cursor.getMonth()]} ${CAL.cursor.getFullYear()}`;
            renderDia(content, CAL.cursor);
        }
    }

    // ---- VISÃO MÊS ----
    function renderMes(container) {
        const grid = document.createElement('div');
        grid.className = 'cal-month-grid';

        // Cabeçalho dias da semana
        DIAS_SEMANA.forEach(d => {
            const h = document.createElement('div');
            h.className = 'cal-month-dow';
            h.textContent = d;
            grid.appendChild(h);
        });

        const ano = CAL.cursor.getFullYear(), mes = CAL.cursor.getMonth();
        const primeiro = new Date(ano, mes, 1);
        const totalDias = new Date(ano, mes+1, 0).getDate();
        const offset = primeiro.getDay();
        const prevTotal = new Date(ano, mes, 0).getDate();

        // Dias do mês anterior
        for (let i = offset - 1; i >= 0; i--) {
            const cell = criarCelulaMes(new Date(ano, mes-1, prevTotal - i), true);
            grid.appendChild(cell);
        }
        // Dias do mês atual
        for (let d = 1; d <= totalDias; d++) {
            const cell = criarCelulaMes(new Date(ano, mes, d), false);
            grid.appendChild(cell);
        }
        // Completar última linha
        const total = offset + totalDias;
        const resto = total % 7 === 0 ? 0 : 7 - (total % 7);
        for (let d = 1; d <= resto; d++) {
            const cell = criarCelulaMes(new Date(ano, mes+1, d), true);
            grid.appendChild(cell);
        }

        container.appendChild(grid);
    }

    function criarCelulaMes(date, fora) {
        const cell = document.createElement('div');
        const iso = isoDate(date);
        cell.className = 'cal-month-cell' + (fora ? ' fora-mes' : '') + (iso === isoToday() ? ' hoje' : '');
        cell.dataset.date = iso;

        const numEl = document.createElement('span');
        numEl.className = 'cal-day-num';
        numEl.textContent = date.getDate();
        cell.appendChild(numEl);

        // Eventos do dia
        const evs = eventosDosDia(iso);
        const maxVisiveis = 3;
        evs.slice(0, maxVisiveis).forEach((ev, i) => {
            const chip = document.createElement('div');
            chip.className = 'cal-event-chip';
            chip.style.background = COR_TIPO[ev.tipo] || COR_TIPO.outro;
            chip.textContent = ev.titulo;
            chip.title = ev.titulo;
            chip.draggable = true;
            chip.dataset.idx = dadosAgenda.indexOf(ev);
            chip.addEventListener('dragstart', onDragStart);
            chip.addEventListener('click', e => { e.stopPropagation(); mostrarPopoverEvento(ev, chip); });
            cell.appendChild(chip);
        });
        if (evs.length > maxVisiveis) {
            const mais = document.createElement('div');
            mais.className = 'cal-mais-eventos';
            mais.textContent = `+${evs.length - maxVisiveis} mais`;
            cell.appendChild(mais);
        }

        // Drop target
        cell.addEventListener('dragover', e => { e.preventDefault(); cell.classList.add('cal-drop-over'); });
        cell.addEventListener('dragleave', () => cell.classList.remove('cal-drop-over'));
        cell.addEventListener('drop', e => { e.preventDefault(); cell.classList.remove('cal-drop-over'); onDrop(iso); });

        // Clique para criar evento
        cell.addEventListener('click', () => abrirModalNovaData(iso));

        return cell;
    }

    // ---- VISÃO SEMANA ----
    function getSemana(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return Array.from({length:7}, (_,i) => { const x = new Date(d); x.setDate(d.getDate()+i); return x; });
    }

    function renderSemana(container, semana) {
        const wrap = document.createElement('div');
        wrap.className = 'cal-week-wrap';

        // Cabeçalho dos dias
        const header = document.createElement('div');
        header.className = 'cal-week-header';
        const cornerEl = document.createElement('div');
        cornerEl.className = 'cal-week-corner';
        header.appendChild(cornerEl);
        semana.forEach(day => {
            const col = document.createElement('div');
            col.className = 'cal-week-head-col' + (isoDate(day) === isoToday() ? ' hoje' : '');
            col.innerHTML = `<span class="cal-dow-label">${DIAS_SEMANA[day.getDay()]}</span><span class="cal-day-badge${isoDate(day)===isoToday()?' hoje':''}">${day.getDate()}</span>`;
            col.addEventListener('click', () => abrirModalNovaData(isoDate(day)));
            header.appendChild(col);
        });
        wrap.appendChild(header);

        // Corpo Grid Engine
        const body = document.createElement('div');
        body.className = 'cal-week-body cal-grid-engine';

        // Linhas de Tempo e Divisórias Horizontais
        HORAS.forEach((hora, index) => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'cal-time-label-wrapper';
            timeLabel.style.gridRow = `${index + 1}`;
            timeLabel.style.gridColumn = '1';
            timeLabel.innerHTML = `<span class="cal-time-label">${String(hora).padStart(2,'0')}:00</span>`;
            body.appendChild(timeLabel);

            const gridLine = document.createElement('div');
            gridLine.className = 'cal-grid-line';
            gridLine.style.gridRow = `${index + 1}`;
            gridLine.style.gridColumn = '2 / -1';
            body.appendChild(gridLine);
        });

        // Colunas de Dias
        semana.forEach((day, index) => {
            const col = document.createElement('div');
            col.className = 'cal-day-col';
            col.style.gridRow = '1 / -1';
            col.style.gridColumn = `${index + 2}`;
            col.dataset.date = isoDate(day);

            // Linha da hora atual
            if (isoDate(day) === isoToday()) {
                const currentLine = document.createElement('div');
                currentLine.className = 'cal-current-time';
                const totalMinutes = CAL.today.getHours() * 60 + CAL.today.getMinutes();
                currentLine.style.top = `${(totalMinutes / (24 * 60)) * 100}%`;
                col.appendChild(currentLine);
            }

            // Eventos com horário nessa célula
            eventosDosDia(isoDate(day)).forEach(ev => {
                const evParts = (ev.hora || '00:00').split(':');
                const evHora = parseInt(evParts[0], 10);
                const evMin = parseInt(evParts[1] || '0', 10);

                const startMinutes = evHora * 60 + evMin;
                const duracaoHoras = ev.tipo === 'show' ? 3 : (ev.tipo === 'ensaio' ? 2 : 1.5);
                const duracaoMinutes = duracaoHoras * 60;

                const chip = document.createElement('div');
                chip.className = 'cal-week-event';
                chip.style.borderLeftColor = COR_TIPO[ev.tipo] || COR_TIPO.outro;
                chip.style.top = `${(startMinutes / (24 * 60)) * 100}%`;
                chip.style.height = `calc(${(duracaoMinutes / (24 * 60)) * 100}% - 2px)`;

                chip.innerHTML = `<strong>${ev.titulo}</strong><small>${ev.hora || ''} · ${ev.local || ''}</small>`;
                chip.draggable = true;
                chip.dataset.idx = dadosAgenda.indexOf(ev);
                chip.addEventListener('dragstart', onDragStart);
                chip.addEventListener('click', e => { e.stopPropagation(); mostrarPopoverEvento(ev, chip); });
                col.appendChild(chip);
            });

            col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('cal-drop-over'); });
            col.addEventListener('dragleave', () => col.classList.remove('cal-drop-over'));
            col.addEventListener('drop', e => {
                e.preventDefault(); col.classList.remove('cal-drop-over');
                const rect = col.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const dropMinutes = (y / rect.height) * (24 * 60);
                const dropHour = Math.floor(dropMinutes / 60);
                onDrop(isoDate(day), dropHour);
            });
            col.addEventListener('click', (e) => {
                if (e.target === col) {
                    const rect = col.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const clickMinutes = (y / rect.height) * (24 * 60);
                    const clickHour = Math.floor(clickMinutes / 60);
                    abrirModalNovaData(isoDate(day), clickHour);
                }
            });
            body.appendChild(col);
        });

        wrap.appendChild(body);
        container.appendChild(wrap);

        // Scroll até hora atual
        const scrollTarget = Math.max(0, CAL.today.getHours() - 2);
        setTimeout(() => { body.scrollTop = scrollTarget * 60; }, 50);
    }

    // ---- VISÃO DIA ----
    function renderDia(container, date) {
        const iso = isoDate(date);
        const wrap = document.createElement('div');
        wrap.className = 'cal-day-wrap';

        const header = document.createElement('div');
        header.className = 'cal-week-header';
        const cornerEl = document.createElement('div');
        cornerEl.className = 'cal-week-corner';
        header.appendChild(cornerEl);

        const colHead = document.createElement('div');
        colHead.className = 'cal-week-head-col' + (iso === isoToday() ? ' hoje' : '');
        colHead.style.flex = "1";
        colHead.innerHTML = `<span class="cal-dow-label">${DIAS_SEMANA[date.getDay()]}</span><span class="cal-day-badge${iso===isoToday()?' hoje':''}">${date.getDate()}</span>`;
        header.appendChild(colHead);
        wrap.appendChild(header);

        const body = document.createElement('div');
        body.className = 'cal-week-body cal-grid-engine cal-grid-day';

        HORAS.forEach((hora, index) => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'cal-time-label-wrapper';
            timeLabel.style.gridRow = `${index + 1}`;
            timeLabel.style.gridColumn = '1';
            timeLabel.innerHTML = `<span class="cal-time-label">${String(hora).padStart(2,'0')}:00</span>`;
            body.appendChild(timeLabel);

            const gridLine = document.createElement('div');
            gridLine.className = 'cal-grid-line';
            gridLine.style.gridRow = `${index + 1}`;
            gridLine.style.gridColumn = '2';
            body.appendChild(gridLine);
        });

        const col = document.createElement('div');
        col.className = 'cal-day-col';
        col.style.gridRow = '1 / -1';
        col.style.gridColumn = `2`;
        col.dataset.date = iso;

        if (iso === isoToday()) {
            const currentLine = document.createElement('div');
            currentLine.className = 'cal-current-time';
            const totalMinutes = CAL.today.getHours() * 60 + CAL.today.getMinutes();
            currentLine.style.top = `${(totalMinutes / (24 * 60)) * 100}%`;
            col.appendChild(currentLine);
        }

        eventosDosDia(iso).forEach(ev => {
            const evParts = (ev.hora || '00:00').split(':');
            const evHora = parseInt(evParts[0], 10);
            const evMin = parseInt(evParts[1] || '0', 10);

            const startMinutes = evHora * 60 + evMin;
            const duracaoHoras = ev.tipo === 'show' ? 3 : (ev.tipo === 'ensaio' ? 2 : 1.5);
            const duracaoMinutes = duracaoHoras * 60;

            const chip = document.createElement('div');
            chip.className = 'cal-day-event';
            chip.style.borderLeftColor = COR_TIPO[ev.tipo] || COR_TIPO.outro;
            chip.style.top = `${(startMinutes / (24 * 60)) * 100}%`;
            chip.style.height = `calc(${(duracaoMinutes / (24 * 60)) * 100}% - 2px)`;

            chip.innerHTML = `<strong>${ev.titulo}</strong><span>${ev.hora||''} · ${ev.local||''}</span>`;
            chip.addEventListener('click', e => { e.stopPropagation(); mostrarPopoverEvento(ev, chip); });
            col.appendChild(chip);
        });

        col.addEventListener('click', (e) => {
            if (e.target === col) {
                const rect = col.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const clickMinutes = (y / rect.height) * (24 * 60);
                const clickHour = Math.floor(clickMinutes / 60);
                abrirModalNovaData(iso, clickHour);
            }
        });
        body.appendChild(col);

        wrap.appendChild(body);
        container.appendChild(wrap);

        const scrollTarget = Math.max(0, CAL.today.getHours() - 2);
        setTimeout(() => { body.scrollTop = scrollTarget * 60; }, 50);
    }

    // ---- MINI-CALENDÁRIO ----
    function renderMini() {
        const label = document.getElementById('miniLabel');
        const daysEl = document.getElementById('miniDays');
        if (!label || !daysEl) return;

        const ano = CAL.miniCursor.getFullYear(), mes = CAL.miniCursor.getMonth();
        label.textContent = `${MESES[mes].slice(0,3)} ${ano}`;
        daysEl.innerHTML = '';

        const primeiro = new Date(ano, mes, 1);
        const total = new Date(ano, mes+1, 0).getDate();
        const offset = primeiro.getDay();
        const prevTotal = new Date(ano, mes, 0).getDate();

        for (let i = offset-1; i >= 0; i--) {
            const s = document.createElement('span');
            s.className = 'mini-day fora'; s.textContent = prevTotal - i;
            daysEl.appendChild(s);
        }
        for (let d = 1; d <= total; d++) {
            const iso = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const s = document.createElement('span');
            s.className = 'mini-day' + (iso === isoToday() ? ' hoje' : '') + (iso === isoDate(CAL.cursor) ? ' selecionado' : '');
            if (eventosDosDia(iso).length) s.classList.add('tem-evento');
            s.textContent = d;
            s.addEventListener('click', () => {
                CAL.cursor = new Date(ano, mes, d);
                CAL.miniCursor = new Date(CAL.cursor);
                renderCal();
                renderMini();
            });
            daysEl.appendChild(s);
        }
        const resto = (offset + total) % 7 === 0 ? 0 : 7 - ((offset+total)%7);
        for (let d = 1; d <= resto; d++) {
            const s = document.createElement('span');
            s.className = 'mini-day fora'; s.textContent = d;
            daysEl.appendChild(s);
        }
    }

    // ---- DRAG & DROP ----
    function onDragStart(e) {
        CAL.draggingIdx = parseInt(e.currentTarget.dataset.idx);
        e.dataTransfer.effectAllowed = 'move';
    }
    function onDrop(novaData, novaHora) {
        if (CAL.draggingIdx === null || CAL.draggingIdx < 0) return;
        dadosAgenda[CAL.draggingIdx].data = novaData;
        if (novaHora !== undefined) {
            dadosAgenda[CAL.draggingIdx].hora = `${String(novaHora).padStart(2,'0')}:00`;
        }
        CAL.draggingIdx = null;
        renderCal();
        renderMini();
        showSnackbar('Evento movido!');
    }

    // ---- POPOVER DE EVENTO (Estilo Google Calendar) ----
    function mostrarPopoverEvento(ev, anchor) {
        document.querySelectorAll('.cal-popover').forEach(p => p.remove());

        const pop = document.createElement('div');
        pop.className = 'cal-popover';
        const cor = COR_TIPO[ev.tipo] || COR_TIPO.outro;
        const idx = dadosAgenda.indexOf(ev);
        const dataEvento = new Date(ev.data + 'T12:00:00');
        const hoje = new Date(); hoje.setHours(0,0,0,0);
        const diffDias = Math.round((dataEvento - hoje) / (1000 * 60 * 60 * 24));
        const diffTexto = diffDias === 0 ? 'Hoje' : diffDias === 1 ? 'Amanhã' : diffDias < 0 ? `Há ${Math.abs(diffDias)} dias` : `Em ${diffDias} dias`;
        const diffClass = diffDias < 0 ? 'pop-diff passado' : diffDias === 0 ? 'pop-diff hoje' : 'pop-diff futuro';

        const iconesTipo = { show: 'fa-microphone-alt', ensaio: 'fa-guitar', gravacao: 'fa-headphones', outro: 'fa-calendar-check' };
        const icone = iconesTipo[ev.tipo] || 'fa-calendar-check';
        const nomeTipo = { show: 'Show', ensaio: 'Ensaio', gravacao: 'Gravação', outro: 'Outro' };

        pop.innerHTML = `
            <div class="cal-pop-strip" style="background:${cor}"></div>
            <div class="cal-pop-actions-top">
                <button class="cal-pop-icon-btn cal-pop-edit" title="Editar título"><i class="fas fa-pencil-alt"></i></button>
                <button class="cal-pop-icon-btn cal-pop-close" title="Fechar"><i class="fas fa-times"></i></button>
            </div>
            <div class="cal-pop-body">
                <div class="cal-pop-title-row">
                    <span class="cal-pop-type-dot" style="background:${cor}"></span>
                    <h3 class="cal-pop-title" id="popTitulo_${idx}">${ev.titulo}</h3>
                </div>

                <div class="cal-pop-row">
                    <span class="cal-pop-icon-wrap"><i class="far fa-calendar-alt"></i></span>
                    <div>
                        <div class="cal-pop-date-main">${dataEvento.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <span class="${diffClass}">${diffTexto}</span>
                    </div>
                </div>

                ${ev.hora ? `
                <div class="cal-pop-row">
                    <span class="cal-pop-icon-wrap"><i class="far fa-clock"></i></span>
                    <span>${ev.hora}</span>
                </div>` : ''}

                ${ev.local ? `
                <div class="cal-pop-row">
                    <span class="cal-pop-icon-wrap"><i class="fas fa-map-marker-alt"></i></span>
                    <span>${ev.local}</span>
                </div>` : ''}

                <div class="cal-pop-row">
                    <span class="cal-pop-icon-wrap"><i class="fas ${icone}"></i></span>
                    <span class="cal-pop-tipo-badge" style="background:${cor}20;color:${cor}">${nomeTipo[ev.tipo] || 'Outro'}</span>
                </div>
            </div>
            <div class="cal-pop-footer">
                <button class="cal-pop-delete" data-idx="${idx}">
                    <i class="fas fa-trash-alt"></i> Remover evento
                </button>
            </div>`;

        // Fechar
        pop.querySelector('.cal-pop-close').addEventListener('click', () => pop.remove());

        // Editar título inline
        pop.querySelector('.cal-pop-edit').addEventListener('click', () => {
            const h3 = pop.querySelector('.cal-pop-title');
            const input = document.createElement('input');
            input.className = 'cal-pop-title-input';
            input.value = h3.textContent;
            h3.replaceWith(input);
            input.focus();
            input.select();
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    ev.titulo = input.value.trim() || ev.titulo;
                    renderCal(); renderMini(); renderProximosEventos();
                    pop.remove();
                }
                if (e.key === 'Escape') pop.remove();
            });
            input.addEventListener('blur', () => {
                ev.titulo = input.value.trim() || ev.titulo;
                renderCal(); renderMini(); renderProximosEventos();
                pop.remove();
            });
        });

        // Remover
        pop.querySelector('.cal-pop-delete').addEventListener('click', () => {
            dadosAgenda.splice(idx, 1);
            pop.remove();
            renderCal(); renderMini(); renderProximosEventos();
            showSnackbar('Evento removido.');
        });

        document.body.appendChild(pop);

        // Posicionamento inteligente
        const rect = anchor.getBoundingClientRect();
        const popW = 320, popH = 280;
        let top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX;

        // Evitar sair pela direita
        if (left + popW > window.innerWidth - 16) left = window.innerWidth - popW - 16;
        // Evitar sair pela parte inferior
        if (rect.bottom + popH > window.innerHeight) top = rect.top + window.scrollY - popH - 8;
        // Nunca sair pelo topo
        if (top < window.scrollY + 8) top = window.scrollY + 8;

        pop.style.top = `${top}px`;
        pop.style.left = `${Math.max(8, left)}px`;

        setTimeout(() => document.addEventListener('click', function handler(e) {
            if (!pop.contains(e.target) && e.target !== anchor) {
                pop.remove();
                document.removeEventListener('click', handler);
            }
        }), 50);
    }

    // ---- PRÓXIMOS ENCONTROS (Sidebar) ----
    function renderProximosEventos() {
        const container = document.getElementById('proximosEventosList');
        if (!container) return;

        const hoje = new Date(); hoje.setHours(0,0,0,0);
        const proximos = [...dadosAgenda]
            .filter(e => new Date(e.data + 'T12:00:00') >= hoje)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5); // Mostra até 5 próximos

        if (proximos.length === 0) {
            container.innerHTML = `<p class="cal-proximos-empty"><i class="far fa-calendar-check"></i><br>Nenhum evento<br>próximo.</p>`;
            return;
        }

        container.innerHTML = '';
        proximos.forEach(ev => {
            const dataEvento = new Date(ev.data + 'T12:00:00');
            const diffDias = Math.round((dataEvento - hoje) / (1000 * 60 * 60 * 24));
            const diffTexto = diffDias === 0 ? 'Hoje' : diffDias === 1 ? 'Amanhã' : `Em ${diffDias} dias`;
            const cor = COR_TIPO[ev.tipo] || COR_TIPO.outro;
            const diaStr = dataEvento.getDate();
            const mesStr = dataEvento.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

            const item = document.createElement('div');
            item.className = 'cal-proximo-item';
            item.innerHTML = `
                <div class="cal-prox-date" style="border-left-color:${cor}">
                    <span class="cal-prox-dia">${diaStr}</span>
                    <span class="cal-prox-mes">${mesStr}</span>
                </div>
                <div class="cal-prox-info">
                    <span class="cal-prox-titulo">${ev.titulo}</span>
                    <span class="cal-prox-diff">${diffTexto}${ev.hora ? ' · ' + ev.hora : ''}</span>
                </div>
                <div class="cal-prox-dot" style="background:${cor}"></div>
            `;
            item.addEventListener('click', () => mostrarPopoverEvento(ev, item));
            container.appendChild(item);
        });
    }


    // ---- ABRIR MODAL COM DATA PRÉ-PREENCHIDA ----
    function abrirModalNovaData(iso, hora) {
        const modal = document.getElementById('eventoModal');
        if (!modal) return;
        const dataInput = document.getElementById('dataEvento') || modal.querySelector('[name="dataEvento"]');
        const horaInput = modal.querySelector('[name="horaEvento"]') || modal.querySelector('#horaEvento');
        if (dataInput) dataInput.value = iso;
        if (horaInput && hora !== undefined) horaInput.value = `${String(hora).padStart(2,'0')}:00`;
        modal.style.display = 'block';
    }

    function carregarAgenda() { renderCal(); renderMini(); }



    let filtroFinanceiroAtual = 'all';
    let filtroSerieAtual = 'both';

    function carregarFinanceiro() {
        const tabela = document.getElementById('corpoTabelaFinanceira');
        const saldoEl = document.getElementById('saldoAtual');
        const receitaEl = document.getElementById('receitaMes');
        const despesaEl = document.getElementById('despesaMes');
        const lucratividadeEl = document.getElementById('lucratividade');
        const labelReceita = document.getElementById('labelReceitaMes');
        const labelDespesa = document.getElementById('labelDespesaMes');
        const canvasEvolucao = document.getElementById('graficoEvolucao');

        if (!tabela || !saldoEl || !receitaEl || !despesaEl || !canvasEvolucao) {
            console.error("Elementos essenciais do financeiro não encontrados.");
            return;
        }

        let saldoTotal = 0;
        let receitaPeriodo = 0;
        let despesaPeriodo = 0;

        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();

        // Determina data de corte pelo filtro de período
        let dataCorte = new Date(0);
        let labelPeriodo = 'Total';
        if (filtroFinanceiroAtual === 'year') {
            dataCorte = new Date(anoAtual, 0, 1);
            labelPeriodo = 'do Ano';
        } else if (filtroFinanceiroAtual === 'month') {
            dataCorte = new Date(anoAtual, mesAtual, 1);
            labelPeriodo = 'do Mês';
        }
        if (labelReceita) labelReceita.textContent = `Receita ${labelPeriodo}`;
        if (labelDespesa) labelDespesa.textContent = `Despesa ${labelPeriodo}`;

        const evolucaoMensal = {};

        tabela.innerHTML = '';
        dadosFinanceiros.sort((a, b) => new Date(b.data) - new Date(a.data));

        if (dadosFinanceiros.length === 0) {
            tabela.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i><br>Nenhuma transação registrada.</p>';
        } else {
            // Saldo sempre considera todos os dados (carteira real)
            dadosFinanceiros.forEach(item => {
                const valor = parseFloat(item.valor);
                const isDespesa = item.tipo === 'DESPESA';
                saldoTotal += isDespesa ? -valor : valor;
            });

            // Filtra pelo período
            const dadosFiltrados = dadosFinanceiros.filter(item =>
                new Date(item.data + "T12:00:00") >= dataCorte
            );

            if (dadosFiltrados.length === 0) {
                tabela.innerHTML = '<p class="empty-state"><i class="fas fa-search"></i><br>Nenhuma transação no período.</p>';
            }

            const fragment = document.createDocumentFragment();
            dadosFiltrados.forEach(item => {
                const valor = parseFloat(item.valor);
                const dataItem = new Date(item.data + "T12:00:00");
                const mesItem = dataItem.getMonth();
                const anoItem = dataItem.getFullYear();
                const chaveMesAno = `${anoItem}-${String(mesItem + 1).padStart(2, '0')}`;
                const isDespesa = item.tipo === 'DESPESA';

                isDespesa ? (despesaPeriodo += valor) : (receitaPeriodo += valor);

                if (!evolucaoMensal[chaveMesAno]) {
                    evolucaoMensal[chaveMesAno] = { receita: 0, despesa: 0 };
                }
                isDespesa
                    ? (evolucaoMensal[chaveMesAno].despesa += valor)
                    : (evolucaoMensal[chaveMesAno].receita += valor);

                // Renderiza item do extrato
                const div = document.createElement('div');
                div.className = 'transacao-item-moderno';
                const categoriaClass = item.categoria.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const iconeBase = isDespesa ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up';
                const corIcone = isDespesa ? 'despesa-icon' : 'receita-icon';

                div.innerHTML = `
                    <div class="transacao-icone ${corIcone}">
                        <i class="fas ${iconeBase}"></i>
                    </div>
                    <div class="transacao-info">
                        <h4>${item.descricao}</h4>
                        <div class="transacao-meta">
                            <span class="categoria-tag cat-${categoriaClass}">${item.categoria}</span>
                            <span class="transacao-data"><i class="far fa-calendar-alt"></i> ${dataItem.toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <div class="transacao-valor ${isDespesa ? 'despesa' : 'receita'}">
                        ${isDespesa ? '-' : '+'} R$ ${valor.toFixed(2).replace('.', ',')}
                    </div>
                `;
                fragment.appendChild(div);
            });
            tabela.appendChild(fragment);
        }

        // Atualiza KPIs
        const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
        saldoEl.textContent = fmt(saldoTotal);
        receitaEl.textContent = fmt(receitaPeriodo);
        despesaEl.textContent = fmt(despesaPeriodo);

        // Lucratividade = (receita - despesa) / receita * 100
        if (lucratividadeEl) {
            const lucro = receitaPeriodo - despesaPeriodo;
            const pct = receitaPeriodo > 0 ? ((lucro / receitaPeriodo) * 100).toFixed(1) : 0;
            lucratividadeEl.textContent = `${pct}%`;
            lucratividadeEl.style.color = lucro >= 0 ? 'var(--cor-sucesso)' : 'var(--cor-erro)';
        }

        // Trend do saldo
        const saldoTrend = document.getElementById('saldoTrend');
        if (saldoTrend) {
            const diff = receitaPeriodo - despesaPeriodo;
            if (diff > 0) {
                saldoTrend.innerHTML = `<i class="fas fa-arrow-up"></i> +${fmt(diff)} no período`;
                saldoTrend.style.color = 'var(--cor-sucesso)';
            } else if (diff < 0) {
                saldoTrend.innerHTML = `<i class="fas fa-arrow-down"></i> ${fmt(diff)} no período`;
                saldoTrend.style.color = 'var(--cor-erro)';
            } else {
                saldoTrend.innerHTML = '';
            }
        }

        // ---- GRÁFICO ----
        window._evolucaoMensal = evolucaoMensal; // Salva para o filtro de série
        renderizarGrafico(evolucaoMensal);

    }

    function renderizarGrafico(evolucaoMensal) {
        const canvasEvolucao = document.getElementById('graficoEvolucao');
        if (!canvasEvolucao) return;

        const labelsEvolucao = Object.keys(evolucaoMensal).sort();
        const dadosReceita = labelsEvolucao.map(m => evolucaoMensal[m].receita);
        const dadosDespesa = labelsEvolucao.map(m => evolucaoMensal[m].despesa);

        // Labels mais legíveis (ex: "Ago 2025")
        const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const labelsLegíveis = labelsEvolucao.map(l => {
            const [ano, mes] = l.split('-');
            return `${nomesMeses[parseInt(mes) - 1]} ${ano}`;
        });

        if (window.graficoLinha) {
            window.graficoLinha.destroy();
            window.graficoLinha = null;
        }

        // Contexto do canvas
        const ctx = canvasEvolucao.getContext('2d');

        // Gradientes
        const gradReceita = ctx.createLinearGradient(0, 0, 0, 420);
        gradReceita.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradReceita.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const gradDespesa = ctx.createLinearGradient(0, 0, 0, 420);
        gradDespesa.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradDespesa.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        // Monta datasets conforme filtro de série
        const datasets = [];
        if (filtroSerieAtual === 'both' || filtroSerieAtual === 'receita') {
            datasets.push({
                label: 'Receita',
                data: dadosReceita,
                borderColor: '#10b981',
                backgroundColor: gradReceita,
                fill: true,
                tension: 0.45,
                borderWidth: 2.5,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2.5,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#10b981',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            });
        }
        if (filtroSerieAtual === 'both' || filtroSerieAtual === 'despesa') {
            datasets.push({
                label: 'Despesa',
                data: dadosDespesa,
                borderColor: '#ef4444',
                backgroundColor: gradDespesa,
                fill: true,
                tension: 0.45,
                borderWidth: 2.5,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#ef4444',
                pointBorderWidth: 2.5,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#ef4444',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            });
        }

        window.graficoLinha = new Chart(ctx, {
            type: 'line',
            data: { labels: labelsLegíveis, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600, easing: 'easeInOutQuart' },
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            pointStyleWidth: 10,
                            padding: 20,
                            color: '#374151',
                            font: { family: "'Montserrat', sans-serif", size: 13, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(1, 16, 41, 0.92)',
                        titleColor: '#f9fafb',
                        bodyColor: '#d1d5db',
                        titleFont: { size: 13, family: "'Montserrat', sans-serif", weight: 'bold' },
                        bodyFont: { size: 12, family: "'Open Sans', sans-serif" },
                        padding: 14,
                        cornerRadius: 10,
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        boxPadding: 4,
                        callbacks: {
                            label: ctx => {
                                const v = ctx.parsed.y;
                                const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
                                return `  ${ctx.dataset.label}: ${formatted}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: {
                            color: '#9ca3af',
                            font: { family: "'Open Sans', sans-serif", size: 11 },
                            maxRotation: 0
                        },
                        border: { display: false }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0,0,0,0.04)',
                            drawBorder: false,
                            drawTicks: false,
                        },
                        beginAtZero: true,
                        ticks: {
                            color: '#9ca3af',
                            font: { family: "'Open Sans', sans-serif", size: 11 },
                            padding: 10,
                            callback: v => 'R$ ' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v)
                        },
                        border: { display: false }
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
        const fragment = document.createDocumentFragment();
        dadosMembros.forEach((membro, index) => {
            const tr = document.createElement('tr');
            // Modificado: Adiciona coluna de email
            tr.innerHTML = `
                <td>${membro.nome || '(Nome não disponível)'}</td>
                <td>${membro.email}</td>
                <td>${membro.instrumento}</td>
                <td><button class="btn-icon btn-remover" data-tipo="membro" data-index="${index}" title="Remover membro"><i class="fas fa-trash-alt"></i></button></td>`;
            fragment.appendChild(tr);
        });
        tabela.appendChild(fragment);
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

        const fragment = document.createDocumentFragment();
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
            fragment.appendChild(li);
        });
        listaUl.appendChild(fragment);
    }


    function carregarRepertorio() {
        const containerCards = document.getElementById('corpoRepertorioCards');
        if (!containerCards) return;
        containerCards.innerHTML = '';
        
        if (dadosRepertorio.length === 0) { 
            containerCards.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1;">Nenhuma música no repertório.</p>'; 
            return; 
        }
        
        const fragment = document.createDocumentFragment();
        dadosRepertorio.forEach((musica, index) => {
            const card = document.createElement('div');
            card.className = 'repertorio-card-modern';
            card.innerHTML = `
                <div class="rep-card-icon">
                    <i class="fas fa-music"></i>
                </div>
                <div class="rep-card-info">
                    <h4>${musica.nome}</h4>
                    <p class="origin"><i class="fas fa-user-edit"></i> ${musica.origem || 'Desconhecido'}</p>
                </div>
                <div class="rep-card-actions">
                    ${musica.partituraUrl ? `<button class="btn-ver-partitura-modern" data-partitura-url="${musica.partituraUrl}" title="Ver Partitura"><i class="fas fa-eye"></i> Ver</button>` : '<span class="no-sheet">Sem Partitura</span>'}
                    <button class="btn-icon-modern btn-remover" data-tipo="repertorio" data-index="${index}" title="Remover música"><i class="fas fa-trash-alt"></i></button>
                </div>`;
            fragment.appendChild(card);
        });
        containerCards.appendChild(fragment);
    }

    // Removida função carregarAnaliseIA

    // --- CONTROLE DOS MODAIS ---
    function setupModal(modalId, abrirBtnId, formId, onSave) {
        const modal = document.getElementById(modalId);
        const abrirBtn = document.getElementById(abrirBtnId);
        const form = document.getElementById(formId);
        const closeButton = modal ? modal.querySelector('.close-button') : null;

        if (modal && abrirBtn && closeButton && form) {
            abrirBtn.onclick = () => { modal.style.display = "block"; };
            const closeModal = () => {
                modal.classList.add('fade-out');
                setTimeout(() => {
                    modal.style.display = "none";
                    modal.classList.remove('fade-out');
                    form.reset();
                }, 300);
            };
            closeButton.onclick = closeModal;
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal();
                }
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                onSave(this, closeModal);
            });
        } else {
             console.error(`Erro ao configurar o modal: ${modalId}, ${abrirBtnId}, ${formId}`);
        }
    }

    // Configura os modais específicos
    setupModal('transacaoModal', 'abrirModalTransacaoBtn', 'formAdicionarTransacao', (form, closeModal) => {
        const valor = parseFloat(form.valor.value);
        if (isNaN(valor) || valor <= 0) {
            showSnackbar("Valor inválido.");
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
        showSnackbar("Salvo com sucesso!");
        if (closeModal) closeModal();
    });

    setupModal('membroModal', 'abrirModalMembroBtn', 'formAdicionarMembro', (form, closeModal) => {
        const emailConvidado = form.emailMembro.value.trim().toLowerCase();
        const instrumentoConvidado = form.instrumentoMembro.value.trim();

        if (!emailConvidado || !instrumentoConvidado) {
            showSnackbar("Preencha o e-mail e o instrumento.");
            return;
        }

        // Verifica se o usuário já é membro
        const jaEhMembro = dadosMembros.some(membro => membro.email === emailConvidado);
        if (jaEhMembro) {
            showSnackbar(`Este usuário já faz parte da banda.`);
            return;
        }

        // Verifica se já existe um convite pendente para este email
        const convitePendente = dadosConvitesPendentes.some(convite => convite.emailConvidado === emailConvidado);
        if (convitePendente) {
            showSnackbar(`Já existe um convite pendente para ${emailConvidado}.`);
            return;
        }

        // *** SIMULAÇÃO: Busca o usuário na lista de usuários cadastrados ***
        const usuarioEncontrado = dadosUsuariosSimulados.find(user => user.email === emailConvidado);

        if (!usuarioEncontrado) {
            showSnackbar(`Erro: Usuário com e-mail ${emailConvidado} não encontrado no Music Makers.`);
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
        showSnackbar("Salvo com sucesso!");
        if (closeModal) closeModal();
    });

    setupModal('eventoModal', 'abrirModalEventoBtn', 'formAdicionarEvento', (form, closeModal) => {
        dadosAgenda.push({
            titulo: form.tituloEvento.value,
            data: form.dataEvento.value,
            hora: form.horaEvento ? form.horaEvento.value : '',
            local: form.localEvento.value,
            tipo: form.tipoEvento.value || 'outro'
        });
        renderCal();
        renderMini();
        renderProximosEventos();
        showSnackbar("Salvo com sucesso!");
        if (closeModal) closeModal();
    });


    setupModal('musicaModal', 'abrirModalMusicaBtn', 'formAdicionarMusica', (form, closeModal) => {
        const nomeMusica = form.nomeMusica.value;
        const origemMusica = form.origemMusica.value;
        const fileInput = form.partituraMusica;
        let partituraUrlTemp = null; // Usaremos URL temporária

        // Verifica se um arquivo foi selecionado e é PDF
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.type === "application/pdf") {
                partituraUrlTemp = URL.createObjectURL(file);
                console.log("URL temporária criada:", partituraUrlTemp);
            } else {
                showSnackbar("Erro: Selecione um arquivo PDF.");
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
        showSnackbar("Salvo com sucesso!");
        if (closeModal) closeModal(); // Fecha modal animado
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
                 }
            }
        }

        // Botão Ver Partitura
        const partituraBtn = e.target.closest('.btn-ver-partitura-modern');
        if (partituraBtn) {
            // Modificado para usar data-partitura-url
            const pdfUrl = partituraBtn.dataset.partituraUrl;
            const pdfViewer = document.getElementById('visualizadorPdf');
            if(pdfViewer && pdfUrl) {
                 // Usa <embed> para visualização inline
                 pdfViewer.innerHTML = `<embed src="${pdfUrl}" type="application/pdf" width="100%" height="900px" />`;
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

    // --- FILTROS DE PERÍODO ---
    document.querySelectorAll('.fin-period-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.fin-period-filters .filter-btn').forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            filtroFinanceiroAtual = this.dataset.filter;
            carregarFinanceiro();
        });
    });

    // --- FILTROS DE SÉRIE ---
    document.querySelectorAll('.fin-series-filters .series-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.fin-series-filters .series-btn').forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            filtroSerieAtual = this.dataset.series;
            // Apenas re-renderiza o gráfico sem refazer toda a lógica
            const evolucaoMensal = window._evolucaoMensal || {};
            renderizarGrafico(evolucaoMensal);
        });
    });

    // --- INICIALIZAÇÃO ---
    // Simulação: Verificar se o usuário "pertence" a uma banda (poderia vir do localStorage após login)
    const usuarioPertenceBanda = true; // Mude para false para testar o cenário sem banda
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')); // Pega info do usuário logado

    if (usuarioPertenceBanda) {
        iniciarCalendario();
        carregarFinanceiro();
        carregarMembros();
        carregarConvitesPendentes(); // Carrega a lista de convites
        carregarRepertorio();
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