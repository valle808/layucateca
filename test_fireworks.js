const https = require('https');
const data = JSON.stringify({
  model: "accounts/fireworks/models/kimi-k2p6",
  messages: [{"role": "user", "content": "hi"}],
  stream: true,
  max_tokens: 10
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
  res.on('data', d => {
    body += d;
    console.log("CHUNK:", d.toString());
  });
  res.on('end', () => console.log("END STATUS:", res.statusCode));
});
req.write(data);
req.end();
