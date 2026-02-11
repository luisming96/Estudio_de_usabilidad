# Script de despliegue automatizado desde PowerShell
# Conecta por SSH y ejecuta comandos directamente (sin SCP ni archivos intermedios)

$SERVER_IP = "192.168.5.44"
$USERNAME = "diego"

Write-Host "=== Despliegue Automatizado ===" -ForegroundColor Green
Write-Host "(Se te pedirá la contraseña del servidor)" -ForegroundColor Cyan
Write-Host ""

# Comandos a ejecutar en el servidor
$commands = @"
echo '=== Iniciando despliegue de Estudio de Usabilidad ==='
echo 'Actualizando repositorios del sistema...'
sudo apt update
echo 'Instalando Git y Nginx...'
sudo apt install -y git nginx
echo 'Actualizando repositorio...'
if [ -d /var/www/Estudio_de_usabilidad/.git ]; then
    cd /var/www/Estudio_de_usabilidad
    sudo git fetch origin
    sudo git reset --hard origin/main
else
    cd /var/www
    sudo git clone https://github.com/luisming96/Estudio_de_usabilidad.git
fi
echo 'Configurando permisos...'
sudo chown -R www-data:www-data /var/www/Estudio_de_usabilidad
sudo chmod -R 755 /var/www/Estudio_de_usabilidad
echo 'Configurando Nginx...'
sudo bash -c 'cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/Estudio_de_usabilidad/pages;
    index index.html;
    server_name _;
    location / {
        try_files \\\$uri \\\$uri/ =404;
    }
    location /assets/ {
        alias /var/www/Estudio_de_usabilidad/assets/;
    }
}
EOF'
echo 'Verificando configuración de Nginx...'
sudo nginx -t
echo 'Reiniciando Nginx...'
sudo systemctl restart nginx
sudo systemctl enable nginx
echo 'Configurando firewall...'
sudo ufw allow 'Nginx HTTP' 2>/dev/null
echo ''
echo '=== Despliegue completado ==='
echo 'La aplicación está disponible en: http://192.168.5.44'
"@

# Conectar por SSH y ejecutar comandos
Write-Host "Conectando a ${USERNAME}@${SERVER_IP}..." -ForegroundColor Yellow
ssh ${USERNAME}@${SERVER_IP} $commands

Write-Host ""
Write-Host "=== Proceso completado ===" -ForegroundColor Green
Write-Host "Abre tu navegador en: http://$SERVER_IP" -ForegroundColor Cyan
