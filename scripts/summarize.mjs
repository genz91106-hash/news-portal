import fs from 'node:fs';
const kind = process.argv[2] === 'night' ? 'night' : 'morning';
import { ask } from './ai.mjs';
const { items } = JSON.parse(fs.readFileSync('data/news.json','utf8'));
const recent = items.filter(i => Date.now() - new Date(i.date) < 14*3600*1000).slice(0,130);
const list = recent.map((i,n) => `${n+1}. [${i.topic}] ${i.title} (${i.source}) - ${i.snippet}`).join('\n');
async function gen(lang) {
  const prompt = `You are a news editor. Write a detailed ${kind === 'morning' ? 'MORNING' : 'NIGHT'} brief in ${lang} for a reader in Bangladesh following AI, business, tech, Bangladesh, education/admission and worldwide scholarship news.
Use ONLY the headlines below. Do not invent facts. Mention the source name in brackets for each point.
Format: "## Top stories" (5-7 bullets, 2-3 sentences each), then sections "## AI", "## Business", "## Tech", "## Bangladesh", "## Education & Admission", "## Scholarships", then "## What to watch". Use "- " for bullets. Write the headings in ${lang} too, but keep the "## " marks.

${list}`;
  const t = await ask(prompt);
  return t || '';
}
const text = await gen('English'), text_bn = await gen('Bangla (বাংলা)');
if (!text && !text_bn) process.exit(1);
fs.writeFileSync(`data/brief-${kind}.json`, JSON.stringify({ text, text_bn, generated: new Date().toISOString() }));
console.log('brief saved', kind);
