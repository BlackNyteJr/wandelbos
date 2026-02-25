const pg = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new pg.Client({
  connectionString: process.env.POSTGRES_URL
});

async function run() {
  await client.connect();

  // Create storage bucket for location images
  await client.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('location-images', 'location-images', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Storage policy: anyone can view images
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Public read location images" ON storage.objects
        FOR SELECT USING (bucket_id = 'location-images');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Storage policy: authenticated users can upload
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth upload location images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'location-images' AND auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Storage policy: authenticated users can delete
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth delete location images" ON storage.objects
        FOR DELETE USING (bucket_id = 'location-images' AND auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // RLS policies for locations table - allow authenticated users to write
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth insert locations" ON public.locations
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth update locations" ON public.locations
        FOR UPDATE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth delete locations" ON public.locations
        FOR DELETE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // RLS policies for location_images table
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth insert location_images" ON public.location_images
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth update location_images" ON public.location_images
        FOR UPDATE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth delete location_images" ON public.location_images
        FOR DELETE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // RLS policies for quiz_questions table
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth insert quiz_questions" ON public.quiz_questions
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth update quiz_questions" ON public.quiz_questions
        FOR UPDATE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Auth delete quiz_questions" ON public.quiz_questions
        FOR DELETE USING (auth.role() = 'authenticated');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // RLS for quiz_scores - anyone can insert (anonymous quiz takers)
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Anyone insert quiz_scores" ON public.quiz_scores
        FOR INSERT WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await client.end();
  console.log('Storage bucket and RLS policies created successfully!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
