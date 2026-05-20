const OpenAI = require("openai");

async function generateAINews() {
  const apiKey = "fw_CETRcaBeje2h4VdUYTj9Z";
  const openai = new OpenAI({ 
    apiKey, 
    baseURL: 'https://api.fireworks.ai/inference/v1' 
  });

  const prompt = `Create a completely novel, breaking news article about Technology.
Format your response exactly as valid JSON with the following keys:
{
  "title": "A captivating headline",
  "slug": "a-url-friendly-slug",
  "content": "The full article content in markdown format",
  "category": "Tecnología",
  "state": "Yucatán"
}`;

  const res = await openai.chat.completions.create({
    model: "accounts/fireworks/models/kimi-k2p6",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 1500
  });

  const message = res.choices[0].message;
  console.log("MESSAGE:", message);
  const rawText = message.content || message.reasoning_content || "";
  console.log("RAW TEXT:", rawText);
}
generateAINews().catch(console.error);
