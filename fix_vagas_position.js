const fs = require('fs');
const p = 'C:/Users/Jean/OneDrive/Desktop/Projeto integrador atualizado 2026/Projeto-Integrador/frontend/banda.html';
let html = fs.readFileSync(p, 'utf8');

// 1. Extrair o bloco da aba vagas (de onde está errado - depois do </main>)
const vagasStart = html.indexOf('<!-- ABA VAGAS -->');
const vagasEnd = html.indexOf('<!-- MODAL DE CRIAR/EDITAR VAGA') - 1;

if (vagasStart === -1) {
    console.log('ERRO: Bloco de vagas não encontrado!');
    process.exit(1);
}

const vagasBlock = html.substring(vagasStart, vagasEnd).trim();
console.log('Bloco de vagas encontrado, linhas:', vagasBlock.split('\n').length);

// 2. Remover o bloco do lugar errado
html = html.substring(0, vagasStart) + html.substring(vagasEnd);

// 3. Inserir o bloco correto antes do fechamento do container (antes de </div>\n    </main>)
// O padrão de fechamento é:     </div>\n    </main>
const insertPoint = html.indexOf('        </div>\n    </main>');
if (insertPoint === -1) {
    console.log('ERRO: Ponto de inserção não encontrado!');
    // Tenta outra variação
    const alt = html.indexOf('</div>\n    </main>');
    console.log('Alt result:', alt);
    process.exit(1);
}

const vagasTab = `
            <!-- ABA VAGAS -->
            <div id="vagas" class="tab-content">
                <div class="vagas-page-header">
                    <div>
                        <h2>Gestão de Vagas</h2>
                        <p class="vagas-subtitle">Anuncie e gerencie vagas para novos integrantes</p>
                    </div>
                    <button id="abrirModalVagaBtn" class="btn-adicionar-principal">
                        <i class="fas fa-plus"></i> Nova Vaga
                    </button>
                </div>
                <div id="listaVagasContainer" class="vagas-grid">
                    <!-- Vagas renderizadas via JS -->
                </div>
            </div>
`;

html = html.substring(0, insertPoint) + vagasTab + '\n' + html.substring(insertPoint);
fs.writeFileSync(p, html, 'utf8');
console.log('SUCESSO! Aba de Vagas movida para dentro do container correto.');
