import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import config from '../config/default.js'

const prisma = new PrismaClient()

const categories = [
  {
    id: 'eletronicos',
    name: 'Eletrônicos',
    description: 'Televisores, áudio, vídeo e novidades tecnológicas para transformar sua sala.'
  },
  {
    id: 'moveis',
    name: 'Móveis',
    description: 'Coleções exclusivas de sofás, mesas, cadeiras e planejados assinados por designers.'
  },
  {
    id: 'eletrodomesticos',
    name: 'Eletrodomésticos',
    description: 'Linha premium com eficiência energética e garantia estendida David Care.'
  },
  {
    id: 'informatica',
    name: 'Informática',
    description: 'Notebooks gamer, periféricos profissionais e acessórios de alta performance.'
  },
  {
    id: 'eletroportateis',
    name: 'Eletroportáteis',
    description: 'Cafeteiras, liquidificadores e pequenos eletrodomésticos premium.'
  }
]

const products = [
  {
    id: 'tv-4k-001',
    name: 'Smart TV 4K 65" David Vision',
    description:
      'Imagem cristalina, sistema operacional DavidOS, 4 entradas HDMI e Alexa integrada.',
    price: 4899.9,
    discount: 0.15,
    stock: 24,
    brand: 'David Vision',
    category: 'eletronicos',
    rating: 4.8,
    highlights: ['Alexa integrada', '60Hz com MotionFlow', 'Dolby Vision e Atmos'],
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
      'https://images.unsplash.com/photo-1580894906472-6b9b5d992b48'
    ]
  },
  {
    id: 'sofa-001',
    name: 'Sofá Retrátil e Reclinável David Comfort',
    description: 'Conforto premium com espuma D33, revestimento em linho e garantia de 5 anos.',
    price: 2999.9,
    discount: 0.2,
    stock: 12,
    brand: 'David Home',
    category: 'moveis',
    rating: 4.7,
    highlights: [
      'Estrutura em eucalipto de reflorestamento',
      'Acabamento impermeável',
      'Porta-copos integrado'
    ],
    images: ['https://images.unsplash.com/photo-1549187774-b4e9b0445b41']
  },
  {
    id: 'soundbar-001',
    name: 'Soundbar Dolby Atmos David Pulse',
    description:
      'Som 3D com 11 canais, subwoofer sem fio e calibração automática para qualquer ambiente.',
    price: 1499.95,
    discount: 0.11,
    stock: 35,
    brand: 'David Audio',
    category: 'eletronicos',
    rating: 4.6,
    highlights: ['Bluetooth 5.3', 'Assistente de voz DavidIA', 'Modo noite inteligente'],
    images: ['https://images.unsplash.com/photo-1580915411954-282cb1c7d75b']
  },
  {
    id: 'geladeira-001',
    name: 'Geladeira Inverter David Frost Free 540L',
    description:
      'Tecnologia inverter com IA para economia de energia, dispenser de água e conectividade Wi-Fi.',
    price: 5999.0,
    discount: 0.1,
    stock: 18,
    brand: 'David Home',
    category: 'eletrodomesticos',
    rating: 4.9,
    highlights: ['IA EcoSense', 'Filtro antibacteriano', 'Acabamento em aço escovado'],
    images: ['https://images.unsplash.com/photo-1581579186983-74cd55c7c9f0']
  },
  {
    id: 'maquina-lavar-001',
    name: 'Máquina de Lavar David Wash AI 14kg',
    description:
      'Lavagem inteligente com sensores de peso, programação por aplicativo e ciclo antialérgico.',
    price: 1999.9,
    discount: 0.215,
    stock: 21,
    brand: 'David Home',
    category: 'eletrodomesticos',
    rating: 4.5,
    highlights: [
      'Dosagem automática',
      'Motor Direct Drive 10 anos de garantia',
      'Luz interna com LED'
    ],
    images: ['https://images.unsplash.com/photo-1582041353429-1d2c873d5d01']
  },
  {
    id: 'cafeteira-001',
    name: 'Cafeteira Espresso David Barista',
    description:
      'Sistema de cápsulas inteligentes com vaporizador e receitas exclusivas pelo app.',
    price: 529.99,
    discount: 0.132,
    stock: 40,
    brand: 'David Gourmet',
    category: 'eletroportateis',
    rating: 4.4,
    highlights: ['Reservatório de 2L', 'Sistema de limpeza automática', 'Espumador em aço inox'],
    images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348']
  },
  {
    id: 'micro-ondas-001',
    name: 'Micro-ondas Smart David Heat 34L',
    description: 'Receitas guiadas por voz, sensores de umidade e integração com Google Home.',
    price: 999.9,
    discount: 0.1,
    stock: 28,
    brand: 'David Home',
    category: 'eletrodomesticos',
    rating: 4.3,
    highlights: ['Painel touch intuitivo', 'Revestimento antiaderente', 'Modo descongelar turbo'],
    images: ['https://images.unsplash.com/photo-1606813902971-075ff252c569']
  },
  {
    id: 'notebook-001',
    name: 'Notebook Gamer David Nitro i9',
    description: 'Processador Intel i9, RTX 4070, 32GB RAM DDR5 e SSD NVMe 1TB.',
    price: 12999.0,
    discount: 0.12,
    stock: 9,
    brand: 'David Tech',
    category: 'informatica',
    rating: 4.6,
    highlights: ['Tela 240Hz', 'Teclado mecânico RGB', 'Sistema de refrigeração líquida híbrida'],
    images: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d']
  },
  {
    id: 'ar-condicionado-001',
    name: 'Ar-Condicionado Inverter David Fresh 18.000 BTUs',
    description:
      'Climatização silenciosa com filtro HEPA, conectividade Wi-Fi e economia classe A+++. ',
    price: 2599.9,
    discount: 0.154,
    stock: 17,
    brand: 'David Home',
    category: 'eletrodomesticos',
    rating: 4.5,
    highlights: ['Filtro HEPA lavável', 'Controle por voz', 'Função autolimpeza antibacteriana'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b']
  },
  {
    id: 'cadeira-gamer-001',
    name: 'Cadeira Gamer David Supreme',
    description: 'Estrutura em aço carbono, memória de massa ergonômica e apoio lombar inteligente.',
    price: 1499.9,
    discount: 0.134,
    stock: 26,
    brand: 'David Tech',
    category: 'informatica',
    rating: 4.8,
    highlights: ['Revestimento em couro ecológico', 'Braços 4D', 'Base reforçada de alumínio'],
    images: ['https://images.unsplash.com/photo-1587613863743-67e27d4006c4']
  },
  {
    id: 'smartphone-001',
    name: 'Smartphone David One Ultra 5G 512GB',
    description: 'Tela AMOLED 6.8" 120Hz, câmera tripla com IA e carregamento turbo de 80W.',
    price: 3999.9,
    discount: 0.125,
    stock: 45,
    brand: 'David Mobile',
    category: 'eletronicos',
    rating: 4.9,
    highlights: ['Modo retrato profissional', 'Bateria 5200mAh', 'Certificação IP68'],
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9']
  }
]

const users = [
  {
    id: 'admin-001',
    name: 'David Admin',
    email: 'admin@davidstore.com',
    password: 'admin123',
    role: 'admin',
    addresses: []
  },
  {
    id: 'user-001',
    name: 'Ana Beatriz',
    email: 'ana.b@davidstore.com',
    password: 'cliente123',
    role: 'customer',
    addresses: [
      {
        id: 'addr-001',
        street: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zip: '01310-100'
      }
    ]
  }
]

const orders = [
  {
    id: 'order-1001',
    customer: {
      id: 'user-001',
      name: 'Ana Beatriz',
      email: 'ana.b@davidstore.com'
    },
    status: 'processando',
    total: 7899.8,
    createdAt: '2024-05-05T10:15:00Z',
    items: [
      { productId: 'tv-4k-001', quantity: 1, price: 4164.92 },
      { productId: 'sofa-001', quantity: 1, price: 2399.92 },
      { productId: 'soundbar-001', quantity: 1, price: 1334.96 }
    ]
  },
  {
    id: 'order-1002',
    customer: {
      id: 'user-002',
      name: 'Bruno Castro',
      email: 'bruno.c@davidstore.com'
    },
    status: 'entregue',
    total: 5399.1,
    createdAt: '2024-05-04T14:05:00Z',
    items: [{ productId: 'geladeira-001', quantity: 1, price: 5399.1 }]
  },
  {
    id: 'order-1003',
    customer: {
      id: 'user-003',
      name: 'Camila Duarte',
      email: 'camila.d@davidstore.com'
    },
    status: 'enviado',
    total: 1569.35,
    createdAt: '2024-05-06T09:42:00Z',
    items: [{ productId: 'maquina-lavar-001', quantity: 1, price: 1569.35 }]
  },
  {
    id: 'order-1004',
    customer: {
      id: 'user-004',
      name: 'Daniela Moreira',
      email: 'daniela.m@davidstore.com'
    },
    status: 'processando',
    total: 459.99,
    createdAt: '2024-05-06T12:12:00Z',
    items: [{ productId: 'cafeteira-001', quantity: 1, price: 459.99 }]
  },
  {
    id: 'order-1005',
    customer: {
      id: 'user-005',
      name: 'Eduardo Pereira',
      email: 'eduardo.p@davidstore.com'
    },
    status: 'cancelado',
    total: 11439.12,
    createdAt: '2024-05-03T18:22:00Z',
    items: [{ productId: 'notebook-001', quantity: 1, price: 11439.12 }]
  },
  {
    id: 'order-1006',
    customer: {
      id: 'user-006',
      name: 'Felipe Sousa',
      email: 'felipe.s@davidstore.com'
    },
    status: 'entregue',
    total: 899.9,
    createdAt: '2024-05-02T16:55:00Z',
    items: [{ productId: 'micro-ondas-001', quantity: 1, price: 899.9 }]
  },
  {
    id: 'order-1007',
    customer: {
      id: 'user-007',
      name: 'Gabriela Torres',
      email: 'gabriela.t@davidstore.com'
    },
    status: 'aguardando_pagamento',
    total: 2199.9,
    createdAt: '2024-05-06T08:15:00Z',
    items: [{ productId: 'ar-condicionado-001', quantity: 1, price: 2199.9 }]
  },
  {
    id: 'order-1008',
    customer: {
      id: 'user-008',
      name: 'Helena Prado',
      email: 'helena.p@davidstore.com'
    },
    status: 'capturado',
    total: 1299.9,
    createdAt: '2024-05-04T11:02:00Z',
    items: [{ productId: 'cadeira-gamer-001', quantity: 1, price: 1299.9 }]
  },
  {
    id: 'order-1009',
    customer: {
      id: 'user-009',
      name: 'Igor Martins',
      email: 'igor.m@davidstore.com'
    },
    status: 'enviado',
    total: 3499.9,
    createdAt: '2024-05-05T19:24:00Z',
    items: [{ productId: 'smartphone-001', quantity: 1, price: 3499.9 }]
  }
]

const payments = [
  {
    id: 'pay-5001',
    orderId: 'order-1001',
    method: 'cartao_credito',
    cardBrand: 'Visa',
    status: 'capturado',
    amount: 7899.8,
    netAmount: 7662.9,
    installments: 10,
    gatewayFees: 0.0298,
    riskScore: 0.18,
    chargeback: false,
    settlementDate: '2024-05-20',
    settlementStatus: 'previsto',
    customerName: 'Ana Beatriz',
    createdAt: '2024-05-05T10:16:00Z',
    authorizedAt: '2024-05-05T10:16:30Z',
    capturedAt: '2024-05-05T10:18:00Z'
  },
  {
    id: 'pay-5002',
    orderId: 'order-1002',
    method: 'pix',
    cardBrand: null,
    status: 'capturado',
    amount: 5399.1,
    netAmount: 5358.1,
    installments: 1,
    gatewayFees: 0.0075,
    riskScore: 0.05,
    chargeback: false,
    settlementDate: '2024-05-05',
    settlementStatus: 'liquidado',
    customerName: 'Bruno Castro',
    createdAt: '2024-05-04T14:06:00Z',
    authorizedAt: '2024-05-04T14:06:05Z',
    capturedAt: '2024-05-04T14:06:10Z'
  },
  {
    id: 'pay-5003',
    orderId: 'order-1003',
    method: 'cartao_credito',
    cardBrand: 'Mastercard',
    status: 'em_analise',
    amount: 1569.35,
    netAmount: 1507.58,
    installments: 6,
    gatewayFees: 0.034,
    riskScore: 0.62,
    chargeback: false,
    settlementDate: '2024-05-24',
    settlementStatus: 'pendente',
    customerName: 'Camila Duarte',
    createdAt: '2024-05-06T09:43:00Z',
    authorizedAt: null,
    capturedAt: null
  },
  {
    id: 'pay-5004',
    orderId: 'order-1004',
    method: 'cartao_credito',
    cardBrand: 'Elo',
    status: 'recusado',
    amount: 459.99,
    netAmount: 0,
    installments: 1,
    gatewayFees: 0.032,
    riskScore: 0.81,
    chargeback: false,
    settlementDate: null,
    settlementStatus: 'sem_liquidacao',
    customerName: 'Daniela Moreira',
    createdAt: '2024-05-06T12:13:00Z',
    authorizedAt: null,
    capturedAt: null
  },
  {
    id: 'pay-5005',
    orderId: 'order-1005',
    method: 'cartao_credito',
    cardBrand: 'Amex',
    status: 'estornado',
    amount: 11439.12,
    netAmount: 0,
    installments: 12,
    gatewayFees: 0.034,
    riskScore: 0.47,
    chargeback: true,
    settlementDate: '2024-05-10',
    settlementStatus: 'estornado',
    customerName: 'Eduardo Pereira',
    createdAt: '2024-05-03T18:23:00Z',
    authorizedAt: '2024-05-03T18:23:40Z',
    capturedAt: '2024-05-03T18:24:00Z'
  },
  {
    id: 'pay-5006',
    orderId: 'order-1006',
    method: 'pix',
    cardBrand: null,
    status: 'capturado',
    amount: 899.9,
    netAmount: 893.9,
    installments: 1,
    gatewayFees: 0.0067,
    riskScore: 0.09,
    chargeback: false,
    settlementDate: '2024-05-03',
    settlementStatus: 'liquidado',
    customerName: 'Felipe Sousa',
    createdAt: '2024-05-02T16:56:00Z',
    authorizedAt: '2024-05-02T16:56:04Z',
    capturedAt: '2024-05-02T16:56:12Z'
  },
  {
    id: 'pay-5007',
    orderId: 'order-1007',
    method: 'boleto',
    cardBrand: null,
    status: 'aguardando_pagamento',
    amount: 2199.9,
    netAmount: 2143.9,
    installments: 1,
    gatewayFees: 0.025,
    riskScore: 0.12,
    chargeback: false,
    settlementDate: '2024-05-28',
    settlementStatus: 'previsto',
    customerName: 'Gabriela Torres',
    createdAt: '2024-05-06T08:15:00Z',
    authorizedAt: null,
    capturedAt: null
  },
  {
    id: 'pay-5008',
    orderId: 'order-1008',
    method: 'carteira_digital',
    cardBrand: null,
    status: 'capturado',
    amount: 1299.9,
    netAmount: 1260.9,
    installments: 1,
    gatewayFees: 0.03,
    riskScore: 0.21,
    chargeback: false,
    settlementDate: '2024-05-09',
    settlementStatus: 'liquidado',
    customerName: 'Helena Prado',
    createdAt: '2024-05-04T11:03:00Z',
    authorizedAt: '2024-05-04T11:03:20Z',
    capturedAt: '2024-05-04T11:04:10Z'
  },
  {
    id: 'pay-5009',
    orderId: 'order-1009',
    method: 'cartao_credito',
    cardBrand: 'Visa',
    status: 'capturado',
    amount: 3499.9,
    netAmount: 3371.9,
    installments: 8,
    gatewayFees: 0.0365,
    riskScore: 0.33,
    chargeback: false,
    settlementDate: '2024-05-18',
    settlementStatus: 'previsto',
    customerName: 'Igor Martins',
    createdAt: '2024-05-05T19:25:00Z',
    authorizedAt: '2024-05-05T19:25:45Z',
    capturedAt: '2024-05-05T19:26:10Z'
  }
]

const userExists = (id) => users.some((user) => user.id === id)

const decimal = (value) => new Prisma.Decimal(value)

async function main () {
  console.log('Limpando dados anteriores...')
  await prisma.dashboardSnapshot.deleteMany()
  await prisma.inventoryReservation.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  console.log('Populando categorias e produtos...')
  for (const category of categories) {
    await prisma.category.create({ data: category })
  }

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: decimal(product.price),
        discount: decimal(product.discount),
        stock: product.stock,
        brand: product.brand,
        rating: product.rating ? decimal(product.rating) : null,
        highlights: product.highlights,
        images: product.images,
        categoryId: product.category
      }
    })
  }

  console.log('Criando usuários e endereços...')
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, config.security.saltRounds)
    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashed,
        role: user.role
      }
    })

    for (const address of user.addresses) {
      await prisma.address.create({
        data: {
          id: address.id,
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          userId: createdUser.id
        }
      })
    }
  }

  console.log('Registrando pedidos e itens...')
  for (const order of orders) {
    await prisma.order.create({
      data: {
        id: order.id,
        status: order.status,
        total: decimal(order.total),
        customerId: userExists(order.customer.id) ? order.customer.id : null,
        customerReference: order.customer.id,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.createdAt),
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: decimal(item.price)
          }))
        }
      }
    })
  }

  console.log('Aplicando pagamentos...')
  for (const payment of payments) {
    await prisma.payment.create({
      data: {
        id: payment.id,
        orderId: payment.orderId,
        method: payment.method,
        cardBrand: payment.cardBrand,
        status: payment.status,
        amount: decimal(payment.amount),
        netAmount: payment.netAmount !== null ? decimal(payment.netAmount) : null,
        installments: payment.installments,
        gatewayFees: payment.gatewayFees !== null ? decimal(payment.gatewayFees) : null,
        riskScore: payment.riskScore !== null ? decimal(payment.riskScore) : null,
        chargeback: payment.chargeback,
        settlementDate: payment.settlementDate ? new Date(payment.settlementDate) : null,
        settlementStatus: payment.settlementStatus,
        customerName: payment.customerName,
        createdAt: new Date(payment.createdAt),
        authorizedAt: payment.authorizedAt ? new Date(payment.authorizedAt) : null,
        capturedAt: payment.capturedAt ? new Date(payment.capturedAt) : null
      }
    })
  }

  console.log('Gerando snapshot inicial do dashboard...')
  const { rebuildDashboardSnapshot } = await import('../src/services/dashboardReadModelService.js')
  await rebuildDashboardSnapshot()

  console.log('Base de dados da David Store preparada com sucesso!')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
