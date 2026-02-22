#!/bin/bash

# GestorPro Startup Script

echo "🚀 Iniciando GestorPro..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias (esto puede tardar un poco)..."
    npm install
fi

# Check if .next build exists, if not build it
if [ ! -d ".next" ]; then
    echo "🏗️ Construyendo la aplicación por primera vez..."
    npm run build
fi

# Start the app in the background and open the browser
echo "🌐 Abriendo la aplicación en tu navegador..."
npm run start &

# Wait for a second and try to open the browser (platform dependent)
sleep 3
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v open > /dev/null; then
  open http://localhost:3000
fi

echo "✅ GestorPro está corriendo en http://localhost:3000"
echo "Presiona Ctrl+C para detener el servidor."

# Wait for background process
wait
