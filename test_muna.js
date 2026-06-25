require('dotenv').config({ path: '.env.vercel.test' });
const { OpenAI } = require('openai');

async function testOpenAI() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("Key:", apiKey ? "Loaded" : "Missing");
  
  const openai = new OpenAI({ 
    apiKey, 
    baseURL: 'https://openrouter.ai/api/v1' 
  });

  try {
    const stream = await openai.chat.completions.create({
      model: 'google/gemma-4-31b-it:free',
      messages: [{ role: 'user', content: 'hola' }],
      stream: true,
      max_tokens: 10,
    });

    for await (const chunk of stream) {
      console.log(chunk.choices[0]?.delta?.content || '');
    }
  } catch (err) {
    console.error("OpenAI Error:", err);
  }
}

testOpenAI();
