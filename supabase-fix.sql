-- ============================================
-- NEXACUBA - Fix final: columnas, RLS, storage
-- Ejecutar UNA vez en Supabase SQL Editor
-- ============================================

-- 1. Agregar columnas faltantes
ALTER TABLE productos ADD COLUMN IF NOT EXISTS minorista_id UUID REFERENCES minoristas(id) ON DELETE CASCADE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 2. Recrear constraint de pertenencia
ALTER TABLE productos DROP CONSTRAINT IF EXISTS producto_pertenece_a_vendedor;
ALTER TABLE productos ADD CONSTRAINT producto_pertenece_a_vendedor CHECK (
  (mayorista_id IS NOT NULL AND minorista_id IS NULL) OR
  (mayorista_id IS NULL AND minorista_id IS NOT NULL)
);

-- 3. Recrear TODAS las policies de productos desde cero
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Productos SELECT público" ON productos;
CREATE POLICY "Productos SELECT público" ON productos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Productos INSERT propio" ON productos;
CREATE POLICY "Productos INSERT propio" ON productos
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
      (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
    )
  );

DROP POLICY IF EXISTS "Productos UPDATE propio" ON productos;
CREATE POLICY "Productos UPDATE propio" ON productos
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
      (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
    )
  );

DROP POLICY IF EXISTS "Productos DELETE propio" ON productos;
CREATE POLICY "Productos DELETE propio" ON productos
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
      (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
    )
  );

-- 4. RLS para Storage (bucket 'productos' debe crearse manualmente)
DROP POLICY IF EXISTS "Subir imagenes" ON storage.objects;
CREATE POLICY "Subir imagenes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'productos');

DROP POLICY IF EXISTS "Ver imagenes" ON storage.objects;
CREATE POLICY "Ver imagenes" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'productos');

DROP POLICY IF EXISTS "Eliminar imagenes propias" ON storage.objects;
CREATE POLICY "Eliminar imagenes propias" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'productos' AND (storage.foldername(name))[1] = auth.uid()::text);
