-- ============================================
-- NEXACUBA - Script completo a prueba de errores
-- Ejecutar UNA sola vez en Supabase SQL Editor
-- ============================================

-- Función helper para ejecutar SQL atrapando errores
CREATE OR REPLACE FUNCTION safe_exec(sql TEXT) RETURNS void AS $$
BEGIN
  EXECUTE sql;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Ignorado (ya existe o no aplica): %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ==================== TABLAS ====================

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );
$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'cliente',
    nombre TEXT,
    telefono TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
$$);

-- Agregar/actualizar CHECK de rol (puede que ya exista o no)
SELECT safe_exec('ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_rol_check');
SELECT safe_exec($$ALTER TABLE perfiles ADD CONSTRAINT perfiles_rol_check CHECK (rol IN ('cliente', 'mayorista', 'minorista', 'admin'))$$);

SELECT safe_exec($$
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
$$);

-- Agregar columnas nuevas a mayoristas (si no existen)
SELECT safe_exec('ALTER TABLE mayoristas ADD COLUMN IF NOT EXISTS acepta_transferencia BOOLEAN DEFAULT false');
SELECT safe_exec('ALTER TABLE mayoristas ADD COLUMN IF NOT EXISTS tipo_envio TEXT DEFAULT ''ambos''');
SELECT safe_exec($$ALTER TABLE mayoristas ADD CONSTRAINT IF NOT EXISTS mayoristas_tipo_envio_check CHECK (tipo_envio IN ('domicilio', 'recogida', 'ambos'))$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS minoristas (
    id UUID PRIMARY KEY REFERENCES perfiles(id) ON DELETE CASCADE,
    nombre_negocio TEXT NOT NULL,
    descripcion TEXT,
    whatsapp TEXT NOT NULL,
    direccion TEXT,
    provincia TEXT NOT NULL,
    acepta_transferencia BOOLEAN DEFAULT false,
    tipo_envio TEXT DEFAULT 'ambos',
    verificada BOOLEAN DEFAULT false,
    plan TEXT DEFAULT 'gratis',
    stripe_customer_id TEXT,
    plan_activo_hasta TIMESTAMPTZ
  );
$$);

SELECT safe_exec($$ALTER TABLE minoristas ADD CONSTRAINT IF NOT EXISTS minoristas_plan_check CHECK (plan IN ('gratis', 'basico', 'pro', 'enterprise'))$$);
SELECT safe_exec($$ALTER TABLE minoristas ADD CONSTRAINT IF NOT EXISTS minoristas_tipo_envio_check CHECK (tipo_envio IN ('domicilio', 'recogida', 'ambos'))$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mayorista_id UUID,
    minorista_id UUID,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    moneda TEXT NOT NULL DEFAULT 'CUP',
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );
$$);

-- FK de productos (pueden ya existir o no)
SELECT safe_exec('ALTER TABLE productos ADD CONSTRAINT IF NOT EXISTS productos_mayorista_fk FOREIGN KEY (mayorista_id) REFERENCES mayoristas(id) ON DELETE CASCADE');
SELECT safe_exec('ALTER TABLE productos ADD CONSTRAINT IF NOT EXISTS productos_minorista_fk FOREIGN KEY (minorista_id) REFERENCES minoristas(id) ON DELETE CASCADE');

-- CHECK moneda
SELECT safe_exec('ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_moneda_check');
SELECT safe_exec($$ALTER TABLE productos ADD CONSTRAINT productos_moneda_check CHECK (moneda IN ('CUP', 'USD'))$$);

-- producto debe pertenecer a un solo vendedor
SELECT safe_exec('ALTER TABLE productos DROP CONSTRAINT IF EXISTS producto_pertenece_a_vendedor');
SELECT safe_exec($$ALTER TABLE productos ADD CONSTRAINT producto_pertenece_a_vendedor CHECK (
  (mayorista_id IS NOT NULL AND minorista_id IS NULL) OR
  (mayorista_id IS NULL AND minorista_id IS NOT NULL)
)$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID NOT NULL,
    vendedor_tipo TEXT NOT NULL,
    plan TEXT NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    activa BOOLEAN DEFAULT true,
    stripe_subscription_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );
$$);

SELECT safe_exec($$ALTER TABLE suscripciones ADD CONSTRAINT IF NOT EXISTS susc_vendedor_tipo_check CHECK (vendedor_tipo IN ('mayorista', 'minorista'))$$);
SELECT safe_exec($$ALTER TABLE suscripciones ADD CONSTRAINT IF NOT EXISTS susc_plan_check CHECK (plan IN ('basico', 'pro', 'enterprise'))$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS visitas_diarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID NOT NULL,
    vendedor_tipo TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    visitas INTEGER DEFAULT 0,
    clics_whatsapp INTEGER DEFAULT 0
  );
$$);

SELECT safe_exec($$ALTER TABLE visitas_diarias ADD CONSTRAINT IF NOT EXISTS vis_vendedor_tipo_check CHECK (vendedor_tipo IN ('mayorista', 'minorista'))$$);
SELECT safe_exec($$ALTER TABLE visitas_diarias ADD CONSTRAINT IF NOT EXISTS vis_unique_vendedor_fecha UNIQUE (vendedor_id, vendedor_tipo, fecha)$$);

SELECT safe_exec($$
  CREATE TABLE IF NOT EXISTS clics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT now()
  );
$$);

-- ==================== ÍNDICES ====================

SELECT safe_exec('CREATE INDEX IF NOT EXISTS idx_productos_mayorista ON productos(mayorista_id)');
SELECT safe_exec('CREATE INDEX IF NOT EXISTS idx_productos_minorista ON productos(minorista_id)');
SELECT safe_exec('CREATE INDEX IF NOT EXISTS idx_clics_producto ON clics(producto_id)');

-- ==================== RLS ====================

SELECT safe_exec('ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE minoristas ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE productos ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE categorias ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE visitas_diarias ENABLE ROW LEVEL SECURITY');
SELECT safe_exec('ALTER TABLE clics ENABLE ROW LEVEL SECURITY');

-- Políticas (DROP + CREATE para asegurar que quedan correctas)
SELECT safe_exec('DROP POLICY IF EXISTS perfiles_select_own ON perfiles');
SELECT safe_exec('CREATE POLICY perfiles_select_own ON perfiles FOR SELECT USING (auth.uid() = id)');
SELECT safe_exec('DROP POLICY IF EXISTS perfiles_update_own ON perfiles');
SELECT safe_exec('CREATE POLICY perfiles_update_own ON perfiles FOR UPDATE USING (auth.uid() = id)');

SELECT safe_exec('DROP POLICY IF EXISTS mayoristas_select_public ON mayoristas');
SELECT safe_exec('CREATE POLICY mayoristas_select_public ON mayoristas FOR SELECT USING (true)');
SELECT safe_exec('DROP POLICY IF EXISTS mayoristas_update_own ON mayoristas');
SELECT safe_exec('CREATE POLICY mayoristas_update_own ON mayoristas FOR UPDATE USING (auth.uid() = id)');

SELECT safe_exec('DROP POLICY IF EXISTS minoristas_select_public ON minoristas');
SELECT safe_exec('CREATE POLICY minoristas_select_public ON minoristas FOR SELECT USING (true)');
SELECT safe_exec('DROP POLICY IF EXISTS minoristas_update_own ON minoristas');
SELECT safe_exec('CREATE POLICY minoristas_update_own ON minoristas FOR UPDATE USING (auth.uid() = id)');

SELECT safe_exec('DROP POLICY IF EXISTS productos_select_public ON productos');
SELECT safe_exec('CREATE POLICY productos_select_public ON productos FOR SELECT USING (true)');
SELECT safe_exec('DROP POLICY IF EXISTS productos_insert_own ON productos');
SELECT safe_exec($$CREATE POLICY productos_insert_own ON productos FOR INSERT WITH CHECK (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
)$$);
SELECT safe_exec('DROP POLICY IF EXISTS productos_update_own ON productos');
SELECT safe_exec($$CREATE POLICY productos_update_own ON productos FOR UPDATE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
)$$);
SELECT safe_exec('DROP POLICY IF EXISTS productos_delete_own ON productos');
SELECT safe_exec($$CREATE POLICY productos_delete_own ON productos FOR DELETE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
)$$);

SELECT safe_exec('DROP POLICY IF EXISTS categorias_select ON categorias');
SELECT safe_exec('CREATE POLICY categorias_select ON categorias FOR SELECT USING (true)');

SELECT safe_exec('DROP POLICY IF EXISTS clics_insert ON clics');
SELECT safe_exec('CREATE POLICY clics_insert ON clics FOR INSERT WITH CHECK (true)');
SELECT safe_exec('DROP POLICY IF EXISTS clics_select_own ON clics');
SELECT safe_exec($$CREATE POLICY clics_select_own ON clics FOR SELECT USING (
  EXISTS (SELECT 1 FROM productos WHERE productos.id = clics.producto_id AND
    ((productos.mayorista_id IS NOT NULL AND productos.mayorista_id = auth.uid()) OR
     (productos.minorista_id IS NOT NULL AND productos.minorista_id = auth.uid())))
)$$);

-- ==================== TRIGGER ====================

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

  IF COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente') = 'mayorista' THEN
    INSERT INTO public.mayoristas (id, nombre_negocio, whatsapp, provincia, acepta_transferencia, tipo_envio)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre_negocio', ''),
      COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
      COALESCE(NEW.raw_user_meta_data->>'provincia', ''),
      (NEW.raw_user_meta_data->>'acepta_transferencia')::boolean,
      COALESCE(NEW.raw_user_meta_data->>'tipo_envio', 'ambos')
    );
  END IF;

  IF COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente') = 'minorista' THEN
    INSERT INTO public.minoristas (id, nombre_negocio, whatsapp, provincia, acepta_transferencia, tipo_envio)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre_negocio', ''),
      COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
      COALESCE(NEW.raw_user_meta_data->>'provincia', ''),
      (NEW.raw_user_meta_data->>'acepta_transferencia')::boolean,
      COALESCE(NEW.raw_user_meta_data->>'tipo_envio', 'ambos')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== DATOS INICIALES ====================

INSERT INTO categorias (nombre, slug) VALUES
  ('Electrónica', 'electronica'),
  ('Ropa y Accesorios', 'ropa-accesorios'),
  ('Hogar', 'hogar'),
  ('Alimentos y Bebidas', 'alimentos-bebidas'),
  ('Salud y Belleza', 'salud-belleza'),
  ('Deportes', 'deportes'),
  ('Juguetes', 'juguetes'),
  ('Libros y Papelería', 'libros-papeleria'),
  ('Mascotas', 'mascotas'),
  ('Otros', 'otros')
ON CONFLICT (slug) DO NOTHING;

-- Limpiar función helper
DROP FUNCTION safe_exec;
