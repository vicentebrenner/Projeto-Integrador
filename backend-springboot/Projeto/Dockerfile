# Estágio 1: Build da aplicação com Maven
# Usamos a imagem do Maven com a versão do Java especificada no seu pom.xml (Java 17)
FROM maven:3.9-eclipse-temurin-17 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do Maven para aproveitar o cache de dependências do Docker
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Baixa as dependências do projeto
RUN mvn dependency:go-offline

# Copia o restante do código-fonte
COPY src src

# Compila o projeto e gera o arquivo .jar
RUN mvn package -DskipTests

# Estágio 2: Criação da imagem final
# Usamos uma imagem otimizada, apenas com o Java Runtime, para a imagem final ser menor
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia o arquivo .jar gerado no estágio de build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta que a aplicação Spring Boot usa
EXPOSE 8080

# Comando para iniciar a aplicação quando o container for executado
ENTRYPOINT ["java", "-jar", "app.jar"]