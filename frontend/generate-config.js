const fs = require('fs');
const apiBaseUrl = process.env.API_BASE_URL || '';
const content = `// Gerado automaticamente no build. Não edite manualmente.\nwindow.__API_BASE_URL__ = "${apiBaseUrl}";\n`;
fs.writeFileSync(__dirname + '/scripts/config.js', content);
console.log('config.js gerado com API_BASE_URL =', apiBaseUrl || '(vazio = relativo)');
