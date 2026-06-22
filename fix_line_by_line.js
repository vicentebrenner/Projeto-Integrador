const fs = require('fs');
const jsFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/perfil-musico.js';
let lines = fs.readFileSync(jsFile, 'utf8').split('\n');

// 1. Remove dangling username initialization lines manually:
// Look for lines containing `username: usuarioLogado.username` and `dadosPerfil.username = data.username`
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('username: usuarioLogado.username || "",')) {
        lines[i] = '        whatsapp: "",\n        dataNascimento: "",';
    }
    if (lines[i].includes('dadosPerfil.username = data.username || dadosPerfil.username;')) {
        lines[i] = '                dadosPerfil.whatsapp = data.whatsapp || "";\n                dadosPerfil.dataNascimento = data.dataNascimento || "";';
    }
    if (lines[i].includes('username: dadosPerfil.username,')) {
        lines[i] = '            whatsapp: dadosPerfil.whatsapp,\n            dataNascimento: dadosPerfil.dataNascimento,';
    }
    if (lines[i].includes("dadosPerfil.username = document.getElementById('perfilUsername').value || '';")) {
        lines[i] = '';
    }
    if (lines[i].includes("document.getElementById('perfilUsername').value = dadosPerfil.username || '';")) {
        lines[i] = '        if(document.getElementById("perfilWhatsapp")) document.getElementById("perfilWhatsapp").value = dadosPerfil.whatsapp || "";\n        if(document.getElementById("perfilDataNascimento")) document.getElementById("perfilDataNascimento").value = dadosPerfil.dataNascimento || "";';
    }
    if (lines[i].includes("usuarioLogado.username = dadosPerfil.username;")) {
        lines[i] = '';
    }
    if (lines[i].includes("if (inputUsername) inputUsername.style.borderColor = '';")) {
        lines[i] = '';
    }
    if (lines[i].includes("const inputUsername = document.getElementById('perfilUsername');")) {
        lines[i] = '';
    }
}

// Remove the `if (err.message && err.message.includes("Username já está em uso"))` block from catch.
let insideCatchErr = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (err.message && err.message.includes("Username já está em uso"))')) {
        insideCatchErr = true;
        lines[i] = '';
        continue;
    }
    if (insideCatchErr) {
        if (lines[i].includes('}')) { // We expect one } for the if and maybe another for else.
            // Let's just do a simple skip until the next block
            lines[i] = '';
            // It was a 4 line block: if() { ... } else { ... }
        }
    }
}

// Write it back to file
fs.writeFileSync(jsFile, lines.join('\n'));
