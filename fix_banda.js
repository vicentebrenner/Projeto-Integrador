const fs = require('fs');
const path = 'C:/Users/Jean/OneDrive/Desktop/Projeto integrador atualizado 2026/Projeto-Integrador/frontend/scripts/banda.js';
let content = fs.readFileSync(path, 'utf8');

// Inject API fetch into carregarFinanceiro
content = content.replace('function carregarFinanceiro() {', `async function carregarFinanceiro() {
    try {
        const token = localStorage.getItem('authToken');
        if(window._bandaId) {
            const res = await fetch(getApiUrl(\`/api/financeiro/banda/\${window._bandaId}\`), { headers: { 'Authorization': \`Bearer \${token}\` } });
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
    } catch(e) { console.warn('Erro API Financeiro', e); }`);

// Inject API fetch into carregarRepertorio
content = content.replace('function carregarRepertorio() {', `async function carregarRepertorio() {
    try {
        const token = localStorage.getItem('authToken');
        if(window._bandaId) {
            const res = await fetch(getApiUrl(\`/api/musicas/banda/\${window._bandaId}\`), { headers: { 'Authorization': \`Bearer \${token}\` } });
            if(res.ok) {
                dadosRepertorio = await res.json();
                localStorage.setItem('dadosRepertorio', JSON.stringify(dadosRepertorio));
            }
        }
    } catch(e) { console.warn('Erro API Músicas', e); }`);

// Add Financeiro
const addFinRegex = /dadosFinanceiros\.push\(\{[\s\S]*?categoria: form\.categoria\.value\s*\}\);\s*localStorage\.setItem\('dadosFinanceiros', JSON\.stringify\(dadosFinanceiros\)\);\s*carregarFinanceiro\(\);/g;
content = content.replace(addFinRegex, `
        const payload = {
            tipo: form.tipo.value,
            descricao: form.descricao.value,
            valor: valor,
            dataTransacao: form.data.value,
            categoria: form.categoria.value
        };
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(\`/api/financeiro/banda/\${window._bandaId}\`), {
                method: 'POST',
                headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                await carregarFinanceiro();
            } else {
                dadosFinanceiros.push({...payload, data: payload.dataTransacao});
                localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
                carregarFinanceiro();
            }
        } catch(e) {
            dadosFinanceiros.push({...payload, data: payload.dataTransacao});
            localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
            carregarFinanceiro();
        }`);

// Add Repertorio
const addRepRegex = /dadosRepertorio\.push\(\{[\s\S]*?partituraUrl: partituraUrlTemp\s*\}\);\s*localStorage\.setItem\('dadosRepertorio', JSON\.stringify\(dadosRepertorio\)\);\s*carregarRepertorio\(\);/g;
content = content.replace(addRepRegex, `
        const payload = {
            nome: nomeMusica,
            origem: origemMusica,
            partituraUrl: partituraUrlTemp
        };
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(\`/api/musicas/banda/\${window._bandaId}\`), {
                method: 'POST',
                headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                await carregarRepertorio();
            } else {
                dadosRepertorio.push(payload);
                localStorage.setItem('dadosRepertorio', JSON.stringify(dadosRepertorio));
                carregarRepertorio();
            }
        } catch(e) {
            dadosRepertorio.push(payload);
            localStorage.setItem('dadosRepertorio', JSON.stringify(dadosRepertorio));
            carregarRepertorio();
        }`);

// Excluir
const excluirRegex = /if \(tipo === 'agenda' && index < dadosAgenda\.length\) \{[\s\S]*?\}\s*if \(itemRemovido\) \{/g;
const newExcluir = `
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
                        fetch(getApiUrl(\`/api/musicas/\${musica.id}\`), { method: 'DELETE', headers: { 'Authorization': \`Bearer \${token}\` } });
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
                        fetch(getApiUrl(\`/api/financeiro/\${fin.id}\`), { method: 'DELETE', headers: { 'Authorization': \`Bearer \${token}\` } });
                    } catch(e) {}
                }
                itemRemovido = dadosFinanceiros.splice(index, 1)[0];
                localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
                carregarFinanceiro();
            }

            if (itemRemovido) {`;

content = content.replace(excluirRegex, newExcluir);

fs.writeFileSync(path, content, 'utf8');
console.log('Modificou banda.js com sucesso');
