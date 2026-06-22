const fs = require('fs');

function removeFromFile(file, regexStr, replacement = '') {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(regexStr, 'g');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log(`Cleaned ${file}`);
}

const htmlFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/perfil-musico.html';
const jsFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/perfil-musico.js';
const loginJs = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/login.js';

// HTML
let htmlContent = fs.readFileSync(htmlFile, 'utf8');
htmlContent = htmlContent.replace(/<div class="form-group">\s*<label for="perfilUsername">[\s\S]*?<\/div>/g, '');
fs.writeFileSync(htmlFile, htmlContent);

// JS
let jsContent = fs.readFileSync(jsFile, 'utf8');
jsContent = jsContent.replace(/username:\s*"",/g, '');
jsContent = jsContent.replace(/dadosPerfil\.username\s*=\s*usuario\.username\s*\|\|\s*"";/g, '');
jsContent = jsContent.replace(/username:\s*dadosPerfil\.username,/g, '');
jsContent = jsContent.replace(/usuarioLogado\.username\s*=\s*dadosPerfil\.username;/g, '');
jsContent = jsContent.replace(/const inputUsername[^;]*;/g, '');
jsContent = jsContent.replace(/if\s*\(inputUsername\)\s*inputUsername\.style\.borderColor[^;]*;/g, '');
jsContent = jsContent.replace(/if\s*\(err\.message\s*&&\s*err\.message\.includes\("Username já está em uso"\)\)\s*\{[\s\S]*?\}\s*else\s*\{/g, '{');
jsContent = jsContent.replace(/document\.getElementById\('perfilUsername'\)\.value\s*=\s*dadosPerfil\.username\s*\|\|\s*'';/g, '');
jsContent = jsContent.replace(/\/\/ Gerar Username Aleatório[\s\S]*?showSnackbar\("Username gerado!"\);\s*\}\s*\}/g, '');
jsContent = jsContent.replace(/dadosPerfil\.username\s*=\s*document\.getElementById\('perfilUsername'\)\.value;/g, '');
fs.writeFileSync(jsFile, jsContent);

// Login JS
removeFromFile(loginJs, /username:\s*data\.username\s*\|\|\s*null,/);

console.log("Frontend cleaned.");
