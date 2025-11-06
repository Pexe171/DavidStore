export default {
  app: {
    name: 'David Store API',
    port: process.env.PORT || 4000
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'segredo-super-seguro',
    jwtExpiration: '2h',
    saltRounds: 10
  }
}
