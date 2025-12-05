// babel.config.js
// Configuração OBRIGATÓRIA para o React Native Reanimated funcionar

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O plugin de animações DEVE ser a ÚLTIMA coisa na lista de plugins
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};