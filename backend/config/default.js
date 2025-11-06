export default {
  app: {
    name: 'David Store API',
    port: process.env.PORT || 4000
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://david:david@localhost:5432/davidstore?schema=public'
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'segredo-super-seguro',
    jwtExpiration: '2h',
    saltRounds: 10
  }
}
