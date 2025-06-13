import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

export async function uploadToRegistry(outputDir: string, registryUrl: string): Promise<void> {
  try {
    // Find all built fractals
    const files = await fs.readdir(outputDir);
    const fractals = files.filter(f => f.endsWith('.js') && !f.startsWith('.temp-'));

    for (const fractalFile of fractals) {
      const name = path.basename(fractalFile, '.js');
      const jsPath = path.join(outputDir, fractalFile);
      const metaPath = path.join(outputDir, `${name}.meta.json`);

      // Read files
      const [code, metadata] = await Promise.all([
        fs.readFile(jsPath, 'utf-8'),
        fs.readFile(metaPath, 'utf-8').then(JSON.parse).catch(() => ({})),
      ]);

      // Upload to registry
      const response = await fetch(`${registryUrl}/api/fractals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          code,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${name}: ${response.statusText}`);
      }

      console.log(chalk.gray(`  ✓ Uploaded ${name}`));
    }

    console.log(chalk.green('✨ All fractals uploaded successfully!'));
  } catch (error) {
    console.error(chalk.red('Failed to upload to registry:'), error);
    throw error;
  }
}