const pg = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });

async function seed() {
  await client.connect();

  // Insert sample locations for Wandelbos Tilburg
  await client.query(`
    INSERT INTO locations (name, slug, description, historical_info, latitude, longitude, order_number, panorama_url)
    VALUES 
      ('De Oude Eik', 'de-oude-eik', 
       'Een monumentale eik die al meer dan 300 jaar in het Wandelbos staat.',
       'Deze imposante eik werd rond 1700 geplant als onderdeel van het landgoed dat later het Wandelbos zou worden. In de 19e eeuw diende de boom als grensmarkering tussen twee landgoederen. Tijdens de Tweede Wereldoorlog werd de omgeving van de eik gebruikt als schuilplaats door lokale bewoners. De boom heeft een omtrek van meer dan 5 meter en is daarmee een van de dikste bomen in de regio. In 1982 werd de eik officieel erkend als monumentale boom door de gemeente.',
       51.5521, 5.0716, 1, NULL),
      ('Het Koetshuis', 'het-koetshuis',
       'Voormalig koetshuis van het landgoed, nu een bezoekerscentrum.',
       'Het koetshuis werd in 1856 gebouwd door baron Van der Borch als onderdeel van zijn landgoed. Het gebouw diende oorspronkelijk als stalling voor paarden en koetsen. Na de Eerste Wereldoorlog werd het omgebouwd tot woning voor de tuinman. In de jaren 1960 raakte het in verval tot het in 1989 gerestaureerd werd. Tegenwoordig huisvest het een klein museum over de geschiedenis van het Wandelbos en de omliggende landgoederen.',
       51.5535, 5.0698, 2, NULL),
      ('De Wildernis', 'de-wildernis',
       'Een stuk ongerept bos waar de natuur al eeuwen haar gang gaat.',
       'Dit deel van het Wandelbos is nooit gekapt of beplant en vormt daarmee een uniek stukje oorspronkelijk Brabants bos. Archeologische vondsten wijzen uit dat hier al in de Middeleeuwen geleefd werd. Er zijn restanten gevonden van een klein klooster uit de 14e eeuw. De rijke biodiversiteit omvat zeldzame paddenstoelen, mossen en varens. In het voorjaar bloeit hier de bosanemoon in grote aantallen.',
       51.5548, 5.0742, 3, NULL),
      ('De Vijver', 'de-vijver',
       'Een historische vijver aangelegd in de 18e eeuw als siervijver.',
       'De vijver werd in 1780 aangelegd in opdracht van de toenmalige eigenaar van het landgoed als onderdeel van een Engelse landschapstuin. Het water werd via een ingenieus kanalensysteem vanuit de Leij naar de vijver geleid. In de 19e eeuw werden er karpers en forellen in uitgezet voor de visserij. Rond de vijver stonden oorspronkelijk klassieke beelden, waarvan er enkele bewaard zijn gebleven in het gemeentelijk museum. De vijver is nog steeds een belangrijk broed- en rustgebied voor watervogels.',
       51.5510, 5.0755, 4, NULL),
      ('Het Kruispunt', 'het-kruispunt',
       'Historisch kruispunt waar oude handelsroutes samenkwamen.',
       'Op deze plek kruisten twee belangrijke middeleeuwse handelsroutes: de route van Tilburg naar s-Hertogenbosch en de route van Breda naar Eindhoven. Hier stond vanaf 1650 een herberg waar reizigers konden rusten. De fundamenten van deze herberg zijn nog zichtbaar in het terrein. Tijdens opgravingen in 2003 werden munten, aardewerk en persoonlijke bezittingen van reizigers gevonden. Een informatiebord ter plekke toont een reconstructie van hoe de herberg er waarschijnlijk uitzag.',
       51.5530, 5.0770, 5, NULL)
    ON CONFLICT (slug) DO NOTHING;
  `);

  // Get location IDs
  const { rows: locs } = await client.query(
    'SELECT id, slug FROM locations ORDER BY order_number'
  );

  if (locs.length > 0) {
    // Insert quiz questions
    for (const loc of locs) {
      const questions = getQuestionsForLocation(loc.slug);
      for (const q of questions) {
        await client.query(
          `INSERT INTO quiz_questions (location_id, question, options, correct_answer, difficulty)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [loc.id, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty]
        );
      }
    }
  }

  console.log('Seed data inserted successfully!');
  await client.end();
}

function getQuestionsForLocation(slug) {
  const allQuestions = {
    'de-oude-eik': [
      { question: 'Hoe oud is de Oude Eik ongeveer?', options: ['100 jaar', '200 jaar', '300 jaar', '500 jaar'], correct_answer: 2, difficulty: 'easy' },
      { question: 'Waarvoor werd de eik in de 19e eeuw gebruikt?', options: ['Houtwinning', 'Grensmarkering', 'Schuilplaats', 'Oriëntatiepunt'], correct_answer: 1, difficulty: 'medium' },
      { question: 'In welk jaar werd de eik erkend als monumentale boom?', options: ['1975', '1982', '1990', '2000'], correct_answer: 1, difficulty: 'hard' },
    ],
    'het-koetshuis': [
      { question: 'Wat was het koetshuis vroeger?', options: ['Een school', 'Een stalling voor paarden', 'Een bakkerij', 'Een kerk'], correct_answer: 1, difficulty: 'easy' },
      { question: 'Wie liet het koetshuis bouwen?', options: ['Koning Willem', 'Baron Van der Borch', 'De gemeente', 'Napoleon'], correct_answer: 1, difficulty: 'medium' },
      { question: 'In welk jaar werd het koetshuis gerestaureerd?', options: ['1979', '1985', '1989', '1995'], correct_answer: 2, difficulty: 'hard' },
    ],
    'de-wildernis': [
      { question: 'Wat maakt De Wildernis bijzonder?', options: ['Het is het hoogste punt', 'Het is nooit gekapt', 'Er staat een kasteel', 'Er is een speeltuin'], correct_answer: 1, difficulty: 'easy' },
      { question: 'Welke bloem bloeit hier in grote aantallen in het voorjaar?', options: ['Tulp', 'Bosanemoon', 'Narcis', 'Klaproos'], correct_answer: 1, difficulty: 'medium' },
      { question: 'Uit welke eeuw stammen de kloosterrestanten?', options: ['12e eeuw', '13e eeuw', '14e eeuw', '15e eeuw'], correct_answer: 2, difficulty: 'hard' },
    ],
    'de-vijver': [
      { question: 'Waarvoor werd de vijver aangelegd?', options: ['Om te zwemmen', 'Als siervijver', 'Voor drinkwater', 'Voor de landbouw'], correct_answer: 1, difficulty: 'easy' },
      { question: 'Welke vissen werden in de vijver uitgezet?', options: ['Zalm en forel', 'Karper en forel', 'Snoek en baars', 'Paling en karper'], correct_answer: 1, difficulty: 'medium' },
      { question: 'In welk jaar werd de vijver aangelegd?', options: ['1720', '1750', '1780', '1810'], correct_answer: 2, difficulty: 'hard' },
    ],
    'het-kruispunt': [
      { question: 'Wat stond er vroeger op Het Kruispunt?', options: ['Een molen', 'Een herberg', 'Een brug', 'Een markt'], correct_answer: 1, difficulty: 'easy' },
      { question: 'Welke twee steden verbond een van de handelsroutes?', options: ['Amsterdam en Rotterdam', 'Tilburg en s-Hertogenbosch', 'Utrecht en Breda', 'Maastricht en Eindhoven'], correct_answer: 1, difficulty: 'medium' },
      { question: 'In welk jaar vonden er opgravingen plaats?', options: ['1998', '2001', '2003', '2007'], correct_answer: 2, difficulty: 'hard' },
    ],
  };
  return allQuestions[slug] || [];
}

seed().catch(console.error);
