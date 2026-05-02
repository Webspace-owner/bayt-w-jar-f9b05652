ALTER TABLE public.listings ALTER COLUMN currency SET DEFAULT 'EGP';
UPDATE public.listings SET currency = 'EGP' WHERE currency = 'SAR' OR currency IS NULL;