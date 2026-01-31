import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const iconSvgPath = join(rootDir, 'public', 'icon.svg');
const publicDir = join(rootDir, 'public');

const sizes = [192, 512];
const faviconSizes = [16, 32, 48, 64];

async function generateIcons() {
  try {
    // Verificar se o ícone SVG existe
    if (!existsSync(iconSvgPath)) {
      console.error('❌ icon.svg não encontrado em public/');
      console.log('💡 Certifique-se de que o arquivo public/icon.svg existe');
      process.exit(1);
    }

    console.log('🔄 Gerando ícones PWA e favicon a partir do icon.svg da Supero...\n');

    // Ler o SVG original
    const svgBuffer = await import('fs').then(fs => fs.readFileSync(iconSvgPath));

    // Gerar ícones PWA (192x192 e 512x512)
    for (const size of sizes) {
      const outputPath = join(publicDir, `icon-${size}.png`);
      
      // Calcular dimensões com padding
      const padding = Math.floor(size * 0.1);
      const iconSize = size - (padding * 2);
      
      // Converter SVG para PNG com fundo branco e padding
      await sharp(svgBuffer)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo branco
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Gerado: icon-${size}.png (${size}x${size}px)`);
    }

    // Gerar favicon.png (32x32) - navegadores modernos aceitam PNG como favicon
    console.log('\n📌 Gerando favicon...');
    const favicon32Path = join(publicDir, 'favicon-32x32.png');
    const favicon16Path = join(publicDir, 'favicon-16x16.png');
    
    // Gerar favicon 32x32
    const padding32 = Math.floor(32 * 0.1);
    const iconSize32 = 32 - (padding32 * 2);
    
    await sharp(svgBuffer)
      .resize(iconSize32, iconSize32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: padding32,
        bottom: padding32,
        left: padding32,
        right: padding32,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(favicon32Path);

    console.log(`✅ Gerado: favicon-32x32.png`);

    // Gerar favicon 16x16
    const padding16 = Math.floor(16 * 0.1);
    const iconSize16 = 16 - (padding16 * 2);
    
    await sharp(svgBuffer)
      .resize(iconSize16, iconSize16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: padding16,
        bottom: padding16,
        left: padding16,
        right: padding16,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(favicon16Path);

    console.log(`✅ Gerado: favicon-16x16.png`);
    
    // Copiar o favicon-32x32.png como favicon.ico (alguns navegadores ainda esperam .ico)
    const { copyFileSync } = await import('fs');
    copyFileSync(favicon32Path, join(publicDir, 'favicon.ico'));
    console.log(`✅ Copiado: favicon.ico (usando favicon-32x32.png)`);

    console.log('\n✨ Ícones PWA gerados com sucesso!');
    console.log('📁 Arquivos salvos em: public/');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Verifique se os ícones estão corretos');
    console.log('   2. Execute: npm run build');
    console.log('   3. Teste a instalação do PWA');

  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    process.exit(1);
  }
}

generateIcons();
