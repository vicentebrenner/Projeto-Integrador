const fs = require('fs');
const https = require('https');

const icons = {
    'bi-arrow-left': 'https://raw.githubusercontent.com/twbs/icons/main/icons/arrow-left.svg',
    'bi-person-circle': 'https://raw.githubusercontent.com/twbs/icons/main/icons/person-circle.svg',
    'bi-envelope': 'https://raw.githubusercontent.com/twbs/icons/main/icons/envelope.svg',
    'bi-lock': 'https://raw.githubusercontent.com/twbs/icons/main/icons/lock.svg',
    'bi-eye-slash': 'https://raw.githubusercontent.com/twbs/icons/main/icons/eye-slash.svg',
    'bi-person-plus-fill': 'https://raw.githubusercontent.com/twbs/icons/main/icons/person-plus-fill.svg',
    'bi-person': 'https://raw.githubusercontent.com/twbs/icons/main/icons/person.svg',
    'bi-music-note-beamed': 'https://raw.githubusercontent.com/twbs/icons/main/icons/music-note-beamed.svg',
    'bi-people-fill': 'https://raw.githubusercontent.com/twbs/icons/main/icons/people-fill.svg'
};

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function processFile(file) {
    console.log('Processando', file);
    let html = fs.readFileSync(file, 'utf8');
    
    const regex = /<i\s+class="([^"]*bi\s+([a-z0-9\-]+)[^"]*)"([^>]*)><\/i>/g;
    
    let match;
    const replacements = [];
    
    while ((match = regex.exec(html)) !== null) {
        const fullTag = match[0];
        const classes = match[1];
        const iconName = match[2];
        const extraAttrs = match[3];
        
        console.log('Encontrado:', iconName);
        if (icons[iconName]) {
            let svg = await download(icons[iconName]);
            svg = svg.replace('<svg ', `<svg class="${classes}"${extraAttrs} style="width:1em; height:1em; fill:currentColor;" `);
            replacements.push({ old: fullTag, new: svg });
        }
    }
    
    for (let r of replacements) {
        html = html.replace(r.old, r.new);
    }
    
    fs.writeFileSync(file, html);
    console.log(file, 'atualizado!');
}

async function run() {
    await processFile('c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/login.html');
    await processFile('c:/Users/vicen/OneDrive/Documentos/Projeto-Integrador/frontend/cadastro.html');
}

run();
