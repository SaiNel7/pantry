-- MISE: Recipe table schema + seed data
-- Run this in your Supabase project's SQL editor

-- Migration: add dietary_tags column (safe to run on existing table)
alter table recipes add column if not exists dietary_tags text[] not null default '{}';

-- Backfill tags for seeded recipes (run after migration)
-- Pesto Tortellini: vegetarian, halal, kosher — NOT nut-free (pesto has pine nuts), NOT dairy-free (cheese/parmesan), NOT gluten-free (pasta)
update recipes set dietary_tags = array['vegetarian', 'halal', 'kosher']
  where title = 'Pesto Tortellini';

-- Ramen Upgrade: dairy-free, nut-free — NOT halal/kosher (pork in most instant ramen seasoning), NOT gluten-free (wheat noodles + soy sauce), NOT vegetarian (animal-derived seasoning)
update recipes set dietary_tags = array['dairy-free', 'nut-free']
  where title = 'Ramen Upgrade';

-- Veggie Stir Fry: vegan, vegetarian, halal, kosher, dairy-free, nut-free — NOT gluten-free (soy sauce has wheat)
update recipes set dietary_tags = array['vegan', 'vegetarian', 'halal', 'kosher', 'dairy-free', 'nut-free']
  where title = 'Veggie Stir Fry';

-- Pasta Aglio e Olio: vegetarian, halal, kosher, nut-free — NOT vegan (parmesan), NOT dairy-free (parmesan), NOT gluten-free (spaghetti)
update recipes set dietary_tags = array['vegetarian', 'halal', 'kosher', 'nut-free']
  where title = 'Pasta Aglio e Olio';

-- Garlic Butter Shrimp Pasta: nut-free only — NOT halal (white wine), NOT kosher (shellfish), NOT dairy-free (butter), NOT vegetarian (shrimp), NOT gluten-free (pasta)
update recipes set dietary_tags = array['nut-free']
  where title = 'Garlic Butter Shrimp Pasta';

-- Sheet Pan Chicken Thighs: gluten-free, dairy-free, nut-free — NOT halal/kosher (can't verify meat sourcing), NOT vegetarian/vegan
update recipes set dietary_tags = array['gluten-free', 'dairy-free', 'nut-free']
  where title = 'Sheet Pan Chicken Thighs';

-- Page views tracking
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null default '/',
  visitor_id text,
  created_at timestamptz not null default now()
);

alter table page_views enable row level security;
create policy "Public insert" on page_views for insert with check (true);
grant insert on table public.page_views to anon, authenticated;

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

-- Additional LOW effort recipes
insert into recipes (title, tagline, effort_level, cook_time_minutes, cost_per_serving, ingredients, steps, dietary_tags) values
(
  'Avocado Toast',
  'Millennial classic. Still hits.',
  'low',
  8,
  2.50,
  '[
    {"name": "Sourdough bread", "quantity": "2 slices"},
    {"name": "Avocado", "quantity": "1 ripe"},
    {"name": "Egg", "quantity": "1"},
    {"name": "Lemon juice", "quantity": "1 tsp"},
    {"name": "Red pepper flakes", "quantity": "pinch"},
    {"name": "Olive oil", "quantity": "1 tsp"},
    {"name": "Salt and pepper", "quantity": "to taste"}
  ]'::jsonb,
  '[
    "Toast the bread until golden.",
    "While bread toasts, fry the egg in olive oil over medium heat to your liking.",
    "Halve and pit the avocado. Scoop into a bowl and mash with lemon juice, salt, and pepper.",
    "Spread avocado on toast. Top with the fried egg and a pinch of red pepper flakes."
  ]'::jsonb,
  array['vegetarian', 'halal', 'kosher', 'dairy-free', 'nut-free']
  -- NOT vegan (egg), NOT gluten-free (bread)
),
(
  'Grilled Cheese',
  'Comfort food, no explanation needed.',
  'low',
  8,
  1.50,
  '[
    {"name": "White or sourdough bread", "quantity": "2 slices"},
    {"name": "Cheddar cheese", "quantity": "2–3 slices"},
    {"name": "Butter", "quantity": "1 tbsp, softened"}
  ]'::jsonb,
  '[
    "Butter one side of each bread slice.",
    "Heat a pan over medium-low. Place one slice butter-side down.",
    "Layer cheese on top, then place second slice butter-side up.",
    "Cook 3–4 min until golden, then flip and cook another 2–3 min.",
    "Let rest 1 min before cutting."
  ]'::jsonb,
  array['vegetarian', 'halal', 'kosher', 'nut-free']
  -- NOT vegan, NOT dairy-free (butter, cheese), NOT gluten-free (bread)
),
(
  'Spicy Peanut Noodles',
  'Takeout flavor, zero delivery fee.',
  'low',
  12,
  2.75,
  '[
    {"name": "Instant ramen or soba noodles", "quantity": "1 serving (about 85g)"},
    {"name": "Peanut butter", "quantity": "2 tbsp", "flag": "swap", "swapSuggestion": "tahini for nut-free version"},
    {"name": "Soy sauce", "quantity": "1 tbsp"},
    {"name": "Rice vinegar", "quantity": "1 tsp"},
    {"name": "Chili oil or sriracha", "quantity": "1 tsp"},
    {"name": "Garlic", "quantity": "1 clove, minced"},
    {"name": "Sugar", "quantity": "½ tsp"},
    {"name": "Cucumber", "quantity": "¼, thinly sliced"},
    {"name": "Green onion", "quantity": "2 stalks, sliced"},
    {"name": "Sesame seeds", "quantity": "1 tsp", "flag": "optional"}
  ]'::jsonb,
  '[
    "Cook noodles according to package. Drain and rinse with cold water.",
    "Whisk together peanut butter, soy sauce, rice vinegar, chili oil, garlic, and sugar. Thin with 1–2 tbsp warm water until saucy.",
    "Toss noodles in the sauce until fully coated.",
    "Top with cucumber, green onion, and sesame seeds."
  ]'::jsonb,
  array['vegan', 'vegetarian', 'halal', 'kosher', 'dairy-free']
  -- NOT nut-free (peanut butter), NOT gluten-free (noodles + soy sauce)
),
(
  'White Bean & Spinach Skillet',
  'Protein-packed. One pan. Done in 10.',
  'low',
  10,
  3.25,
  '[
    {"name": "Canned cannellini beans", "quantity": "1 can (15oz), drained"},
    {"name": "Baby spinach", "quantity": "2 big handfuls"},
    {"name": "Garlic", "quantity": "3 cloves, sliced"},
    {"name": "Olive oil", "quantity": "2 tbsp"},
    {"name": "Lemon", "quantity": "½, juiced"},
    {"name": "Red pepper flakes", "quantity": "¼ tsp"},
    {"name": "Parmesan", "quantity": "2 tbsp, grated", "flag": "optional"},
    {"name": "Salt and pepper", "quantity": "to taste"}
  ]'::jsonb,
  '[
    "Heat olive oil in a pan over medium heat. Add garlic and red pepper flakes, cook 1 min until fragrant.",
    "Add beans. Season with salt and pepper. Cook 3–4 min, lightly mashing some beans with the back of your spoon.",
    "Add spinach in batches, stirring until wilted.",
    "Squeeze lemon over everything and toss.",
    "Plate and top with parmesan if using."
  ]'::jsonb,
  array['vegetarian', 'gluten-free', 'halal', 'kosher', 'nut-free']
  -- NOT vegan (parmesan — optional but included), NOT dairy-free (parmesan)
),
(
  'Caprese Salad',
  'No cooking required. Somehow still impressive.',
  'low',
  5,
  4.50,
  '[
    {"name": "Fresh mozzarella", "quantity": "4oz, sliced"},
    {"name": "Tomatoes", "quantity": "2 medium, sliced"},
    {"name": "Fresh basil", "quantity": "handful of leaves"},
    {"name": "Olive oil", "quantity": "2 tbsp, good quality"},
    {"name": "Balsamic glaze", "quantity": "1 tbsp", "flag": "optional"},
    {"name": "Salt and pepper", "quantity": "to taste"}
  ]'::jsonb,
  '[
    "Slice mozzarella and tomatoes to roughly the same thickness.",
    "Alternate and overlap tomato, mozzarella, and basil leaves on a plate.",
    "Drizzle generously with olive oil and balsamic glaze if using.",
    "Season with flaky salt and cracked pepper. Serve immediately."
  ]'::jsonb,
  array['vegetarian', 'gluten-free', 'halal', 'kosher', 'nut-free']
  -- NOT vegan (mozzarella), NOT dairy-free (mozzarella)
),
(
  'Hot Honey Cheese Fried Eggs',
  'Sweet. Spicy. Cheesy. Don''t skip the crispy edges.',
  'low',
  8,
  2.25,
  '[
    {"name": "Eggs", "quantity": "2"},
    {"name": "Shredded mozzarella or cheddar", "quantity": "¼ cup"},
    {"name": "Butter", "quantity": "1 tbsp"},
    {"name": "Hot honey", "quantity": "1–2 tsp", "flag": "swap", "swapSuggestion": "regular honey + pinch of red pepper flakes"},
    {"name": "Red pepper flakes", "quantity": "pinch"},
    {"name": "Flaky salt", "quantity": "pinch"},
    {"name": "Toast", "quantity": "1–2 slices", "flag": "optional"}
  ]'::jsonb,
  '[
    "Melt butter in a small pan over medium heat until foamy.",
    "Crack in the eggs. Immediately scatter cheese around the whites (not the yolks).",
    "Cover with a lid and cook 2–3 min until whites are set and cheese is melted and crispy at the edges.",
    "Slide onto a plate or straight onto toast.",
    "Drizzle hot honey over the yolks, hit with red pepper flakes and flaky salt."
  ]'::jsonb,
  array['vegetarian', 'gluten-free', 'halal', 'kosher', 'nut-free']
  -- NOT vegan, NOT dairy-free (butter, cheese)
  -- gluten-free as a dish — toast is optional
);

-- Additional MED effort recipes
insert into recipes (title, tagline, effort_level, cook_time_minutes, cost_per_serving, ingredients, steps, dietary_tags) values
(
  'Egg Fried Rice',
  'Leftover rice''s glow-up.',
  'med',
  20,
  3.00,
  '[
    {"name": "Day-old cooked rice", "quantity": "2 cups"},
    {"name": "Eggs", "quantity": "2"},
    {"name": "Frozen peas and carrots", "quantity": "½ cup"},
    {"name": "Green onion", "quantity": "3 stalks, sliced"},
    {"name": "Garlic", "quantity": "2 cloves, minced"},
    {"name": "Soy sauce", "quantity": "2 tbsp"},
    {"name": "Sesame oil", "quantity": "1 tsp"},
    {"name": "Vegetable oil", "quantity": "2 tbsp"}
  ]'::jsonb,
  '[
    "Heat vegetable oil in a large pan or wok over high heat.",
    "Add garlic and frozen vegetables. Stir fry 2 minutes.",
    "Push everything to the side. Crack eggs into the pan and scramble.",
    "Add rice, breaking up any clumps. Stir fry everything together 3–4 min.",
    "Pour in soy sauce and sesame oil. Toss to coat.",
    "Top with green onion and serve."
  ]'::jsonb,
  array['vegetarian', 'halal', 'kosher', 'dairy-free', 'nut-free']
  -- NOT vegan (eggs), NOT gluten-free (soy sauce has wheat)
),
(
  'Shakshuka',
  'Eggs in sauce. Better than it sounds.',
  'med',
  25,
  4.00,
  '[
    {"name": "Canned crushed tomatoes", "quantity": "1 can (14oz)"},
    {"name": "Eggs", "quantity": "4"},
    {"name": "Bell pepper", "quantity": "1, diced"},
    {"name": "Onion", "quantity": "½, diced"},
    {"name": "Garlic", "quantity": "3 cloves, minced"},
    {"name": "Cumin", "quantity": "1 tsp"},
    {"name": "Paprika", "quantity": "1 tsp"},
    {"name": "Olive oil", "quantity": "2 tbsp"},
    {"name": "Feta", "quantity": "2 tbsp, crumbled", "notes": "optional topping", "flag": "optional"}
  ]'::jsonb,
  '[
    "Heat olive oil in a skillet over medium heat. Add onion and bell pepper, cook 5 min until soft.",
    "Add garlic, cumin, and paprika. Cook 1 min until fragrant.",
    "Pour in tomatoes. Season with salt and simmer 10 min.",
    "Make 4 wells in the sauce with a spoon. Crack an egg into each well.",
    "Cover and cook 5–7 min until whites are set but yolks are still runny.",
    "Top with feta if using. Serve with bread or eat straight from the pan."
  ]'::jsonb,
  array['vegetarian', 'halal', 'kosher', 'gluten-free', 'nut-free']
  -- NOT vegan (eggs, optional feta), NOT dairy-free (feta — but feta is optional; dish base is dairy-free. Leaving dairy-free off to be safe.)
);
