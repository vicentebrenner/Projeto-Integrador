FROM nginx:1.25-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos do site (O PONTO E O CAMINHO DEVEM ESTAR NA MESMA LINHA)
COPY . /usr/share/nginx/html