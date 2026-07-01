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
    // Agenda começa vazia — eventos reais são adicionados pelo usuário
    let dadosAgenda = JSON.parse(localStorage.getItem('dadosAgenda')) || [];
    let dadosMembros = JSON.parse(localStorage.getItem('dadosMembros')) || [];
    let dadosFinanceiros = JSON.parse(localStorage.getItem('dadosFinanceiros')) || [];
    let dadosRepertorio = JSON.parse(localStorage.getItem('dadosRepertorio')) || [];

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
            snackbar.innerHTML = `
                <div class="snackbar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#28a745" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                </div>
                <div class="snackbar-text">${message}</div>
                <button class="snackbar-close" onclick="document.getElementById('snackbar').className = document.getElementById('snackbar').className.replace('show', '')">&times;</button>
            `;
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
        localStorage.setItem('dadosAgenda', JSON.stringify(dadosAgenda));
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
                localStorage.setItem('dadosAgenda', JSON.stringify(dadosAgenda));
                renderCal(); renderMini(); renderProximosEventos();
                pop.remove();
            });
        });

        // Remover
        pop.querySelector('.cal-pop-delete').addEventListener('click', () => {
            dadosAgenda.splice(idx, 1);
            localStorage.setItem('dadosAgenda', JSON.stringify(dadosAgenda));
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

    async function carregarFinanceiro() {
    try {
        const token = localStorage.getItem('authToken');
        if(window._bandaId) {
            const res = await fetch(getApiUrl(`/api/financeiro/banda/${window._bandaId}`), { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) {
                let json = await res.json();
                dadosFinanceiros = json.map(t => ({
                    id: t.id,
                    tipo: t.tipo,
                    descricao: t.descricao,
                    valor: t.valor,
                    data: t.dataTransacao || t.data,
                    categoria: t.categoria
                }));
                localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
            }
        }
    } catch(e) { console.warn('Erro API Financeiro', e); }
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




    async function carregarMembros() {
        const tabela = document.getElementById('corpoTabelaMembros');
        if (!tabela) return;
        
        tabela.innerHTML = '<tr><td colspan="4" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Carregando integrantes...</td></tr>';
        
        const membrosBanda = await buscarMembrosDaBanda();
        tabela.innerHTML = '';
        
        if (!membrosBanda || membrosBanda.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhum integrante cadastrado nesta banda.</td></tr>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        membrosBanda.forEach((membro) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${membro.nome || '(Sem Nome)'}</td>
                <td>${membro.email}</td>
                <td><span class="perm-funcao-badge" style="background: rgba(250, 152, 72, 0.1); color: var(--cor-secundaria); padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 600;">${membro.funcao || 'Músico'}</span></td>
                <td>
                    ${isGestor ? `<button class="btn-icon btn-remover-membro-real" data-id="${membro.membroId}" data-nome="${membro.nome}" title="Remover membro" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-user-minus"></i></button>` : `<i class="fas fa-user-check" style="color:#10b981;"></i>`}
                </td>`;
            fragment.appendChild(tr);
        });
        tabela.appendChild(fragment);
        
        tabela.querySelectorAll('.btn-remover-membro-real').forEach(btn => {
            btn.addEventListener('click', async function() {
                const membroId = this.dataset.id;
                const nome = this.dataset.nome;
                if (confirm(`Tem certeza que deseja remover o músico "${nome}" da banda?`)) {
                    try {
                        const resp = await fetch(getApiUrl(`/api/bandas/membros/${membroId}`), {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (resp.ok) {
                            showSnackbar(`Membro "${nome}" removido com sucesso.`);
                            carregarMembros();
                            if (isGestor) {
                                carregarSubtabIntegrantes();
                            }
                        } else {
                            showSnackbar('Erro ao remover membro da banda.');
                        }
                    } catch (e) {
                        console.error('Erro ao remover membro:', e);
                    }
                }
            });
        });
    }

    function carregarConvitesPendentes() {
        carregarConvitesEnviadosDaBanda();
    }


    async function carregarRepertorio() {
    try {
        const token = localStorage.getItem('authToken');
        if(window._bandaId) {
            const res = await fetch(getApiUrl(`/api/musicas/banda/${window._bandaId}`), { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) {
                dadosRepertorio = await res.json();
                localStorage.setItem('dadosRepertorio', JSON.stringify(dadosRepertorio));
            }
        }
    } catch(e) { console.warn('Erro API Músicas', e); }
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

    setupModal('eventoModal', 'abrirModalEventoBtn', 'formAdicionarEvento', (form, closeModal) => {
        dadosAgenda.push({
            titulo: form.tituloEvento.value,
            data: form.dataEvento.value,
            hora: form.horaEvento ? form.horaEvento.value : '',
            local: form.localEvento.value,
            tipo: form.tipoEvento.value || 'outro'
        });
        localStorage.setItem('dadosAgenda', JSON.stringify(dadosAgenda));
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
                localStorage.setItem('dadosAgenda', JSON.stringify(dadosAgenda));
                carregarAgenda();
            } else if (tipo === 'membro' && index < dadosMembros.length) {
                itemRemovido = dadosMembros.splice(index, 1)[0];
                carregarMembros();
            } else if (tipo === 'repertorio' && index < dadosRepertorio.length) {
                const musica = dadosRepertorio[index];
                if (musica.id) {
                    try {
                        const token = localStorage.getItem('authToken');
                        fetch(getApiUrl(`/api/musicas/${musica.id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    } catch(e) {}
                }
                itemRemovido = dadosRepertorio.splice(index, 1)[0];
                localStorage.setItem('dadosRepertorio', JSON.stringify(dadosRepertorio));
                carregarRepertorio();
                const visualizadorPdf = document.getElementById('visualizadorPdf');
                if (visualizadorPdf && musica.partituraUrl) {
                    visualizadorPdf.innerHTML = '<p>Selecione uma música para ver a partitura.</p>';
                }
            } else if (tipo === 'financeiro' && index < dadosFinanceiros.length) {
                const fin = dadosFinanceiros[index];
                if (fin.id) {
                    try {
                        const token = localStorage.getItem('authToken');
                        fetch(getApiUrl(`/api/financeiro/${fin.id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    } catch(e) {}
                }
                itemRemovido = dadosFinanceiros.splice(index, 1)[0];
                localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
                carregarFinanceiro();
            }

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
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const authToken = localStorage.getItem('authToken');

    // Redireciona usuários anônimos para o login
    if (!usuarioLogado || !authToken) {
        window.location.href = 'login.html';
        return;
    }

    // Considera GESTOR se tipoUsuario=GESTOR OU se o campo gestor=true (vindo do login)
    const tipoUsuario = usuarioLogado ? (usuarioLogado.tipoUsuario || 'MUSICO') : 'MUSICO';
    const isGestor = tipoUsuario === 'GESTOR' || usuarioLogado?.gestor === true;

    // Força o gestor que não tem banda cadastrada a ir para a página de configuração inicial
    if (isGestor && !usuarioLogado.bandaId) {
        window.location.href = 'configurar-banda.html';
        return;
    }

    const usuarioPertenceBanda = usuarioLogado && usuarioLogado.bandaId !== null;

    // --- LOGOUT ---
    const btnLogoutHeader = document.getElementById('btnLogoutHeader');
    if (btnLogoutHeader) {
        btnLogoutHeader.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('authToken');
            localStorage.removeItem('primeiroAcesso');
            window.location.href = 'login.html';
        });
    }

    // ============================================================
    // SISTEMA DE PERMISSÕES
    // ============================================================
    const MODULOS_LABELS = {
        agenda: { label: 'Agenda', icon: 'fa-calendar-alt' },
        financeiro: { label: 'Financeiro', icon: 'fa-dollar-sign' },
        membros: { label: 'Membros', icon: 'fa-users' },
        repertorio: { label: 'Repertório', icon: 'fa-music' }
    };

    // Busca permissões do membro logado no backend
    async function buscarMinhasPermissoes(membroId) {
        try {
            const resp = await fetch(getApiUrl(`/api/permissoes/membro/${membroId}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!resp.ok) return null;
            return await resp.json();
        } catch (e) {
            console.warn('Não foi possível buscar permissões:', e);
            return null;
        }
    }

    // Aplica bloqueio visual nas tabs para MUSICO
    function aplicarBloqueioTabs(permissoes) {
        const tabs = document.querySelectorAll('.tab-link[data-tab]');
        tabs.forEach(tab => {
            const modulo = tab.dataset.tab;
            if (!MODULOS_LABELS[modulo]) return; // ignora tabs sem módulo (ex: configuracoes)
            const temAcesso = permissoes && permissoes[modulo] === true;

            if (!temAcesso) {
                tab.classList.add('tab-bloqueada');
                tab.title = `Ð¡ Acesso bloqueado — solicite ao gestor`;
                tab.innerHTML = `<i class="fas fa-lock" style="margin-right:6px;opacity:.7"></i>${MODULOS_LABELS[modulo].label}`;
            } else {
                tab.classList.remove('tab-bloqueada');
                tab.title = '';
                tab.innerHTML = MODULOS_LABELS[modulo].label;
            }
        });

        // Intercepta cliques em tabs bloqueadas
        document.getElementById('bandaTabs')?.addEventListener('click', function(e) {
            const btn = e.target.closest('.tab-link');
            if (btn && btn.classList.contains('tab-bloqueada')) {
                e.stopImmediatePropagation();
                mostrarOverlayAcessoNegado(MODULOS_LABELS[btn.dataset.tab]?.label || btn.dataset.tab);
            }
        }, true);
    }

    function mostrarOverlayAcessoNegado(nomeModulo) {
        let overlay = document.getElementById('overlayAcessoNegado');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overlayAcessoNegado';
            overlay.className = 'acesso-negado-overlay';
            overlay.innerHTML = `
                <div class="acesso-negado-card">
                    <div class="acesso-negado-icon"><i class="fas fa-lock"></i></div>
                    <h3>Acesso Restrito</h3>
                    <p id="acessoNegadoMsg">Você não tem permissão para acessar este módulo.<br>Solicite ao gestor da banda.</p>
                    <button class="btnCta" id="btnFecharAcessoNegado">Entendido</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('btnFecharAcessoNegado').addEventListener('click', () => {
                overlay.classList.remove('ativo');
            });
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('ativo');
            });
        }
        document.getElementById('acessoNegadoMsg').innerHTML =
            `Você não tem permissão para acessar <strong>${nomeModulo}</strong>.<br>Solicite ao gestor da banda.`;
        overlay.classList.add('ativo');
    }

    // ---- ABA CONFIGURAÇÕES (GESTOR) ----
    // State to hold members and invites for search filtering
    let localMembersList = [];
    let localInvitesList = [];

    async function carregarConfiguracoes() {
        const grid = document.getElementById('integrantesCardsGrid');
        if (!grid) return;

        grid.innerHTML = '<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Carregando integrantes...</p>';

        try {
            if (!window._bandaId) {
                window._bandaId = usuarioLogado?.bandaId;
            }
            
            if (window._bandaId) {
                try {
                    const respBanda = await fetch(getApiUrl(`/api/bandas/${window._bandaId}`), {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (respBanda.ok) {
                        const bandaData = await respBanda.json();
                        const headerName = document.getElementById('configBandaNome');
                        if (headerName) headerName.textContent = bandaData.nome;
                    }
                } catch (e) {
                    console.warn("Erro ao carregar detalhes da banda:", e);
                }
            }

            // Fetch members
            const membrosBanda = await buscarMembrosDaBanda();
            localMembersList = membrosBanda || [];

            // Add gestor if not present
            const gestorId = usuarioLogado.id;
            const hasGestor = localMembersList.some(m => m.usuarioId === gestorId || m.gestor === true);
            if (!hasGestor) {
                localMembersList.unshift({
                    membroId: usuarioLogado.membroId || 9999,
                    usuarioId: gestorId,
                    nome: usuarioLogado.nome,
                    email: usuarioLogado.email,
                    funcao: 'Fundador / Gestor',
                    gestor: true,
                    permissoes: { agenda: true, financeiro: true, membros: true, repertorio: true }
                });
            }

            // Fetch invites
            localInvitesList = [];
            if (window._bandaId) {
                try {
                    const respConv = await fetch(getApiUrl(`/api/convites/enviados/${window._bandaId}`), {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (respConv.ok) {
                        const convites = await respConv.json();
                        localInvitesList = convites.filter(c => c.status === 'PENDENTE');
                    }
                } catch(e) {
                    console.warn("Erro ao buscar convites para configurações:", e);
                }
            }

            const countEl = document.getElementById('configMembrosCount');
            if (countEl) {
                const totalActive = localMembersList.length;
                countEl.innerHTML = `<i class="fas fa-users"></i> ${totalActive} integrante${totalActive !== 1 ? 's' : ''}`;
            }

            renderPremiumCards();
        } catch(e) {
            console.error("Erro em carregarConfiguracoes:", e);
            grid.innerHTML = '<p class="empty-state"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar integrantes.</p>';
        }
    }

    async function buscarMembrosDaBanda() {
        try {
            const bandaId = usuarioLogado?.bandaId;
            if (!bandaId) return [];

            window._bandaId = bandaId;

            const respPerm = await fetch(getApiUrl(`/api/permissoes/banda/${window._bandaId}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!respPerm.ok) return [];
            return await respPerm.json();
        } catch(e) {
            console.warn('Erro ao buscar membros da banda:', e);
            return [];
        }
    }

    function renderPremiumCards() {
        const grid = document.getElementById('integrantesCardsGrid');
        if (!grid) return;

        const searchInput = document.getElementById('buscaIntegranteNome');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        const filteredMembers = localMembersList.filter(m => 
            m.nome.toLowerCase().includes(query) || 
            (m.email && m.email.toLowerCase().includes(query))
        );
        const filteredInvites = localInvitesList.filter(c => 
            c.usuarioConvidado.nome.toLowerCase().includes(query) || 
            c.usuarioConvidado.email.toLowerCase().includes(query)
        );

        if (filteredMembers.length === 0 && filteredInvites.length === 0) {
            grid.innerHTML = '<p class="empty-state"><i class="fas fa-search-minus"></i> Nenhum integrante encontrado.</p>';
            return;
        }

        grid.innerHTML = '';

        // Active members
        filteredMembers.forEach(m => {
            const card = document.createElement('div');
            card.className = 'member-premium-card';
            card.dataset.membroId = m.membroId;

            const initials = m.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const isMembroGestor = m.gestor === true || m.membroId === usuarioLogado.membroId && usuarioLogado.tipoUsuario === 'GESTOR';
            const roleLabel = isMembroGestor ? 'Gestor da Banda' : (m.funcao || 'Músico');

            let actionsHTML = '';
            if (isMembroGestor) {
                actionsHTML = `
                    <div class="member-premium-detail-item admin-badge">
                        <span><i class="fas fa-crown"></i> Administrador</span>
                    </div>
                `;
            } else {
                actionsHTML = `
                    <div class="member-premium-actions">
                        <button class="btn-premium-edit" data-id="${m.membroId}"><i class="fas fa-user-cog"></i> Permissões</button>
                        <button class="btn-premium-remove" data-id="${m.membroId}" data-nome="${m.nome}"><i class="fas fa-user-minus"></i> Remover</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div>
                    <div class="member-premium-card-header">
                        <div class="member-premium-avatar">${initials}</div>
                        <div class="member-premium-info">
                            <h4>${m.nome}</h4>
                            <p>${m.email}</p>
                        </div>
                    </div>
                    <div class="member-premium-details">
                        <div class="member-premium-detail-item">
                            <span>Cargo:</span>
                            <strong>${roleLabel}</strong>
                        </div>
                        <div class="member-premium-detail-item">
                            <span>Status:</span>
                            <span class="member-premium-status-badge status-ativo">Ativo</span>
                        </div>
                    </div>
                </div>
                ${actionsHTML}
            `;
            grid.appendChild(card);

            if (!isMembroGestor) {
                card.querySelector('.btn-premium-edit')?.addEventListener('click', () => {
                    abrirModalPermissoes(m);
                });
                card.querySelector('.btn-premium-remove')?.addEventListener('click', () => {
                    removerMembroBanda(m.membroId, m.nome);
                });
            }
        });

        // Invites
        filteredInvites.forEach(c => {
            const card = document.createElement('div');
            card.className = 'member-premium-card';
            card.dataset.inviteId = c.id;

            const initials = c.usuarioConvidado.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            card.innerHTML = `
                <div>
                    <div class="member-premium-card-header">
                        <div class="member-premium-avatar" style="background: linear-gradient(135deg, #a1a1a1, #707070); color: #fff;">${initials}</div>
                        <div class="member-premium-info">
                            <h4>${c.usuarioConvidado.nome}</h4>
                            <p>${c.usuarioConvidado.email}</p>
                        </div>
                    </div>
                    <div class="member-premium-details">
                        <div class="member-premium-detail-item">
                            <span>Cargo:</span>
                            <strong>Convidado</strong>
                        </div>
                        <div class="member-premium-detail-item">
                            <span>Status:</span>
                            <span class="member-premium-status-badge status-pendente">Pendente</span>
                        </div>
                    </div>
                </div>
                <div class="member-premium-actions" style="display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; margin-top: auto; width: 100%;">
                    <button class="btn-premium-remove btn-cancelar-convite" data-id="${c.id}" data-nome="${c.usuarioConvidado.nome}"><i class="fas fa-times"></i> Cancelar</button>
                </div>
            `;
            grid.appendChild(card);

            card.querySelector('.btn-cancelar-convite')?.addEventListener('click', () => {
                cancelarConviteBanda(c.id, c.usuarioConvidado.nome);
            });
        });
    }

    function abrirModalPermissoes(membro) {
        const modal = document.getElementById('modalEdicaoPermissoes');
        if (!modal) return;

        const initials = membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('modalPermMembroAvatar').textContent = initials;
        document.getElementById('modalPermMembroNome').textContent = membro.nome;
        document.getElementById('modalPermMembroEmail').textContent = membro.email;
        document.getElementById('modalPermMembroId').value = membro.membroId;

        const perms = membro.permissoes || {};
        document.getElementById('permSwitchMembros').checked = perms.membros === true;
        document.getElementById('permSwitchAgenda').checked = perms.agenda === true;
        document.getElementById('permSwitchFinanceiro').checked = perms.financeiro === true;
        document.getElementById('permSwitchRepertorio').checked = perms.repertorio === true;

        modal.style.display = 'block';
    }

    async function removerMembroBanda(membroId, nome) {
        if (!confirm(`Tem certeza que deseja remover o músico "${nome}" da banda?`)) {
            return;
        }

        try {
            const resp = await fetch(getApiUrl(`/api/bandas/membros/${membroId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (resp.ok) {
                showSnackbar(`Membro "${nome}" removido com sucesso.`);
                carregarConfiguracoes();
                carregarMembros();
            } else {
                showSnackbar('Erro ao remover membro da banda.');
            }
        } catch (e) {
            console.error('Erro ao remover membro:', e);
            showSnackbar('Erro de conexão com o servidor.');
        }
    }

    async function cancelarConviteBanda(conviteId, nome) {
        if (!confirm(`Tem certeza que deseja cancelar o convite enviado para "${nome}"?`)) {
            return;
        }

        try {
            const resp = await fetch(getApiUrl(`/api/convites/${conviteId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (resp.ok) {
                showSnackbar(`Convite para "${nome}" cancelado com sucesso.`);
                carregarConfiguracoes();
                carregarConvitesPendentes();
            } else {
                showSnackbar('Erro ao cancelar o convite.');
            }
        } catch (e) {
            console.error('Erro ao cancelar convite:', e);
            showSnackbar('Erro de conexão com o servidor.');
        }
    }

    // --- SEARCH AND MODAL LISTENERS SETUP ---
    const searchInput = document.getElementById('buscaIntegranteNome');
    if (searchInput) {
        searchInput.addEventListener('input', renderPremiumCards);
    }

    const btnAbrirModalConvidar = document.getElementById('btnAbrirModalConvidar');
    const btnAbrirModalMembro = document.getElementById('abrirModalMembroBtn'); // Aba Membros
    const modalMembro = document.getElementById('membroModal');
    
    function abrirModalMembroFunc() {
        if (!modalMembro) return;
        modalMembro.style.display = 'block';
        if(document.getElementById('emailMembro')) document.getElementById('emailMembro').value = '';
        if(document.getElementById('resultadosBuscaMembrosModal')) document.getElementById('resultadosBuscaMembrosModal').innerHTML = '<p style="color: var(--cor-texto-claro); text-align: center; padding: 10px 0; font-size: 0.9em;">Resultados aparecerão aqui.</p>';
    }

    if (btnAbrirModalConvidar) btnAbrirModalConvidar.addEventListener('click', abrirModalMembroFunc);
    if (btnAbrirModalMembro) btnAbrirModalMembro.addEventListener('click', abrirModalMembroFunc);
    
    if (modalMembro) {

        modalMembro.querySelector('.close-button')?.addEventListener('click', () => {
            modalMembro.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modalMembro) {
                modalMembro.style.display = 'none';
            }
        });
    }

    const btnBuscarMembroModal = document.getElementById('btnBuscarMembroModal');
    const emailMembroInput = document.getElementById('emailMembro');
    const resultadosBuscaModal = document.getElementById('resultadosBuscaMembrosModal');

    if (btnBuscarMembroModal && emailMembroInput && resultadosBuscaModal) {
        btnBuscarMembroModal.addEventListener('click', buscarMembroParaConvite);
        emailMembroInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarMembroParaConvite();
        });
    }

    async function buscarMembroParaConvite() {
        const query = emailMembroInput.value.trim();
        if (!query) {
            showSnackbar("Por favor, digite o nome ou e-mail do músico.");
            return;
        }

        resultadosBuscaModal.innerHTML = '<p style="text-align:center; color:var(--cor-texto-claro); padding:10px 0;"><i class="fas fa-spinner fa-spin"></i> Pesquisando...</p>';

        try {
            const resp = await fetch(getApiUrl(`/api/usuarios/buscar?nome=${encodeURIComponent(query)}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (resp.ok) {
                const musicos = await resp.json();
                renderResultadosBuscaModal(musicos);
            } else {
                resultadosBuscaModal.innerHTML = '<p style="text-align:center; color:#ef4444; padding:10px 0;">Erro ao pesquisar músicos.</p>';
            }
        } catch (e) {
            console.error('Erro ao pesquisar:', e);
            resultadosBuscaModal.innerHTML = '<p style="text-align:center; color:#ef4444; padding:10px 0;">Erro de conexão.</p>';
        }
    }

    function renderResultadosBuscaModal(musicos) {
        if (!musicos || musicos.length === 0) {
            resultadosBuscaModal.innerHTML = '<p style="text-align:center; color:var(--cor-texto-claro); padding:10px 0;">Nenhum músico encontrado.</p>';
            return;
        }

        resultadosBuscaModal.innerHTML = '';
        musicos.forEach(m => {
            if (m.id === usuarioLogado.id) return;

            const isAlreadyMember = localMembersList.some(member => member.usuarioId === m.id || member.email === m.email);
            if (isAlreadyMember) return;

            const isAlreadyInvited = localInvitesList.some(invite => invite.usuarioConvidado.id === m.id);

            const div = document.createElement('div');
            div.style = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px 15px; margin-bottom: 5px;";
            
            let btnHTML = '';
            if (isAlreadyInvited) {
                btnHTML = `<button class="btn-adicionar" disabled style="padding: 8px 14px; font-size:0.85em; font-weight:600; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); border:none;"><i class="fas fa-check"></i> Convidado</button>`;
            } else {
                btnHTML = `<button class="btn-adicionar btn-enviar-convite-modal" data-id="${m.id}" data-nome="${m.nome}" style="padding: 8px 14px; font-size:0.85em; font-weight:600;"><i class="fas fa-paper-plane"></i> Convidar</button>`;
            }

            div.innerHTML = `
                <div>
                    <h4 style="color:#fff; font-weight:700; margin: 0; font-size: 0.95em;">${m.nome}</h4>
                    <p style="font-size:0.8em; color:var(--cor-texto-claro); margin: 3px 0 0 0;">${m.email}</p>
                </div>
                ${btnHTML}
            `;
            resultadosBuscaModal.appendChild(div);
        });

        if (resultadosBuscaModal.innerHTML === '') {
            resultadosBuscaModal.innerHTML = '<p style="text-align:center; color:var(--cor-texto-claro); padding:10px 0;">Nenhum músico disponível para convite.</p>';
            return;
        }

        resultadosBuscaModal.querySelectorAll('.btn-enviar-convite-modal').forEach(btn => {
            btn.addEventListener('click', async function() {
                const musicoId = this.dataset.id;
                const nome = this.dataset.nome;
                
                try {
                    const resp = await fetch(getApiUrl('/api/convites'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            bandaId: window._bandaId,
                            gestorId: usuarioLogado.id,
                            usuarioConvidadoId: musicoId
                        })
                    });
                    
                    if (resp.ok) {
                        showSnackbar(`Convite enviado para ${nome}!`);
                        this.disabled = true;
                        this.innerHTML = '<i class="fas fa-check"></i> Enviado';
                        this.style.background = 'rgba(255,255,255,0.15)';
                        this.style.color = 'var(--cor-texto-claro)';
                        carregarConfiguracoes();
                        carregarConvitesPendentes();
                    } else {
                        const errData = await resp.json();
                        showSnackbar(`Erro: ${errData.error || 'Não foi possível enviar o convite.'}`);
                    }
                } catch(e) {
                    console.error('Erro ao enviar convite:', e);
                    showSnackbar('Erro ao conectar com o servidor.');
                }
            });
        });
    }

    const formEdicaoPerm = document.getElementById('formEdicaoPermissoes');
    if (formEdicaoPerm) {
        formEdicaoPerm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const membroId = document.getElementById('modalPermMembroId').value;
            const submitBtn = formEdicaoPerm.querySelector('button[type="submit"]');

            const newPerms = {
                membros: document.getElementById('permSwitchMembros').checked,
                agenda: document.getElementById('permSwitchAgenda').checked,
                financeiro: document.getElementById('permSwitchFinanceiro').checked,
                repertorio: document.getElementById('permSwitchRepertorio').checked
            };

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                const resp = await fetch(getApiUrl(`/api/permissoes/membro/${membroId}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(newPerms)
                });

                if (resp.ok) {
                    showSnackbar('Permissões atualizadas com sucesso!');
                    document.getElementById('modalEdicaoPermissoes').style.display = 'none';
                    carregarConfiguracoes();
                } else {
                    showSnackbar('Erro ao salvar as permissões.');
                }
            } catch(e) {
                console.error("Erro ao salvar permissões:", e);
                showSnackbar('Erro de conexão ao salvar as permissões.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    const modalPermissoes = document.getElementById('modalEdicaoPermissoes');
    if (modalPermissoes) {
        modalPermissoes.querySelector('.close-button')?.addEventListener('click', () => {
            modalPermissoes.style.display = 'none';
        });
        document.getElementById('btnCancelarEdicaoPerm')?.addEventListener('click', () => {
            modalPermissoes.style.display = 'none';
        });
    }

    async function carregarConvitesEnviadosDaBanda() {
        const listaUl = document.getElementById('listaConvitesPendentes');
        if (!listaUl) return;
        
        listaUl.innerHTML = '<li>Carregando convites...</li>';
        
        try {
            if (!window._bandaId) {
                window._bandaId = usuarioLogado?.bandaId;
            }
            if (!window._bandaId) {
                listaUl.innerHTML = '<li>Sem banda associada.</li>';
                return;
            }
            
            const resp = await fetch(getApiUrl(`/api/convites/enviados/${window._bandaId}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (resp.ok) {
                const convites = await resp.json();
                listaUl.innerHTML = '';
                
                const pendentes = convites.filter(c => c.status === 'PENDENTE');
                
                if (pendentes.length === 0) {
                    listaUl.innerHTML = '<li>Nenhum convite pendente.</li>';
                    return;
                }
                
                pendentes.forEach(c => {
                    const li = document.createElement('li');
                    const dataEnvio = new Date(c.dataEnvio).toLocaleDateString('pt-BR');
                    li.innerHTML = `
                        <span>
                            <i class="fas fa-user-clock"></i>
                            <strong>${c.usuarioConvidado.nome}</strong> (${c.usuarioConvidado.email}) - Convidado em ${dataEnvio}
                        </span>
                        <div style="display:inline-flex; align-items:center; gap:10px;">
                            <span class="status-pendente" style="color:var(--cor-secundaria); font-weight:600; font-size:0.9em; margin-left:10px;">Pendente</span>
                            <button class="btn-remover btn-cancelar-convite-membros-tab" data-id="${c.id}" data-nome="${c.usuarioConvidado.nome}" style="background:none; border:none; color:#ef4444; padding:0; cursor:pointer; font-weight:600; font-size:1em; margin-left:10px;" title="Cancelar Convite">
                                <i class="fas fa-times-circle"></i>
                            </button>
                        </div>
                    `;
                    listaUl.appendChild(li);
                });

                listaUl.querySelectorAll('.btn-cancelar-convite-membros-tab').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const id = this.dataset.id;
                        const nome = this.dataset.nome;
                        await cancelarConviteBanda(id, nome);
                    });
                });
            } else {
                listaUl.innerHTML = '<li>Erro ao carregar convites.</li>';
            }
        } catch(e) {
            console.error('Erro ao carregar convites enviados:', e);
            listaUl.innerHTML = '<li>Erro ao carregar convites.</li>';
        }
    }

    // --- SINO DE NOTIFICAÇÕES (FASE 5) ---
    const notifBell = document.getElementById('notifBell');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifDropdownList');

    if (notifBell && notifDropdown) {
        notifBell.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function() {
            notifDropdown.classList.remove('show');
        });
    }

    async function buscarNotificacoes() {
        if (!window._bandaId) {
            window._bandaId = usuarioLogado?.bandaId;
        }
        if (!window._bandaId) return;

        try {
            if (isGestor) {
                const resp = await fetch(getApiUrl(`/api/convites/enviados/${window._bandaId}`), {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (resp.ok) {
                    const convites = await resp.json();
                    const respondidos = convites.filter(c => c.status !== 'PENDENTE');
                    
                    if (notifBadge) {
                        if (respondidos.length > 0) {
                            notifBadge.textContent = respondidos.length;
                            notifBadge.style.display = 'block';
                        } else {
                            notifBadge.style.display = 'none';
                        }
                    }

                    if (notifList) {
                        if (respondidos.length === 0) {
                            notifList.innerHTML = '<p class="notif-empty">Nenhuma atividade recente.</p>';
                            return;
                        }
                        notifList.innerHTML = '';
                        respondidos.slice(-5).reverse().forEach(c => {
                            const item = document.createElement('div');
                            item.className = 'notif-item';
                            item.style = "padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size:0.85em;";
                            const statusColor = c.status === 'ACEITO' ? '#10b981' : '#ef4444';
                            const statusText = c.status === 'ACEITO' ? 'aceitou' : 'recusou';
                            item.innerHTML = `
                                <div><strong>${c.usuarioConvidado.nome}</strong> <span style="color:${statusColor}">${statusText}</span> o convite para a banda.</div>
                                <small style="color:rgba(255,255,255,0.3); font-size:0.8em;">${new Date(c.dataResposta || c.dataEnvio).toLocaleDateString('pt-BR')}</small>
                            `;
                            notifList.appendChild(item);
                        });
                    }
                }
            } else {
                if (notifBadge) notifBadge.style.display = 'none';
                if (notifList) notifList.innerHTML = '<p class="notif-empty">Nenhum convite pendente.</p>';
            }
        } catch(e) {
            console.warn('Erro ao buscar notificações para o sino:', e);
        }
    }

    // Subtab navigation setup
    document.querySelectorAll('.sub-tab-link').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sub-tab-link').forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--cor-texto-claro)';
                b.style.fontWeight = '600';
            });
            document.querySelectorAll('.sub-tab-content').forEach(c => c.style.display = 'none');
            
            this.classList.add('active');
            this.style.color = 'var(--cor-secundaria)';
            this.style.fontWeight = '700';
            
            const target = document.getElementById(this.dataset.subtab);
            if (target) target.style.display = 'block';
            
            if (this.dataset.subtab === 'subtab-integrantes') {
                carregarSubtabIntegrantes();
            } else if (this.dataset.subtab === 'subtab-permissoes') {
                carregarConfiguracoes();
            }
        });
    });

    // ============================================================
    // LÓGICA DE RECRUTAMENTO / VAGAS
    // ============================================================
    
    const btnModalVaga = document.getElementById('abrirModalVagaBtn');
    const modalVaga = document.getElementById('vagaModal');
    const formVaga = document.getElementById('formAdicionarVaga');
    
    if (btnModalVaga && modalVaga) {
        btnModalVaga.addEventListener('click', () => {
            formVaga.reset();
            document.getElementById('vagaId').value = '';
            modalVaga.style.display = 'block';
        });
        
        const fecharVaga = () => { modalVaga.style.display = 'none'; };
        modalVaga.querySelector('.close-button')?.addEventListener('click', fecharVaga);
        
        const btnCancelarVaga = document.getElementById('btnCancelarVaga');
        if (btnCancelarVaga) btnCancelarVaga.addEventListener('click', fecharVaga);
    }
    
    const selectVagaEstado = document.getElementById('vagaEstado');
    const selectVagaCidade = document.getElementById('vagaCidade');
    
    if (selectVagaEstado) {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(estados => {
                estados.forEach(uf => {
                    const option = document.createElement('option');
                    option.value = uf.sigla;
                    option.textContent = uf.nome;
                    selectVagaEstado.appendChild(option);
                });
            })
            .catch(err => console.error("Erro ao buscar estados IBGE", err));
            
        selectVagaEstado.addEventListener('change', (e) => {
            const uf = e.target.value;
            selectVagaCidade.innerHTML = '<option value="">Todos</option>';
            if (!uf) {
                selectVagaCidade.disabled = true;
                return;
            }
            selectVagaCidade.disabled = false;
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then(municipios => {
                    municipios.forEach(mun => {
                        const option = document.createElement('option');
                        option.value = mun.nome;
                        option.textContent = mun.nome;
                        selectVagaCidade.appendChild(option);
                    });
                })
                .catch(err => console.error("Erro ao buscar cidades IBGE", err));
        });
    }

    if (formVaga) {
        formVaga.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                bandaId: usuarioLogado?.bandaId,
                titulo: document.getElementById('vagaTitulo').value,
                funcao: document.getElementById('vagaFuncao').value,
                quantidadeVagas: document.getElementById('vagaQuantidade').value,
                nivelExperiencia: document.getElementById('vagaNivel').value,
                estado: document.getElementById('vagaEstado').value,
                cidade: document.getElementById('vagaCidade').value,
                descricao: document.getElementById('vagaDescricao').value,
                requisitosObrigatorios: document.getElementById('vagaRequisitos').value
            };
            
            const vId = document.getElementById('vagaId').value;
            const method = vId ? 'PUT' : 'POST';
            const url = vId ? getApiUrl(`/api/vagas/${vId}`) : getApiUrl(`/api/vagas/banda/${payload.bandaId}`);
            
            try {
                const resp = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify(payload)
                });
                
                if (resp.ok) {
                    showSnackbar("Vaga salva com sucesso!");
                    modalVaga.style.display = 'none';
                    carregarVagas();
                } else {
                    showSnackbar("Erro ao salvar vaga.");
                }
            } catch (err) {
                console.error(err);
                showSnackbar("Erro de conexão.");
            }
        });
    }
    
    async function carregarVagas() {
        const container = document.getElementById('listaVagasContainer');
        if (!container) return;
        const bandaId = usuarioLogado?.bandaId;
        if (!bandaId) return;
        
        try {
            const resp = await fetch(getApiUrl(`/api/vagas/banda/${bandaId}`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (resp.ok) {
                const vagas = await resp.json();
                renderVagas(vagas);
            } else {
                container.innerHTML = '<p>Erro ao carregar vagas.</p>';
            }
        } catch (e) {
            console.error(e);
            container.innerHTML = '<p>Erro de conexão.</p>';
        }
    }
    
    function renderVagas(vagas) {
        const container = document.getElementById('listaVagasContainer');
        container.innerHTML = '';
        if (vagas.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma vaga anunciada.</p>';
            return;
        }
        
        vagas.forEach(v => {
            const div = document.createElement('div');
            div.className = 'vaga-card-compact';
            const statusLabel = v.status === 'ABERTA' ? '<span class="status-badge status-aberta">ABERTA</span>' : `<span class="status-badge status-fechada">${v.status}</span>`;
            
            div.innerHTML = `
                <div class="vaga-card-header">
                    <div class="vaga-title-row">
                        <h4>${v.titulo}</h4>
                        ${statusLabel}
                    </div>
                    <div class="vaga-meta">
                        <span><i class="fas fa-guitar"></i> ${v.funcao}</span>
                        <span><i class="fas fa-users"></i> ${v.quantidadeVagas || 1} vaga(s)</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${v.cidade||'Qualquer'}/${v.estado||'Qualquer'}</span>
                    </div>
                </div>
                <div class="vaga-card-body">
                    <p>${v.descricao || 'Sem descrição.'}</p>
                </div>
                <div class="vaga-card-footer">
                    <button class="btn-candidatos" data-id="${v.id}"><i class="fas fa-user-check"></i> Ver Candidatos</button>
                    <div class="vaga-actions-row">
                        <button class="btn-encerrar-vaga" data-id="${v.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn-excluir-vaga" data-id="${v.id}"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </div>
            `;
            
            div.querySelector('.btn-candidatos').addEventListener('click', () => {
                abrirModalCandidatos(v.id);
            });
            
            div.querySelector('.btn-excluir-vaga').addEventListener('click', async () => {
                if(confirm("Tem certeza que deseja excluir esta vaga definitivamente?")) {
                    try {
                        const resp = await fetch(getApiUrl(`/api/vagas/${v.id}`), {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if(resp.ok) {
                            showSnackbar("Vaga excluída com sucesso.");
                            carregarVagas();
                        } else {
                            showSnackbar("Erro ao excluir vaga.");
                        }
                    } catch(e) {
                        showSnackbar("Erro de conexão.");
                    }
                }
            });
            
            div.querySelector('.btn-encerrar-vaga').addEventListener('click', () => {
                // Preencher o formulário para edição
                document.getElementById('vagaId').value = v.id;
                document.getElementById('vagaTitulo').value = v.titulo || '';
                document.getElementById('vagaFuncao').value = v.funcao || '';
                document.getElementById('vagaQuantidade').value = v.quantidadeVagas || 1;
                document.getElementById('vagaNivel').value = v.nivelExperiencia || '';
                document.getElementById('vagaDescricao').value = v.descricao || '';
                document.getElementById('vagaRequisitos').value = v.requisitosObrigatorios || '';
                
                // Preencher Estado
                const selectEstado = document.getElementById('vagaEstado');
                selectEstado.value = v.estado || '';
                
                // Disparar evento para buscar cidades do estado
                if (v.estado) {
                    const evt = new Event('change');
                    selectEstado.dispatchEvent(evt);
                    
                    // Aguardar o carregamento das cidades (IBGE) para setar a cidade salva
                    setTimeout(() => {
                        const selectCidade = document.getElementById('vagaCidade');
                        selectCidade.value = v.cidade || '';
                    }, 800);
                } else {
                    document.getElementById('vagaCidade').innerHTML = '<option value="">Selecione o estado primeiro...</option>';
                    document.getElementById('vagaCidade').disabled = true;
                }
                
                // Abrir modal de edição
                modalVaga.style.display = 'block';
            });
            
            container.appendChild(div);
        });
    }

    const modalCandidatos = document.getElementById('candidatosModal');
    if (modalCandidatos) {
        modalCandidatos.querySelector('.close-button').addEventListener('click', () => {
            modalCandidatos.style.display = 'none';
        });
    }

    async function abrirModalCandidatos(vagaId) {
        modalCandidatos.style.display = 'block';
        const list = document.getElementById('candidatosList');
        list.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Buscando os melhores músicos...</p>';
        
        try {
            const resp = await fetch(getApiUrl(`/api/vagas/${vagaId}/candidatos-compativeis`), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (resp.ok) {
                const candidatos = await resp.json();
                list.innerHTML = '';
                if (candidatos.length === 0) {
                    list.innerHTML = '<p class="empty-state">Nenhum músico compatível encontrado no momento.</p>';
                    return;
                }
                
                candidatos.forEach(c => {
                    const row = document.createElement('div');
                    row.style = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:10px; margin-bottom:10px;";
                    
                    const pMatch = c.pontuacaoMatch;
                    let colorMatch = '#ef4444';
                    if (pMatch >= 80) colorMatch = '#10b981';
                    else if (pMatch >= 50) colorMatch = '#f59e0b';
                    
                    row.innerHTML = `
                        <div style="flex:1;">
                            <h4 style="margin:0;">${c.nomeMusico}</h4>
                            <p style="font-size:0.85em; color:var(--cor-texto-claro); margin:5px 0;">
                                <i class="fas fa-map-marker-alt"></i> ${c.cidade||''}/${c.estado||''} | 
                                <i class="fas fa-guitar"></i> ${c.instrumentosPrincipais}
                            </p>
                        </div>
                        <div style="text-align:center; padding: 10px 20px; background:rgba(255,255,255,0.05); border-radius:8px;">
                            <span style="font-size:1.5em; font-weight:bold; color:${colorMatch};">${pMatch}%</span>
                            <br><small>Match</small>
                        </div>
                        <div style="margin-left:20px;">
                            <a href="perfil-musico.html?id=${c.musicoId}" class="btn-adicionar" style="text-decoration:none; display:inline-block;">Ver Perfil</a>
                        </div>
                    `;
                    list.appendChild(row);
                });
            } else {
                list.innerHTML = '<p>Erro ao buscar candidatos.</p>';
            }
        } catch (e) {
            console.error(e);
            list.innerHTML = '<p>Erro de conexão.</p>';
        }
    }


    // ============================================================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================================================
    if (usuarioPertenceBanda) {
        if (isGestor) {
            const tabConfig = document.getElementById('tabConfiguracoes');
            if (tabConfig) tabConfig.style.display = '';

            iniciarCalendario();
            carregarFinanceiro();
            carregarMembros();
            carregarConvitesPendentes();
            carregarRepertorio();
            carregarVagas();
            buscarNotificacoes();
            setInterval(buscarNotificacoes, 30000);
        } else {
            const membroId = usuarioLogado?.membroId;

            iniciarCalendario();
            carregarFinanceiro();
            carregarMembros();
            carregarConvitesPendentes();
            carregarRepertorio();
            carregarVagas();
            buscarNotificacoes();
            setInterval(buscarNotificacoes, 30000);

            if (membroId) {
                buscarMinhasPermissoes(membroId).then(permissoes => {
                    if (permissoes) aplicarBloqueioTabs(permissoes);
                });
            } else {
                aplicarBloqueioTabs({ agenda: false, financeiro: false, membros: false, repertorio: false });
            }
        }
    } else {
        const tabsContainer = document.querySelector('.banda-tabs');
        const contentContainers = document.querySelectorAll('.tab-content');
        const mainContainer = document.querySelector('.banda-container .container');

        if (tabsContainer) tabsContainer.style.display = 'none';
        contentContainers.forEach(content => content.style.display = 'none');

        if (mainContainer) {
            const userEmail = (usuarioLogado && usuarioLogado.email) ? usuarioLogado.email : 'o email cadastrado';
            mainContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 20px;">
                    
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, rgba(250, 152, 72, 0.15), rgba(255, 94, 98, 0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(250, 152, 72, 0.15);">
                        <i class="fas fa-guitar" style="font-size: 3.5rem; color: var(--cor-secundaria); filter: drop-shadow(0 4px 8px rgba(250, 152, 72, 0.3));"></i>
                    </div>
                    
                    <h1 style="font-family: 'Montserrat', sans-serif; font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; color: var(--cor-primaria);">Bem-vindo ao Music Makers</h1>
                    
                    <p style="font-size: 1.15rem; color: var(--cor-texto); max-width: 600px; line-height: 1.6; margin-bottom: 40px;">
                        Você ainda não faz parte de nenhuma banda no momento. Para começar a gerenciar ensaios, finanças e repertórios, você precisa de uma banda.
                    </p>

                    <div style="display: flex; gap: 25px; flex-wrap: wrap; justify-content: center;">
                        
                        <!-- Opção 1: Ser Convidado -->
                        <div class="card-style" style="flex: 1; min-width: 280px; max-width: 350px; padding: 35px 25px; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--cor-borda);">
                            <i class="fas fa-envelope-open-text" style="font-size: 2.5rem; color: var(--cor-info); margin-bottom: 20px;"></i>
                            <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--cor-primaria); border: none; padding: 0;">Fui Convidado</h3>
                            <p style="font-size: 0.95rem; color: var(--cor-texto); line-height: 1.5; margin-bottom: 20px;">
                                Peça ao líder da banda para enviar um convite para o seu e-mail:
                                <br><strong style="color: var(--cor-primaria); background: var(--cor-fundo); padding: 6px 12px; border-radius: 6px; display: inline-block; margin-top: 10px; font-size: 0.9rem; border: 1px solid var(--cor-borda);">${userEmail}</strong>
                            </p>
                            <span style="font-size: 0.85rem; color: var(--cor-info); font-weight: 600; margin-top: auto;">
                                <i class="fas fa-circle-notch fa-spin" style="margin-right: 5px;"></i> Aguardando convite...
                            </span>
                        </div>

                        <!-- Opção 2: Criar Banda -->
                        <div class="card-style" style="flex: 1; min-width: 280px; max-width: 350px; padding: 35px 25px; display: flex; flex-direction: column; align-items: center; border: 2px solid rgba(250, 152, 72, 0.3); position: relative;">
                            <div style="position: absolute; top: -12px; background: var(--cor-secundaria); color: #fff; font-size: 0.75rem; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">Recomendado</div>
                            <i class="fas fa-users-cog" style="font-size: 2.5rem; color: var(--cor-secundaria); margin-bottom: 20px;"></i>
                            <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--cor-primaria); border: none; padding: 0;">Sou o Líder</h3>
                            <p style="font-size: 0.95rem; color: var(--cor-texto); line-height: 1.5; margin-bottom: 25px;">
                                Quer iniciar o seu próprio projeto musical e gerenciar todos os integrantes e eventos?
                            </p>
                            <button class="btn-adicionar-principal" style="width: 100%; padding: 14px; font-size: 1rem; margin-top: auto; border-radius: 8px; font-weight: 700; box-shadow: 0 4px 15px rgba(250, 152, 72, 0.2);" onclick="window.location.href='configurar-banda.html'">
                                <i class="fas fa-plus-circle"></i> Criar Nova Banda
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Carrega configurações quando a aba for ativada
    document.getElementById('bandaTabs')?.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-tab="configuracoes"]');
        if (btn && tipoUsuario === 'GESTOR') {
            setTimeout(() => {
                const activeSubtab = document.querySelector('.sub-tab-link.active');
                if (activeSubtab) {
                    activeSubtab.click(); // Recarrega a subtab ativa
                } else {
                    carregarConfiguracoes();
                }
            }, 50);
        }
    });

});
