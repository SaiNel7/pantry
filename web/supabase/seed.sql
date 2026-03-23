-- MISE: Recipe table schema + seed data
-- Run this in your Supabase project's SQL editor

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text,
  effort_level text check (effort_level in ('low', 'med', 'high')) not null,
  cook_time_minutes integer,
  cost_per_serving numeric(6,2),
  image_url text,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  source_url text,
  created_at timestamptz default now()
);

-- Grant permissions to anon role
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.recipes to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Allow public read/insert via RLS
alter table recipes enable row level security;
create policy "Public read" on recipes for select using (true);
create policy "Public insert" on recipes for insert with check (true);
create policy "Public delete" on recipes for delete using (true);
create policy "Public update" on recipes for update using (true);

-- Seed: LOW effort recipes
insert into recipes (title, tagline, effort_level, cook_time_minutes, cost_per_serving, ingredients, steps) values
(
  'Pesto Tortellini',
  'Low effort. High reward.',
  'low',
  12,
  4.50,
  '[
    {"name": "Cheese tortellini", "quantity": "1 bag (9oz)"},
    {"name": "Pesto", "quantity": "3 tbsp"},
    {"name": "Parmesan", "quantity": "2 tbsp, grated"},
    {"name": "Cherry tomatoes", "quantity": "1 cup, halved"},
    {"name": "Olive oil", "quantity": "1 tsp"}
  ]'::jsonb,
  '[
    "Boil salted water and cook tortellini according to package directions (about 7-8 min).",
    "Reserve ¼ cup pasta water before draining.",
    "Return tortellini to pot over low heat. Add pesto and a splash of pasta water.",
    "Toss in cherry tomatoes and drizzle with olive oil.",
    "Plate and top with parmesan. Done."
  ]'::jsonb
),
(
  'Ramen Upgrade',
  'Your instant ramen, evolved.',
  'low',
  8,
  2.10,
  '[
    {"name": "Instant ramen", "quantity": "1 pack"},
    {"name": "Egg", "quantity": "1"},
    {"name": "Green onion", "quantity": "2 stalks, sliced"},
    {"name": "Sriracha", "quantity": "to taste"},
    {"name": "Soy sauce", "quantity": "1 tsp"},
    {"name": "Sesame oil", "quantity": "½ tsp"}
  ]'::jsonb,
  '[
    "Cook ramen noodles per package instructions (use only half the seasoning packet).",
    "While noodles cook, soft-boil or fry an egg separately.",
    "Add soy sauce and sesame oil to the broth.",
    "Top with sliced green onion, the egg, and a drizzle of sriracha.",
    "Serve immediately."
  ]'::jsonb
);

-- Seed: MED effort recipes
insert into recipes (title, tagline, effort_level, cook_time_minutes, cost_per_serving, ingredients, steps) values
(
  'Veggie Stir Fry',
  'Wok optional. Ambition required.',
  'med',
  22,
  5.20,
  '[
    {"name": "Rice", "quantity": "1 cup"},
    {"name": "Bell pepper", "quantity": "1, sliced"},
    {"name": "Broccoli", "quantity": "1 cup florets"},
    {"name": "Carrot", "quantity": "1, julienned"},
    {"name": "Soy sauce", "quantity": "3 tbsp"},
    {"name": "Garlic", "quantity": "3 cloves, minced"},
    {"name": "Sesame oil", "quantity": "1 tsp"},
    {"name": "Vegetable oil", "quantity": "2 tbsp"}
  ]'::jsonb,
  '[
    "Cook rice according to package directions.",
    "Heat vegetable oil in a large pan or wok over high heat until smoking.",
    "Add carrots and broccoli — stir fry 3 minutes until slightly charred.",
    "Add bell pepper and garlic, stir fry another 2 minutes.",
    "Pour in soy sauce and sesame oil, toss everything to coat.",
    "Serve over rice."
  ]'::jsonb
),
(
  'Pasta Aglio e Olio',
  '4 ingredients. Italian grandma approved.',
  'med',
  18,
  3.80,
  '[
    {"name": "Spaghetti", "quantity": "200g"},
    {"name": "Garlic", "quantity": "6 cloves, thinly sliced"},
    {"name": "Olive oil", "quantity": "⅓ cup"},
    {"name": "Red pepper flakes", "quantity": "½ tsp"},
    {"name": "Parsley", "quantity": "handful, chopped"},
    {"name": "Parmesan", "quantity": "to taste"}
  ]'::jsonb,
  '[
    "Cook spaghetti in well-salted water until al dente. Reserve 1 cup pasta water.",
    "While pasta cooks, heat olive oil in a large pan over medium-low heat.",
    "Add garlic and red pepper flakes. Cook slowly until garlic is golden, about 5 min. Don''t burn it.",
    "Add drained pasta to the pan with a big splash of pasta water. Toss vigorously.",
    "Remove from heat, add parsley and toss again.",
    "Plate and top with parmesan."
  ]'::jsonb
);

-- Seed: HIGH effort recipes
insert into recipes (title, tagline, effort_level, cook_time_minutes, cost_per_serving, ingredients, steps) values
(
  'Garlic Butter Shrimp Pasta',
  'Date night energy on a student budget.',
  'high',
  35,
  7.80,
  '[
    {"name": "Shrimp", "quantity": "½ lb, peeled and deveined"},
    {"name": "Linguine", "quantity": "200g"},
    {"name": "Butter", "quantity": "4 tbsp"},
    {"name": "Garlic", "quantity": "5 cloves, minced"},
    {"name": "White wine or chicken broth", "quantity": "¼ cup"},
    {"name": "Lemon", "quantity": "1, juiced"},
    {"name": "Parsley", "quantity": "handful, chopped"},
    {"name": "Red pepper flakes", "quantity": "¼ tsp"}
  ]'::jsonb,
  '[
    "Cook linguine until al dente. Reserve pasta water and drain.",
    "Pat shrimp dry and season with salt and pepper.",
    "Melt 2 tbsp butter in a large skillet over medium-high heat. Add shrimp, cook 1-2 min per side until pink. Remove and set aside.",
    "In same pan, melt remaining butter. Add garlic and red pepper flakes, cook 1 min.",
    "Add wine or broth, cook 2 min until slightly reduced.",
    "Add lemon juice, pasta, and a splash of pasta water. Toss to coat.",
    "Return shrimp to pan, toss, and finish with parsley."
  ]'::jsonb
),
(
  'Sheet Pan Chicken Thighs',
  'One pan. Zero excuses.',
  'high',
  45,
  6.50,
  '[
    {"name": "Chicken thighs", "quantity": "4 bone-in, skin-on"},
    {"name": "Baby potatoes", "quantity": "1 lb, halved"},
    {"name": "Broccoli", "quantity": "2 cups florets"},
    {"name": "Olive oil", "quantity": "3 tbsp"},
    {"name": "Garlic powder", "quantity": "1 tsp"},
    {"name": "Paprika", "quantity": "1 tsp"},
    {"name": "Italian seasoning", "quantity": "1 tsp"},
    {"name": "Lemon", "quantity": "1, sliced"}
  ]'::jsonb,
  '[
    "Preheat oven to 425°F.",
    "Toss potatoes with 1 tbsp olive oil, salt, and pepper. Spread on sheet pan.",
    "Pat chicken dry. Rub with remaining olive oil, garlic powder, paprika, and Italian seasoning.",
    "Nestle chicken over potatoes. Add lemon slices.",
    "Roast 25 minutes. Push chicken aside, add broccoli to pan.",
    "Roast another 15-20 minutes until chicken skin is crispy and potatoes are tender.",
    "Rest 5 minutes before serving."
  ]'::jsonb
);
