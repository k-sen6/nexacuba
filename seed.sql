-- ============================================
-- NEXACUBA - Seed Data
-- ============================================

-- Insertar categorías
INSERT INTO public.categorias (nombre, icono, slug) VALUES
  ('Tecnología', '📱', 'tecnologia'),
  ('Moda', '👕', 'moda'),
  ('Alimentos', '🍎', 'alimentos'),
  ('Hogar', '🏠', 'hogar'),
  ('Deportes', '⚽', 'deportes'),
  ('Belleza', '💄', 'belleza'),
  ('Juguetes', '🎮', 'juguetes'),
  ('Automóvil', '🚗', 'automovil'),
  ('Salud', '💊', 'salud'),
  ('Mascotas', '🐾', 'mascotas')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Para crear un admin manualmente:
-- 1. Regístrate como mayorista desde la UI
-- 2. Ejecuta: UPDATE perfiles SET rol = 'admin' WHERE email = 'tu-email@ejemplo.com';
-- ============================================
