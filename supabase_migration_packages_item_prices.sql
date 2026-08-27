-- Migration: Add price override to Package Items

ALTER TABLE public.package_items 
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Optionally, populate existing package_items price if they are currently 0
UPDATE public.package_items pi
SET price = COALESCE(
    (SELECT rate FROM public.labor_services ls WHERE ls.id = pi.labor_service_id),
    (SELECT selling_price FROM public.parts p WHERE p.id = pi.part_id),
    0
)
WHERE pi.price = 0;

