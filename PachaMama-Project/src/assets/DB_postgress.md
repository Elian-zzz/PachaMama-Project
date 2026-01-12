-- Tabla: productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL, -- 'kg', 'atado', 'unidad'
  disponible BOOLEAN DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) UNIQUE NOT NULL,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  estado VARCHAR(20) DEFAULT 'borrador', -- borrador, confirmado, preparado, entregado
  total DECIMAL(10,2) DEFAULT 0,
  tipo VARCHAR(20) DEFAULT 'convencional', -- convencional, exclusivo
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: pedido_items
CREATE TABLE pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: conversaciones (estado de chat)
CREATE TABLE conversaciones (
  telefono VARCHAR(20) PRIMARY KEY,
  estado VARCHAR(50), -- esperando_nombre, tomando_pedido, atencion_manual
  pedido_id UUID REFERENCES pedidos(id),
  datos_temp JSONB, -- para guardar datos parciales
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: gastos
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  detalles TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: lista_precios_historico (opcional)
CREATE TABLE lista_precios_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productos JSONB NOT NULL, -- snapshot de precios
  vigencia_desde DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: notificaciones_admin (para alertas en dashboard)
CREATE TABLE notificaciones_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);