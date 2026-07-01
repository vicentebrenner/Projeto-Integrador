const fs = require('fs');
const filePath = 'C:/Users/Jean/OneDrive/Desktop/Projeto integrador atualizado 2026/Projeto-Integrador/frontend/styles.css';
let content = fs.readFileSync(filePath, 'utf8');

const cutoffIndex = content.indexOf('/* RECRUTAMENTO E VAGAS');
if (cutoffIndex !== -1) {
    content = content.substring(0, cutoffIndex);
}

content = content.replace(/\.footer\s*\{\s*display:\s*none\s*!important;\s*\}/g, '');
fs.writeFileSync(filePath, content);
