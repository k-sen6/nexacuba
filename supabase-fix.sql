-- ============================================
-- NEXACUBA - Fix: agregar minorista_id + storage
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar minorista_id a productos (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS minorista_id UUID REFERENCES minoristas(id) ON DELETE CASCADE;

-- 1b. Agregar imagen_url a productos (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 2. Recrear constraint de pertenencia
ALTER TABLE productos DROP CONSTRAINT IF EXISTS producto_pertenece_a_vendedor;
ALTER TABLE productos ADD CONSTRAINT producto_pertenece_a_vendedor CHECK (
  (mayorista_id IS NOT NULL AND minorista_id IS NULL) OR
  (mayorista_id IS NULL AND minorista_id IS NOT NULL)
);

-- 3. Recrear RLS de productos (para que funcionen con minorista_id)
DROP POLICY IF EXISTS productos_select_public ON productos;
CREATE POLICY productos_select_public ON productos FOR SELECT USING (true);
DROP POLICY IF EXISTS productos_insert_own ON productos;
CREATE POLICY productos_insert_own ON productos FOR INSERT WITH CHECK (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);
DROP POLICY IF EXISTS productos_update_own ON productos;
CREATE POLICY productos_update_own ON productos FOR UPDATE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);
DROP POLICY IF EXISTS productos_delete_own ON productos;
CREATE POLICY productos_delete_own ON productos FOR DELETE USING (
  (mayorista_id IS NOT NULL AND auth.uid() = mayorista_id) OR
  (minorista_id IS NOT NULL AND auth.uid() = minorista_id)
);

-- 4. RLS para Storage (bucket 'productos' debe crearse manualmente en Supabase Dashboard)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imagenes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir imagenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');

DROP POLICY IF EXISTS "Cualquiera puede ver imagenes" ON storage.objects;
CREATE POLICY "Cualquiera puede ver imagenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'productos');

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias imagenes" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar sus propias imagenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'productos' AND (storage.foldername(name))[1] = auth.uid()::text);
