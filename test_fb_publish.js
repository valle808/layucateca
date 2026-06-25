require('dotenv').config({ path: '.env.vercel.test' });

async function testFacebookPublish() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const articleUrl = "https://layucateca.com/news/test-article";
  const imageUrl = "https://image.pollinations.ai/prompt/test?width=1024&height=640&seed=123&nologo=true";
  const fbMessage = "📰 Test Article\n\nThis is a test body.\n\n🔗 Leer artículo completo → " + articleUrl;

  console.log("Page ID:", pageId ? "Set" : "Missing");
  console.log("Token:", token ? "Set" : "Missing");

  try {
    const photoRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl, caption: fbMessage, access_token: token }),
    });
    const photoData = await photoRes.json();
    console.log("Photo Response:", photoData);
    
    if (!photoData.id && !photoData.post_id) {
       console.log("Falling back to feed post...");
       const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: fbMessage, link: articleUrl, access_token: token }),
        });
        const feedData = await feedRes.json();
        console.log("Feed Response:", feedData);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testFacebookPublish();
