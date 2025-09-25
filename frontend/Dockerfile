# Usamos a imagem oficial do Nginx, que é um servidor web leve e performático
FROM nginx:1.25-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração personalizada para o Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copia todos os arquivos do frontend (HTML, CSS, JS) para a pasta que o Nginx serve
COPY . /usr/share/nginx/html