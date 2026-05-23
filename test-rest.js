const url = "https://dnomwkheggsvcvauvwik.supabase.co/rest/v1/Post?select=id,title&limit=1";
const anonKey = "sb_publishable_5C47x1Gkjht8lRciID4zRQ_hIDQdIBA";

fetch(url, {
  headers: {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`
  }
}).then(r => r.json()).then(data => {
  console.log("REST API data:", data);
}).catch(e => {
  console.log("REST API error:", e.message);
});
