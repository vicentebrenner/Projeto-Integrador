const fs = require('fs');
let f = fs.readFileSync('backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/entity/PerfilMusico.java', 'utf8');

f = f.replace('@Column(name = "instrumentos_principais")', '@Column(name = "instrumentos_principais", columnDefinition = "TEXT")');
f = f.replace('private String biografia;', '@Column(columnDefinition = "TEXT")\n    private String biografia;');
f = f.replace('@Column(name = "link_videos")', '@Column(name = "link_videos", columnDefinition = "TEXT")');
f = f.replace('private String influencias;', '@Column(columnDefinition = "TEXT")\n    private String influencias;');

fs.writeFileSync('backend-springboot/Projeto/src/main/java/com/musicMakers/Projeto/domain/entity/PerfilMusico.java', f);
console.log("Updated PerfilMusico.java fields to TEXT");
