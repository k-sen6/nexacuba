-- ============================================
-- NEXACUBA - Migración: agregar minoristas, CUP, transferencia, envío
-- Ejecutar después del schema original
-- ============================================

-- 1. Agregar columna minorista_id a productos (nullable)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS minorista_id UUID REFERENCES minoristas(id) ON DELETE CASCADE;

-- 2. Actualizar CHECK de moneda en productos (quitar MLC, dejar CUP/USD)
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_moneda_check;
ALTER TABLE productos ADD CONSTRAINT productos_moneda_check CHECK (moneda IN ('CUP', 'USD'));

-- 3. Cambiar default de moneda a CUP
ALTER TABLE productos ALTER COLUMN moneda SET DEFAULT 'CUP';

-- 4. Agregar constraint para que producto pertenezca a un solo vendedor
ALTER TABLE productos DROP CONSTRAINT IF EXISTS producto_pertenece_a_vendedor;
ALTER TABLE productos ADD CONSTRAINT producto_pertenece_a_vendedor CHECK (
  (mayorista_id IS NOT NULL AND minorista_id IS NULL) OR
  (mayorista_id IS NULL AND minorista_id IS NOT NULL)
);

-- 5. Crear tabla minoristas
CREATE TABLE IF NOT EXISTS minoristas (
  id UUID PRIMARY KEY REFERENCES perfiles(id) ON DELETE CASCADE,
  nombre_negocio TEXT NOT NULL,
  descripcion TEXT,
  whatsapp TEXT NOT NULL,
  direccion TEXT,
  provincia TEXT NOT NULL,
  acepta_transferencia BOOLEAN DEFAULT false,
  tipo_envio TEXT DEFAULT 'ambos' CHECK (tipo_envio IN ('domicilio', 'recogida', 'ambos')),
  verificada BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'gratis' CHECK (plan IN ('gratis', 'basico', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  plan_activo_hasta TIMESTAMPTZ
);

-- 6. Agregar columnas a mayoristas
ALTER TABLE mayoristas ADD COLUMN IF NOT EXISTS acepta_transferencia BOOLEAN DEFAULT false;
ALTER TABLE mayoristas ADD COLUMN IF NOT EXISTS tipo_envio TEXT DEFAULT 'ambos' CHECK (tipo_envio IN ('domicilio', 'recogida', 'ambos'));

-- 7. Actualizar CHECK de rol en perfiles para incluir minorista
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_rol_check;
ALTER TABLE perfiles ADD CONSTRAINT perfiles_rol_check CHECK (rol IN ('cliente', 'mayorista', 'minorista', 'admin'));

-- 8. Actualizar tabla suscripciones (cambiar a vendedor_id genérico)
-- Si ya fue creada con el schema anterior, ya tiene vendedor_id
-- Si no, crearla
CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL,
  vendedor_tipo TEXT NOT NULL CHECK (vendedor_tipo IN ('mayorista', 'minorista')),
  plan TEXT NOT NULL CHECK (plan IN ('basico', 'pro', 'enterprise')),
  monto NUMERIC(10,2) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  activa BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Actualizar visitas_diarias
CREATE TABLE IF NOT EXISTS visitas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL,
  vendedor_tipo TEXT NOT NULL CHECK (vendedor_tipo IN ('mayorista', 'minorista')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  visitas INTEGER DEFAULT 0,
  clics_whatsapp INTEGER DEFAULT 0,
  UNIQUE(vendedor_id, vendedor_tipo, fecha)
);

-- 10. Índices para minoristas
CREATE INDEX IF NOT EXISTS idx_productos_minorista ON productos(minorista_id);

-- 11. RLS para minoristas
ALTER TABLE minoristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY minoristas_select_public ON minoristas FOR SELECT USING (true);
CREATE POLICY minoristas_update_own ON minoristas FOR UPDATE USING (auth.uid() = id);

-- 12. Actualizar RLS de productos para incluir minorista_id
DROP POLICY IF EXISTS productos_insert_own ON productos;
DROP POLICY IF EXISTS productos_update_own ON productos;
DROP POLICY IF EXISTS productos_delete_own ON productos;

CREATE POLICY productos_insert_own ON productos FOR INSERT WITH CHECK (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);
CREATE POLICY productos_update_own ON productos FOR UPDATE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);
CREATE POLICY productos_delete_own ON productos FOR DELETE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);

-- 13. Actualizar RLS de clics para incluir minoristas
DROP POLICY IF EXISTS clics_select_own ON clics;
CREATE POLICY clics_select_own ON clics FOR SELECT USING (
  EXISTS (SELECT 1 FROM productos WHERE productos.id = clics.producto_id AND
    ((productos.mayorista_id IS NOT NULL AND productos.mayorista_id = auth.uid()) OR
     (productos.minorista_id IS NOT NULL AND productos.minorista_id = auth.uid())))
);

-- 14. Actualizar trigger para incluir minorista y nuevos campos
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
