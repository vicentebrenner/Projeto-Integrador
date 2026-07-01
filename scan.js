const fs = require('fs');
const h = fs.readFileSync('C:/Users/Jean/OneDrive/Desktop/Projeto integrador atualizado 2026/Projeto-Integrador/frontend/banda.html', 'utf8');
const lines = h.split('\n');
lines.forEach((l, i) => {
    const trimmed = l.trim();
    if (i > 50 && i < 475) {
        if (trimmed.includes('tab-content') || 
            trimmed.includes('id="container"') || 
            trimmed === '</div>' ||
            trimmed.includes('class="container"') ||
            trimmed.includes('id="vagas"') ||
            trimmed.includes('</main>') ||
            trimmed.includes('banda-tabs')) {
            console.log((i+1) + ': ' + trimmed.substring(0, 80));
        }
    }
});
