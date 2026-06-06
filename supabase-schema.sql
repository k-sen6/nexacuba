-- ============================================
-- NEXACUBA - Esquema de Base de Datos
-- Marketplace B2B para mayoristas en Cuba
-- ============================================

-- Tabla de perfiles de usuario (se crea automáticamente con trigger)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'mayorista', 'admin')),
  nombre TEXT,
  telefono TEXT,
  avatar_url TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de mayoristas (datos adicionales)
CREATE TABLE IF NOT EXISTS mayoristas (
  id UUID PRIMARY KEY REFERENCES perfiles(id) ON DELETE CASCADE,
  nombre_negocio TEXT NOT NULL,
  descripcion TEXT,
  whatsapp TEXT NOT NULL,
  direccion TEXT,
  provincia TEXT NOT NULL,
  verificada BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'gratis' CHECK (plan IN ('gratis', 'basico', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  plan_activo_hasta TIMESTAMPTZ
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  icono TEXT,
  slug TEXT UNIQUE NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mayorista_id UUID NOT NULL REFERENCES mayoristas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL,
  moneda TEXT DEFAULT 'USD' CHECK (moneda IN ('USD', 'CUP', 'MLC')),
  imagenes TEXT[] DEFAULT '{}',
  categoria_id UUID REFERENCES categorias(id),
  stock INTEGER,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de ofertas especiales
CREATE TABLE IF NOT EXISTS ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_oferta NUMERIC(10,2) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  activa BOOLEAN DEFAULT true
);

-- Tabla de clics/leads (para tracking)
CREATE TABLE IF NOT EXISTS clics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES perfiles(id),
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mayorista_id UUID NOT NULL REFERENCES mayoristas(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basico', 'pro', 'enterprise')),
  monto NUMERIC(10,2) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  activa BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de visitas diarias (para dashboards)
CREATE TABLE IF NOT EXISTS visitas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mayorista_id UUID NOT NULL REFERENCES mayoristas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  visitas INTEGER DEFAULT 0,
  clics_whatsapp INTEGER DEFAULT 0,
  UNIQUE(mayorista_id, fecha)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_productos_mayorista ON productos(mayorista_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_clics_producto ON clics(producto_id);
CREATE INDEX IF NOT EXISTS idx_clics_created_at ON clics(created_at);
CREATE INDEX IF NOT EXISTS idx_visitas_mayorista ON visitas_diarias(mayorista_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas_diarias(fecha);

-- ============================================
-- TRIGGER: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, rol, nombre, telefono)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente'),
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefono', '')
  );

  -- Si es mayorista, crear registro también en tabla mayoristas
  IF COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente') = 'mayorista' THEN
    INSERT INTO public.mayoristas (id, nombre_negocio, whatsapp, provincia)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre_negocio', ''),
      COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
      COALESCE(NEW.raw_user_meta_data->>'provincia', '')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clics ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas_diarias ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada uno ve y edita su propio perfil
CREATE POLICY perfiles_select_own ON perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY perfiles_update_own ON perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY perfiles_insert_own ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Mayoristas: select público (para mostrar en productos), update solo propio
CREATE POLICY mayoristas_select_public ON mayoristas FOR SELECT USING (true);
CREATE POLICY mayoristas_update_own ON mayoristas FOR UPDATE USING (auth.uid() = id);

-- Productos: select público (catálogo visible para todos)
CREATE POLICY productos_select_public ON productos FOR SELECT USING (true);
CREATE POLICY productos_insert_own ON productos FOR INSERT WITH CHECK (auth.uid() = mayorista_id);
CREATE POLICY productos_update_own ON productos FOR UPDATE USING (auth.uid() = mayorista_id);
CREATE POLICY productos_delete_own ON productos FOR DELETE USING (auth.uid() = mayorista_id);

-- Clics: solo insert (público) y select para el mayorista
CREATE POLICY clics_insert_anon ON clics FOR INSERT WITH CHECK (true);
CREATE POLICY clics_select_own ON clics FOR SELECT USING (
  EXISTS (SELECT 1 FROM productos WHERE productos.id = clics.producto_id AND productos.mayorista_id = auth.uid())
);

-- Suscripciones: solo el mayorista ve las suyas
CREATE POLICY suscripciones_select_own ON suscripciones FOR SELECT USING (auth.uid() = mayorista_id);

-- Visitas diarias: solo el mayorista ve las suyas
CREATE POLICY visitas_select_own ON visitas_diarias FOR SELECT USING (auth.uid() = mayorista_id);
CREATE POLICY visitas_insert_update ON visitas_diarias FOR INSERT WITH CHECK (auth.uid() = mayorista_id);
