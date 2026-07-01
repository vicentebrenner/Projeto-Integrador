const fs = require('fs');
const filePath = 'C:/Users/Jean/OneDrive/Desktop/Projeto integrador atualizado 2026/Projeto-Integrador/frontend/styles.css';
let content = fs.readFileSync(filePath, 'utf8');

const cutoffIndex = content.indexOf('/* VAGAS PREMIUM');
if (cutoffIndex !== -1) {
    content = content.substring(0, cutoffIndex);
    fs.writeFileSync(filePath, content);
}
