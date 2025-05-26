module.exports = function override(config, env) {
  // Find the source-map-loader rule
  const sourceMapLoaderRule = config.module.rules
    .find(rule => rule.use && rule.use.some(use => use.loader === 'source-map-loader'));

  if (sourceMapLoaderRule) {
    // Add react-datepicker to the exclude list
    sourceMapLoaderRule.exclude = /react-datepicker/;
  }

  return config;
}; 