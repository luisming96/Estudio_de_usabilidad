#!/bin/bash

# Script de despliegue automatizado para Ubuntu Server 25.10
# Sin contenedores - Instalación directa

echo "=== Iniciando despliegue de Estudio de Usabilidad ==="

# Actualizar repositorios
echo "Actualizando repositorios del sistema..."
sudo apt update

# Instalar Git y Nginx
echo "Instalando Git y Nginx..."
sudo apt install -y git nginx

# Crear directorio y clonar repositorio
echo "Clonando repositorio desde GitHub..."
cd /var/www
sudo rm -rf Estudio_de_usabilidad 2>/dev/null
sudo git clone https://github.com/luisming96/Estudio_de_usabilidad.git

# Permisos correctos
echo "Configurando permisos..."
sudo chown -R www-data:www-data /var/www/Estudio_de_usabilidad
sudo chmod -R 755 /var/www/Estudio_de_usabilidad

# Configurar Nginx
echo "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/Estudio_de_usabilidad/pages;
    index index.html;
    
    server_name _;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

# Verificar configuración de Nginx
echo "Verificando configuración de Nginx..."
sudo nginx -t

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall si está activo
echo "Configurando firewall..."
if sudo ufw status | grep -q "Status: active"; then
    sudo ufw allow 'Nginx HTTP'
fi

echo ""
echo "=== Despliegue completado ==="
echo "La aplicación está disponible en: http://192.168.5.44"
echo ""
echo "Para actualizar en el futuro, ejecuta:"
echo "cd /var/www/Estudio_de_usabilidad && sudo git pull && sudo systemctl restart nginx"
