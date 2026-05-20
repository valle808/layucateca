const https = require('https');

const data = JSON.stringify({
  prompt: "A realistic premium photo of Yucatan regional architecture under a bright blue sky, detailed.",
  cfg_scale: 7,
  height: 768,
  width: 1024,
  steps: 4
});

const options = {
  hostname: 'api.fireworks.ai',
  path: '/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fw_CETRcaBeje2h4VdUYTj9Z',
    'Accept': 'image/jpeg'
  }
};

const req = https.request(options, res => {
  console.log("STATUS:", res.statusCode);
  console.log("HEADERS:", res.headers);
  
  let chunks = [];
  res.on('data', d => {
    chunks.push(d);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log("RECEIVED BYTES:", buffer.length);
    if (res.statusCode === 200) {
      console.log("SUCCESS! Base64 length:", buffer.toString('base64').length);
    } else {
      console.log("ERROR OUTPUT:", buffer.toString());
    }
  });
});

req.on('error', e => console.error("REQUEST ERROR:", e));
req.write(data);
req.end();
