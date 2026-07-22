# 使用輕量級 Nginx 映像檔
FROM nginx:alpine

# 複製專案中的所有靜態檔案到 Nginx 預設網頁目錄
COPY . /usr/share/nginx/html

# 修改 Nginx 預設預設監聽的 Port（Cloud Run 預設要求 8080）
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# 對外開放 8080 埠號
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
