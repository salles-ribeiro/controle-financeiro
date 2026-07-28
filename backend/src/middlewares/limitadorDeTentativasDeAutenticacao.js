const { rateLimit } = require('express-rate-limit');

// Limita tentativas de login/cadastro por IP, para dificultar ataques de
// força bruta (tentar milhares de senhas por segundo) e criação em massa
// de contas falsas.
const limitadorDeTentativasDeAutenticacao = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 20, // no máximo 20 tentativas de login/cadastro por IP a cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagemDeErro: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.' },
});

module.exports = limitadorDeTentativasDeAutenticacao;
