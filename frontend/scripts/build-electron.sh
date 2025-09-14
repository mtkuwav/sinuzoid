#!/bin/bash
# filepath: /home/matioku/Documents/Cours/Sinuzoid/sinuzoid/frontend/scripts/build-electron.sh
#!/bin/bash

echo "🔧 Building Electron files..."

# Créer le dossier de sortie
mkdir -p dist-electron

# Compiler TypeScript en CommonJS
npx tsc --project tsconfig.electron.json

# Créer le package.json pour Electron
cat > dist-electron/package.json << EOF
{
  "name": "sinuzoid-electron",
  "main": "main.js",
  "type": "commonjs"
}
EOF

echo "✅ Electron build complete!"