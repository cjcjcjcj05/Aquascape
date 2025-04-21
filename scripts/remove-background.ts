
import sharp from 'sharp';
import path from 'path';

const inputPath = path.join(process.cwd(), 'public/assets/hardscape/blue_seiryu_1.png');
const outputPath = path.join(process.cwd(), 'public/assets/hardscape/blue_seiryu_1.png');

async function removeBackground() {
  try {
    await sharp(inputPath)
      .removeBackground()
      .toFile(outputPath + '.tmp');
    
    // Replace original file with new transparent version
    await sharp(outputPath + '.tmp')
      .toFile(outputPath);
    
    console.log('Background removed successfully!');
  } catch (error) {
    console.error('Error removing background:', error);
  }
}

removeBackground();
