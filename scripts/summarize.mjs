import fs from 'node:fs';
const kind = process.argv[2] === 'night' ? 'night' : 'morning';
const key = process.env.GEMINI_API_KEY;
if (!key) { console.log('No GEMINI_API_KEY'); process.exit(1); }
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const { items } = JSON.parse(fs.readFileSync('data/news.json','utf8'));
const recent = items.filter(i => Date.now() - new Date(i.date) < 14*3600*1000).slice(0,100);
const list = recent.map((i,n) => `${n+1}. [${i.topic}] ${i.title} (${i.source}) - ${i.snippet}`).join('\n');
async function gen(lang) {
  const prompt = `You are a news editor. Write a detailed ${kind === 'morning' ? 'MORNING' : 'NIGHT'} brief in ${lang} for a reader in Bangladesh following AI, business, tech and Bangladesh news.
Use ONLY the headlines below. Do not invent facts. Mention the source name in brackets for each point.
Format: "## Top stories" (5-7 bullets, 2-3 sentences each), then sections "## AI", "## Business", "## Tech", "## Bangladesh", then "## What to watch". Use "- " for bullets. Write the headings in ${lang} too, but keep the "## " marks.

${list}`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
  const j = await r.json();
  const t = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('');
  if (!t) console.log(lang, JSON.stringify(j).slice(0,400));
  return t || '';
}
const text = await gen('English'), text_bn = await gen('Bangla (বাংলা)');
if (!text && !text_bn) process.exit(1);
fs.writeFileSync(`data/brief-${kind}.json`, JSON.stringify({ text, text_bn, generated: new Date().toISOString() }));
console.log('brief saved', kind);
