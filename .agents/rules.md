# Layucateca AI Bot Logic

**CRITICAL RULE: DO NOT MODIFY THE BOT LOGIC**

The automated AI news generation architecture in this repository is strictly locked per the project owner's request. 
Under no circumstances should any future updates, refactoring, or improvements alter the logic, implementation, or behavior of the following files/features:
- `src/app/api/bot/cron/route.ts`
- `src/app/api/bot/pull/route.ts`
- `src/components/NewsArticleClient.tsx` (Specifically the logic that handles AI articles, FB comments, and layouts)
- `src/lib/botNewsData.ts`
- Any implementation relating to the Facebook Page automatic publishing, prompt logic, timing, AI model providers, or content generation structure.

These have been perfectly fine-tuned. Any modifications to them will break the finely balanced Facebook Graph API connection, the Vercel serverless timeout limits, and the exact OpenRouter configurations.

If you are asked to "update everything", explicitly skip the bot/news logic. 
If the user asks for a feature that would require changing the bot, warn the user referencing this rule first.
