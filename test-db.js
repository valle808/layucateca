const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('Post').select('id, title, category, imageUrl, content, published, createdAt').order('createdAt', { ascending: false }).limit(5);
  if (data && data.length > 0) {
    console.log("Latest Post title:", data[0].title);
    console.log("Latest Post image:", data[0].imageUrl);
    console.log("Latest Post content length (chars):", data[0].content.length);
  }
  console.log("Error:", error);
}

run();
