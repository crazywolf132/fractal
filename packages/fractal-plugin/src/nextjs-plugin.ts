import { FractalWebpackPlugin, FractalWebpackPluginOptions } from './webpack-plugin';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

export interface FractalNextConfig {
  registryUrl: string;
  autoUpload?: boolean | { development?: boolean; production?: boolean };
  enabled?: boolean;
}

export const withFractal = (config: FractalNextConfig) => (nextConfig: NextConfig = {}): NextConfig => {
  if (config.enabled === false) return nextConfig;

  const { registryUrl, autoUpload = true } = config;
  
  return {
    ...nextConfig,
    webpack: (webpackConfig: Configuration, context: any) => {
      const shouldUpload = typeof autoUpload === 'boolean' 
        ? autoUpload 
        : context.dev 
          ? autoUpload.development ?? true 
          : autoUpload.production ?? false;

      webpackConfig.plugins?.push(new FractalWebpackPlugin({
        registryUrl,
        watch: context.dev,
        autoUpload: shouldUpload,
        projectRoot: context.dir
      }));

      return nextConfig.webpack?.(webpackConfig, context) ?? webpackConfig;
    }
  };
};