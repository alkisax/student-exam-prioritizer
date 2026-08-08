## namecheap
Type: A Record
Host: brackets
Value: 49.12.76.128
TTL: Automatic

## nginx
```nginx
server {
  server_name brackets.portfolio-projects.space;

  location /api/ {
    proxy_pass http://localhost:3018;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /socket.io/ {
    proxy_pass http://localhost:3018;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /var/www/brackets/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  listen 80;
}
```

## bash
ssh root@49.12.76.128
```bash
cd /var/www
mkdir brackets
cd brackets
git clone git@github.com:alkisax/brackets.git .

cd /var/www/brackets/backend
nano .env

cd /var/www/brackets/frontend
nano .env

cd /var/www/brackets/backend
npm install
npm run build

cd /var/www/brackets/frontend
npm install
npm run build

cd /var/www/brackets/backend
pm2 start npm --name brackets-backend -- start
pm2 save
pm2 list

nano /etc/nginx/sites-available/brackets.portfolio-projects.space

ln -s /etc/nginx/sites-available/brackets.portfolio-projects.space /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

certbot --nginx -d brackets.portfolio-projects.space

systemctl reload nginx
curl https://brackets.portfolio-projects.space/api/ping
```

## one line deploy and logs
ssh root@49.12.76.128
```bash
cd /var/www/brackets \
&& git pull origin main \
&& cd backend && npm install && npm run build \
&& cd ../frontend && npm install && npm run build \
&& cd ../backend && pm2 restart brackets-backend --update-env \
&& nginx -t && systemctl reload nginx \
&& echo "✓ brackets deploy OK" \
&& curl https://brackets.portfolio-projects.space/api/ping \
&& echo ""
```
pm2 flush brackets-backend
pm2 logs brackets-backend --lines 50