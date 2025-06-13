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
      const manifestPath = path.join(outputDir, `${name}.manifest.json`);

      // Read files
      const [code, metadata, manifest] = await Promise.all([
        fs.readFile(jsPath, 'utf-8'),
        fs.readFile(metaPath, 'utf-8').then(JSON.parse).catch(() => ({})),
        fs.readFile(manifestPath, 'utf-8').then(JSON.parse).catch(() => null),
      ]);

      // Extract the fractal name from metadata for the registry ID
      const fractalId = metadata.name || name;

      // Upload to registry
      const response = await fetch(`${registryUrl}/fractals/${encodeURIComponent(fractalId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: code,
          manifest,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${fractalId}: ${response.statusText}`);
      }

      console.log(chalk.gray(`  ✓ Uploaded ${fractalId}`));
    }

    console.log(chalk.green('✨ All fractals uploaded successfully!'));
  } catch (error) {
    console.error(chalk.red('Failed to upload to registry:'), error);
    throw error;
  }
}