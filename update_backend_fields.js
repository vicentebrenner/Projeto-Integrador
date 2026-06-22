const fs = require('fs');

// --- 1. Java Backend: PerfilMusico.java ---
const perfilFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/entity/PerfilMusico.java';
let perfilContent = fs.readFileSync(perfilFile, 'utf8');

if (!perfilContent.includes('private String whatsapp;')) {
    perfilContent = perfilContent.replace(/private String redesSociais;/g, 'private String redesSociais;\n\n    private String whatsapp;\n\n    @Column(name = "data_nascimento")\n    private String dataNascimento;');
    fs.writeFileSync(perfilFile, perfilContent);
}

// --- 2. Java Backend: PerfilUpdateDTO.java ---
const dtoFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/dto/PerfilUpdateDTO.java';
let dtoContent = fs.readFileSync(dtoFile, 'utf8');

if (!dtoContent.includes('private String whatsapp;')) {
    dtoContent = dtoContent.replace(/private String redesSociais;/g, 'private String redesSociais;\n    private String whatsapp;\n    private String dataNascimento;');
    fs.writeFileSync(dtoFile, dtoContent);
}

// --- 3. Java Backend: PerfilMusicoService.java ---
const serviceFile = 'c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/service/PerfilMusicoService.java';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

if (!serviceContent.includes('perfil.setWhatsapp(dto.getWhatsapp());')) {
    serviceContent = serviceContent.replace(/if \(dto\.getRedesSociais\(\) != null\) perfil\.setRedesSociais\(dto\.getRedesSociais\(\)\);/g, 'if (dto.getRedesSociais() != null) perfil.setRedesSociais(dto.getRedesSociais());\n        if (dto.getWhatsapp() != null) perfil.setWhatsapp(dto.getWhatsapp());\n        if (dto.getDataNascimento() != null) perfil.setDataNascimento(dto.getDataNascimento());');
    fs.writeFileSync(serviceFile, serviceContent);
}

console.log('Backend fields updated');
