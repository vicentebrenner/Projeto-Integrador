# Usamos uma imagem otimizada com o Java Runtime 17
FROM eclipse-temurin:17-jre-jammy

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo .jar compilado localmente na máquina hospedeira
COPY target/*.jar app.jar

# Expõe a porta padrão do Spring Boot
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]