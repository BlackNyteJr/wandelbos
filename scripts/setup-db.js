const pg = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new pg.Client({ 
  connectionString: process.env.POSTGRES_URL
});

async function main() {
  await client.connect();
  console.log('Connected to database');

  // Create locations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      historical_info TEXT,
      latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
      longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
      order_number INTEGER NOT NULL DEFAULT 0,
      panorama_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('Created locations table');

  // Create location_images table
  await client.query(`
    CREATE TABLE IF NOT EXISTS location_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      caption TEXT,
      is_historical BOOLEAN DEFAULT false,
      year_taken TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('Created location_images table');

  // Create quiz_questions table
  await client.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      correct_answer INTEGER NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('Created quiz_questions table');

  // Create quiz_scores table
  await client.query(`
    CREATE TABLE IF NOT EXISTS quiz_scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name TEXT,
      score INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      age_group TEXT DEFAULT 'adult',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('Created quiz_scores table');

  // Enable RLS
  await client.query(`ALTER TABLE locations ENABLE ROW LEVEL SECURITY;`);
  await client.query(`ALTER TABLE location_images ENABLE ROW LEVEL SECURITY;`);
  await client.query(`ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;`);
  await client.query(`ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;`);
  console.log('Enabled RLS on all tables');

  // Public read policies
  await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'locations_public_read') THEN CREATE POLICY locations_public_read ON locations FOR SELECT USING (true); END IF; END $$;`);
  await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'location_images_public_read') THEN CREATE POLICY location_images_public_read ON location_images FOR SELECT USING (true); END IF; END $$;`);
  await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quiz_questions_public_read') THEN CREATE POLICY quiz_questions_public_read ON quiz_questions FOR SELECT USING (true); END IF; END $$;`);
  await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quiz_scores_public_read') THEN CREATE POLICY quiz_scores_public_read ON quiz_scores FOR SELECT USING (true); END IF; END $$;`);
  console.log('Created public read policies');

  // Public insert for quiz scores
  await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quiz_scores_public_insert') THEN CREATE POLICY quiz_scores_public_insert ON quiz_scores FOR INSERT WITH CHECK (true); END IF; END $$;`);
  console.log('Created quiz scores insert policy');

  // Admin policies for authenticated users
  const adminTables = ['locations', 'location_images', 'quiz_questions'];
  for (const table of adminTables) {
    for (const op of ['INSERT', 'UPDATE', 'DELETE']) {
      const policyName = `${table}_admin_${op.toLowerCase()}`;
      const clause = op === 'INSERT' ? `WITH CHECK (auth.uid() IS NOT NULL)` : `USING (auth.uid() IS NOT NULL)`;
      await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '${policyName}') THEN CREATE POLICY ${policyName} ON ${table} FOR ${op} ${clause}; END IF; END $$;`);
    }
  }
  console.log('Created admin policies');

  // Seed some sample locations
  await client.query(`
    INSERT INTO locations (name, slug, description, historical_info, latitude, longitude, order_number)
    VALUES 
      ('De Oude Eik', 'de-oude-eik', 'Een monumentale eik die al meer dan 300 jaar in het bos staat.', 'Deze eik werd geplant in het jaar 1720 door de toenmalige landheer. Tijdens de Tweede Wereldoorlog diende de boom als herkenningspunt voor het verzet. Vele generaties hebben in de schaduw van deze boom gerust.', 51.5850, 5.0560, 1),
      ('Het Koetshuis', 'het-koetshuis', 'De ruine van het voormalige koetshuis van landgoed Wandelbos.', 'Het koetshuis werd gebouwd in 1845 als onderdeel van het landgoed. Het huisvestte ooit zes koetsen en twaalf paarden. Na een brand in 1923 werd het nooit herbouwd en staat nu als schilderachtige ruine in het bos.', 51.5860, 5.0575, 2),
      ('De Vijver', 'de-vijver', 'Een door mensen aangelegde vijver uit de 19e eeuw.', 'De vijver werd in 1867 aangelegd als onderdeel van de landschapstuin. Het water komt uit een natuurlijke bron die al eeuwen bekend is. In de winter werd hier vroeger geschaatst door de families uit de omgeving.', 51.5870, 5.0590, 3),
      ('Het Jachthuis', 'het-jachthuis', 'Een gerestaureerd jachthuis dat nu dient als bezoekerscentrum.', 'Oorspronkelijk gebouwd in 1789 voor de jachtpartijen van de adel. Het gebouw overleefde beide wereldoorlogen en werd in 2005 volledig gerestaureerd. Nu vertelt het de geschiedenis van het bos en zijn bewoners.', 51.5840, 5.0550, 4),
      ('De Begraafplaats', 'de-begraafplaats', 'Een kleine historische begraafplaats verscholen in het bos.', 'Deze begraafplaats dateert uit de 18e eeuw en bevat de graven van de families die ooit het landgoed beheerden. De oudste grafsteen is uit 1743. Het is een plek van stilte en reflectie.', 51.5835, 5.0540, 5)
    ON CONFLICT (slug) DO NOTHING;
  `);
  console.log('Seeded sample locations');

  // Seed quiz questions
  const locations = await client.query(`SELECT id, slug FROM locations ORDER BY order_number`);
  if (locations.rows.length > 0) {
    const loc1 = locations.rows[0].id;
    const loc2 = locations.rows[1].id;
    await client.query(`
      INSERT INTO quiz_questions (location_id, question, options, correct_answer, difficulty)
      VALUES
        ($1, 'In welk jaar werd De Oude Eik geplant?', '["1650", "1720", "1800", "1690"]'::jsonb, 1, 'easy'),
        ($1, 'Waarvoor diende de boom tijdens de Tweede Wereldoorlog?', '["Schuilplaats", "Herkenningspunt voor het verzet", "Uitzichtpost", "Houtvoorziening"]'::jsonb, 1, 'medium'),
        ($2, 'Hoeveel paarden konden er in het koetshuis staan?', '["6", "8", "12", "20"]'::jsonb, 2, 'easy'),
        ($2, 'Wanneer brandde het koetshuis af?', '["1918", "1923", "1940", "1899"]'::jsonb, 1, 'medium')
      ON CONFLICT DO NOTHING;
    `, [loc1, loc2]);
    console.log('Seeded quiz questions');
  }

  await client.end();
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
