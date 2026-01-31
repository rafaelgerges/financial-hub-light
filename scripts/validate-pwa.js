import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const distDir = join(rootDir, 'dist');

const requiredFiles = [
  { path: join(publicDir, 'icon-192.png'), name: 'public/icon-192.png', required: true },
  { path: join(publicDir, 'icon-512.png'), name: 'public/icon-512.png', required: true },
  { path: join(publicDir, 'favicon.ico'), name: 'public/favicon.ico', required: true },
];

const distFiles = [
  { path: join(distDir, 'manifest.webmanifest'), name: 'dist/manifest.webmanifest', required: false },
  { path: join(distDir, 'sw.js'), name: 'dist/sw.js', required: false },
  { path: join(distDir, 'icon-192.png'), name: 'dist/icon-192.png', required: false },
  { path: join(distDir, 'icon-512.png'), name: 'dist/icon-512.png', required: false },
];

function validatePWA() {
  console.log('🔍 Validando configuração PWA...\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Validar arquivos em public/
  console.log('📁 Verificando arquivos em public/:');
  for (const file of requiredFiles) {
    if (existsSync(file.path)) {
      console.log(`  ✅ ${file.name}`);
    } else {
      if (file.required) {
        console.error(`  ❌ ${file.name} - OBRIGATÓRIO`);
        hasErrors = true;
      } else {
        console.warn(`  ⚠️  ${file.name} - Não encontrado`);
        hasWarnings = true;
      }
    }
  }

  // Validar arquivos em dist/ (após build)
  if (existsSync(distDir)) {
    console.log('\n📦 Verificando arquivos em dist/ (após build):');
    for (const file of distFiles) {
      if (existsSync(file.path)) {
        console.log(`  ✅ ${file.name}`);
      } else {
        if (file.required) {
          console.error(`  ❌ ${file.name} - OBRIGATÓRIO`);
          hasErrors = true;
        } else {
          console.warn(`  ⚠️  ${file.name} - Não encontrado (execute 'npm run build' primeiro)`);
          hasWarnings = true;
        }
      }
    }
  } else {
    console.log('\n⚠️  Diretório dist/ não encontrado.');
    console.log('   Execute "npm run build" para gerar os arquivos de produção.');
    hasWarnings = true;
  }

  // Verificar se manifest.json duplicado existe
  const duplicateManifest = join(publicDir, 'manifest.json');
  if (existsSync(duplicateManifest)) {
    console.warn('\n⚠️  public/manifest.json encontrado.');
    console.warn('   Este arquivo será sobrescrito pelo vite-plugin-pwa.');
    console.warn('   Considere removê-lo para evitar confusão.');
    hasWarnings = true;
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('❌ Validação FALHOU - Corrija os erros acima');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  Validação concluída com avisos');
    console.log('   Verifique os avisos acima');
    process.exit(0);
  } else {
    console.log('✅ Validação concluída com sucesso!');
    console.log('   Todos os arquivos PWA estão corretos.');
    process.exit(0);
  }
}

validatePWA();

