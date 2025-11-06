-- Adiciona o estoque reservado aos produtos
ALTER TABLE "Product" ADD COLUMN "reservedStock" INTEGER NOT NULL DEFAULT 0;

-- Cria a tabela de reservas de estoque para pedidos
CREATE TABLE "InventoryReservation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "revertedAt" TIMESTAMP(3),
    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryReservation_orderId_key" UNIQUE ("orderId"),
    CONSTRAINT "InventoryReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Cria o read model do dashboard financeiro
CREATE TABLE "DashboardSnapshot" (
    "id" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "lowStock" JSONB NOT NULL,
    "paymentSummary" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DashboardSnapshot_pkey" PRIMARY KEY ("id")
);
