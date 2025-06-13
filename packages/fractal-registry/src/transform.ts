import * as esbuild from 'esbuild';

const FRACTAL_DIRECTIVE = /^["']use fractal["'];?\s*\n?/;

export async function transformFractal(source: string, id: string) {
  if (!FRACTAL_DIRECTIVE.test(source)) {
    throw new Error(`Missing fractal directive`);
  }

  const { code, styles } = extractStyles(
    source.replace(FRACTAL_DIRECTIVE, ''), 
    id
  );
  
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    format: 'cjs',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2015'
  });
  
  return {
    code: result.code,
    styles
  };
}

function extractStyles(source: string, id: string) {
  let styles = '';
  
  const code = source
    .replace(/<style[^>]*>\{`([^`]+)`\}<\/style>/gi, (_, css) => {
      styles += css.trim() + '\n';
      return '';
    })
    .replace(/<style[^>]*>([^<]+)<\/style>/gi, (_, css) => {
      styles += css.trim() + '\n';
      return '';
    })
    .replace(/import\s+['"][^'"]+\.css['"]\s*;?\s*/g, '')
    .replace(/styled\.(\w+)`([^`]+)`/g, (_, tag, css) => {
      const cls = `f-${id}-${Math.random().toString(36).slice(2, 7)}`;
      styles += `.${cls} { ${css.trim()} }\n`;
      return `props => React.createElement('${tag}', { ...props, className: '${cls}' })`;
    });
  
  return { code: code.trim(), styles: styles.trim() || null };
}