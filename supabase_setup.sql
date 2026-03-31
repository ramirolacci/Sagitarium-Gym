-- ============================================================
-- SCRIPT DE MIGRACIÓN: Sagitarium Gym → Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. CREAR TABLA CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  apellido        text          NOT NULL DEFAULT '',
  nombre          text          NOT NULL DEFAULT '',
  actividad       text          NOT NULL DEFAULT '',
  fecha_inicio    date,
  fecha_vencimiento date,
  monto_servicio  numeric(10,0) NOT NULL DEFAULT 0,
  monto_pagado    numeric(10,0) NOT NULL DEFAULT 0,
  estado          text          NOT NULL DEFAULT 'Al día',
  observaciones   text          DEFAULT '',
  created_at      timestamptz   DEFAULT now()
);

-- 2. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden VER clientes
CREATE POLICY "Authenticated can read clientes"
  ON public.clientes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo admins pueden INSERTAR
CREATE POLICY "Admins can insert clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  );

-- Solo admins pueden EDITAR
CREATE POLICY "Admins can update clientes"
  ON public.clientes FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  );

-- Solo admins pueden ELIMINAR
CREATE POLICY "Admins can delete clientes"
  ON public.clientes FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin'
  );

-- ============================================================
-- 3. MIGRAR DATOS DESDE MYSQL
--    Copiar y pegar los INSERTs del gimnasio.sql original
--    adaptando el formato (los campos son compatibles)
--    NOTA: El campo 'id' se autogenera, omitir 'idcliente'
-- ============================================================
-- Ejemplo de formato:
-- INSERT INTO public.clientes (apellido, nombre, actividad, fecha_inicio, fecha_vencimiento, monto_servicio, monto_pagado, estado, observaciones)
-- VALUES ('Apaza', 'Ariana', 'Pesas', '2023-06-13', '2023-07-13', 3700, 3700, 'Al día', '');

-- ============================================================
-- 4. CREAR USUARIOS EN SUPABASE AUTH
--    Ir a: Supabase Dashboard → Authentication → Users → Add User
--
--    Usuario Admin:
--      Email:    admin@sagitarium.com   (o el que prefieras)
--      Password: (contraseña nueva segura)
--      user_metadata: { "rol": "admin" }
--
--    Usuario Empleado:
--      Email:    empleado@sagitarium.com
--      Password: (contraseña nueva segura)
--      user_metadata: { "rol": "empleado" }
--
--    Para setear el rol por SQL (alternativa):
-- ============================================================
-- UPDATE auth.users
-- SET raw_user_meta_data = '{"rol": "admin"}'
-- WHERE email = 'admin@sagitarium.com';

-- UPDATE auth.users
-- SET raw_user_meta_data = '{"rol": "empleado"}'
-- WHERE email = 'empleado@sagitarium.com';
