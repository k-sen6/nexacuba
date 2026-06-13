-- ============================================
-- NEXACUBA - Fix: agregar minorista_id + storage
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar minorista_id a productos (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS minorista_id UUID REFERENCES minoristas(id) ON DELETE CASCADE;

-- 2. Recrear constraint de pertenencia
ALTER TABLE productos DROP CONSTRAINT IF EXISTS producto_pertenece_a_vendedor;
ALTER TABLE productos ADD CONSTRAINT producto_pertenece_a_vendedor CHECK (
  (mayorista_id IS NOT NULL AND minorista_id IS NULL) OR
  (mayorista_id IS NULL AND minorista_id IS NOT NULL)
);

-- 3. RLS para Storage (bucket 'productos' debe crearse manualmente en Supabase Dashboard)
-- Estas policies se aplican al schema storage.objects
CREATE POLICY IF NOT EXISTS "Usuarios autenticados pueden subir imagenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');

CREATE POLICY IF NOT EXISTS "Cualquiera puede ver imagenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'productos');

CREATE POLICY IF NOT EXISTS "Usuarios pueden eliminar sus propias imagenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'productos' AND (storage.foldername(name))[1] = auth.uid()::text);
