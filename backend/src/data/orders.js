export const orders = [
  {
    id: 'order-1001',
    customer: {
      id: 'user-001',
      name: 'Ana Beatriz',
      email: 'ana.b@davidstore.com'
    },
    status: 'processando',
    total: 7899.8,
    items: [
      {
        productId: 'tv-4k-001',
        quantity: 1,
        price: 4164.92
      },
      {
        productId: 'sofa-001',
        quantity: 1,
        price: 2399.92
      },
      {
        productId: 'soundbar-001',
        quantity: 1,
        price: 1334.96
      }
    ],
    createdAt: '2024-05-05T10:15:00Z'
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
    items: [
      {
        productId: 'geladeira-001',
        quantity: 1,
        price: 5399.1
      }
    ],
    createdAt: '2024-05-04T14:05:00Z'
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
    items: [
      {
        productId: 'maquina-lavar-001',
        quantity: 1,
        price: 1569.35
      }
    ],
    createdAt: '2024-05-06T09:42:00Z'
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
    items: [
      {
        productId: 'cafeteira-001',
        quantity: 1,
        price: 459.99
      }
    ],
    createdAt: '2024-05-06T12:12:00Z'
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
    items: [
      {
        productId: 'notebook-001',
        quantity: 1,
        price: 11439.12
      }
    ],
    createdAt: '2024-05-03T18:22:00Z'
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
    items: [
      {
        productId: 'micro-ondas-001',
        quantity: 1,
        price: 899.9
      }
    ],
    createdAt: '2024-05-02T16:55:00Z'
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
    items: [
      {
        productId: 'ar-condicionado-001',
        quantity: 1,
        price: 2199.9
      }
    ],
    createdAt: '2024-05-06T08:15:00Z'
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
    items: [
      {
        productId: 'cadeira-gamer-001',
        quantity: 1,
        price: 1299.9
      }
    ],
    createdAt: '2024-05-04T11:02:00Z'
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
    items: [
      {
        productId: 'smartphone-001',
        quantity: 1,
        price: 3499.9
      }
    ],
    createdAt: '2024-05-05T19:24:00Z'
  }
]
