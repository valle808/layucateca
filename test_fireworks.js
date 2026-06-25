require('dotenv').config({ path: '.env.vercel.test' });
async function getFireworksModels() {
  try {
    const res = await fetch('https://api.fireworks.ai/inference/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}` }
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
getFireworksModels();
