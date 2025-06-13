import { LoaderContext } from 'webpack';

export interface FractalLoaderOptions {
  registryUrl: string;
  isServer: boolean;
}

const FRACTAL_DIRECTIVE = /^(\s*["']use fractal["'];?\s*\n?)|^(\s*\/[/*]\s*use fractal.*\n?)/;

export default function fractalLoader(
  this: LoaderContext<FractalLoaderOptions>,
  source: string
): string {
  const callback = this.async();
  if (!callback) throw new Error('Fractal loader requires async mode');

  try {
    if (!FRACTAL_DIRECTIVE.test(source)) {
      callback(null, source);
      return source;
    }

    const { registryUrl, isServer } = this.getOptions();
    const id = this.resourcePath
      .replace(/\.(tsx?|jsx?)$/, '')
      .split(/[\\/]/)
      .slice(-3)
      .join('-')
      .toLowerCase();

    callback(null, `
import { createFractalComponent } from '@fractal/runtime';
${source.replace(FRACTAL_DIRECTIVE, '')}
if (exports.default) {
  exports.default = createFractalComponent(exports.default, {
    __fractal: true,
    __fractalId: '${id}',
    __fractalRegistry: '${registryUrl}',
    __fractalServer: ${isServer}
  });
}`);
  } catch (error) {
    callback(error as Error);
  }
  return source;
}