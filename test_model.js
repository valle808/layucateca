const https = require('https');
const data = JSON.stringify({
  model: "accounts/fireworks/models/kimi-k2p6",
  messages: [{"role": "user", "content": "Escribe un saludo corto de 1 párrafo en español sobre la yucateca."}],
  max_tokens: 100
});
const options = {
  hostname: 'api.fireworks.ai',
  path: '/inference/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fw_CETRcaBeje2h4VdUYTj9Z'
  }
};
const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log("RESPONSE:", parsed.choices[0].message.content);
    } catch (e) {
      console.log("RAW BODY:", body);
    }
  });
});
req.on('error', e => console.error("ERROR:", e));
req.write(data);
req.end();
