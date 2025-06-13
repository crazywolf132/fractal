const { withFractal } = require('@fractal/plugin');

module.exports = withFractal({
  registryUrl: process.env.FRACTAL_REGISTRY_URL || 'http://localhost:3001',
  autoUpload: true,
})({
  reactStrictMode: true,
});