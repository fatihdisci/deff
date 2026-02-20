-- Supabase SQL Editor için çalıştırılacak komut
-- `profiles` tablosuna benzersiz `username` kolonunu ekler

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- (İsteğe bağlı) Kullanıcı isimlerini küçük harfe zorlamak için veya güvenli karakterler için check eklenebilir
-- ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9.\-]+$');
