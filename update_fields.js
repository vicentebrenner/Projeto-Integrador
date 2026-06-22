const fs = require('fs');

// --- 1. JS Frontend ---
const jsFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/scripts/perfil-musico.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

// Adicionar os novos campos no objeto inicial
jsContent = jsContent.replace(/nome: usuarioLogado\.nome \|\| "Músico",/, 'nome: usuarioLogado.nome || "Músico",\n        whatsapp: "",\n        dataNascimento: "",');

// Ao receber dados do backend
jsContent = jsContent.replace(/dadosPerfil\.email = usuario\.email \|\| dadosPerfil\.email;/, 'dadosPerfil.email = usuario.email || dadosPerfil.email;\n                dadosPerfil.whatsapp = data.whatsapp || "";\n                dadosPerfil.dataNascimento = data.dataNascimento || "";');

// Ao enviar para o backend
jsContent = jsContent.replace(/nome: dadosPerfil\.nome,/, 'nome: dadosPerfil.nome,\n            whatsapp: dadosPerfil.whatsapp,\n            dataNascimento: dadosPerfil.dataNascimento,');

// Na função carregarPerfil() - mapear para os inputs
jsContent = jsContent.replace(/document\.getElementById\('perfilNome'\)\.value = dadosPerfil\.nome;/, 'document.getElementById("perfilNome").value = dadosPerfil.nome;\n        if(document.getElementById("perfilWhatsapp")) document.getElementById("perfilWhatsapp").value = dadosPerfil.whatsapp || "";\n        if(document.getElementById("perfilDataNascimento")) document.getElementById("perfilDataNascimento").value = dadosPerfil.dataNascimento || "";');

// Na função de submit do form
jsContent = jsContent.replace(/dadosPerfil\.nome = document\.getElementById\('perfilNome'\)\.value;/, 'dadosPerfil.nome = document.getElementById("perfilNome").value;\n            if(document.getElementById("perfilWhatsapp")) dadosPerfil.whatsapp = document.getElementById("perfilWhatsapp").value;\n            if(document.getElementById("perfilDataNascimento")) dadosPerfil.dataNascimento = document.getElementById("perfilDataNascimento").value;');

fs.writeFileSync(jsFile, jsContent);


// --- 2. Java Backend: Usuario.java ---
const usuarioFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/entity/Usuario.java';
let usuarioContent = fs.readFileSync(usuarioFile, 'utf8');

if (!usuarioContent.includes('private String whatsapp;')) {
    usuarioContent = usuarioContent.replace(/private String telefone;/, 'private String telefone;\n\n    private String whatsapp;\n\n    private String dataNascimento;');
    // getters e setters
    usuarioContent = usuarioContent.replace(/public String getTelefone\(\) \{\s*return telefone;\s*\}/, 'public String getTelefone() {\n        return telefone;\n    }\n\n    public String getWhatsapp() {\n        return whatsapp;\n    }\n\n    public void setWhatsapp(String whatsapp) {\n        this.whatsapp = whatsapp;\n    }\n\n    public String getDataNascimento() {\n        return dataNascimento;\n    }\n\n    public void setDataNascimento(String dataNascimento) {\n        this.dataNascimento = dataNascimento;\n    }');
} else {
	console.log("Usuario.java ja modificado?");
}

fs.writeFileSync(usuarioFile, usuarioContent);


// --- 3. Java Backend: PerfilUpdateDTO.java ---
const dtoFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/dto/PerfilUpdateDTO.java';
let dtoContent = fs.readFileSync(dtoFile, 'utf8');

if (!dtoContent.includes('private String whatsapp;')) {
    dtoContent = dtoContent.replace(/private String nome;/, 'private String nome;\n    private String whatsapp;\n    private String dataNascimento;');
    dtoContent = dtoContent.replace(/public String getNome\(\) \{\s*return nome;\s*\}/, 'public String getNome() {\n        return nome;\n    }\n\n    public String getWhatsapp() {\n        return whatsapp;\n    }\n\n    public void setWhatsapp(String whatsapp) {\n        this.whatsapp = whatsapp;\n    }\n\n    public String getDataNascimento() {\n        return dataNascimento;\n    }\n\n    public void setDataNascimento(String dataNascimento) {\n        this.dataNascimento = dataNascimento;\n    }');
}

fs.writeFileSync(dtoFile, dtoContent);


// --- 4. Java Backend: PerfilMusico.java (Entity que guarda os dados ou Usuario?) ---
// Wait, is whatsapp and dataNascimento in Usuario or PerfilMusico?
// The user endpoint `/api/musicos/usuario/{id}/completo` uses PerfilMusicoService.
// Looking at the past logic, `nome` and `corAvatar` were in `Usuario`, and `localizacao`, `bio` were in `PerfilMusico`.
// It makes sense to put whatsapp and dataNascimento in `PerfilMusico` because they are profile-specific!
// Let's modify PerfilMusico.java instead!
// Oh wait, I already modified Usuario.java above...
