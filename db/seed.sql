DELETE FROM events
WHERE slug IN ('a-taste-of-haiti-2026', '1804-celebration-2027');

INSERT INTO events (
  slug, title, subtitle, starts_at, ends_at, time_zone,
  location_name, location_address, summary, description, hero_image_url,
  capacity, registration_opens_at, registration_closes_at,
  max_party_size, status, is_featured, display_order
) VALUES (
  '2026-ltca-labor-day-picnic',
  '2026 LTCA Labor Day Picnic',
  'Bringing Lakou to the PNW',
  '2026-09-07T11:00:00-07:00',
  '2026-09-07T17:00:00-07:00',
  'America/Los_Angeles',
  'Seahurst Park',
  '7800 Seahurst Park Dr, Burien, WA 98166',
  'A welcoming gathering where family, friends, and neighbors come together to eat, laugh, play games, enjoy music, share stories, and strengthen community connections.',
  E'Bringing Lakou to the PNW—a welcoming gathering place where family, friends, and neighbors come together to eat, laugh, play games, enjoy music, share stories, and strengthen community connections.\n\nNap pote "Lakou" a nan PNW an—yon espas akeyan kote fanmi, zanmi ak vwazen reyini ansanm pou manje, ri, jwe jwèt, jwe mizik, pataje istwa epi ranfòse lyen nan kominote a.',
  '/images/events/taste-of-haiti-hero.png',
  NULL,
  NULL,
  '2026-09-07T11:00:00-07:00',
  5,
  'published',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  time_zone = EXCLUDED.time_zone,
  location_name = EXCLUDED.location_name,
  location_address = EXCLUDED.location_address,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  hero_image_url = EXCLUDED.hero_image_url,
  capacity = EXCLUDED.capacity,
  registration_opens_at = EXCLUDED.registration_opens_at,
  registration_closes_at = EXCLUDED.registration_closes_at,
  max_party_size = EXCLUDED.max_party_size,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  updated_at = now();
