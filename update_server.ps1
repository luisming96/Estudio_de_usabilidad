# Configuración Diego - Puerto 2244
$SERVER_HOST = "www.servidorgp.somosdelprieto.com"
$PORT = "2244"
$USERNAME = "diego"

Write-Host "--- Actualizando VitaClick (Código y Vídeos) ---" -ForegroundColor Yellow

# Comandos encadenados: actualiza, descarga vídeos y reinicia Nginx
$lineaComandos = "cd /var/www/Estudio_de_usabilidad && sudo git fetch origin && sudo git reset --hard origin/main && sudo git lfs pull && sudo chown -R www-data:www-data . && sudo chmod -R 755 . && sudo systemctl restart nginx && echo '--- DESPLIEGUE FINALIZADO CON ÉXITO ---'"

# Ejecución con terminal interactiva para la contraseña
ssh -t -p $PORT "${USERNAME}@${SERVER_HOST}" $lineaComandos

Write-Host "--- Proceso terminado ---" -ForegroundColor Green