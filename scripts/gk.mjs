import fs from 'node:fs';
import { ask } from './ai.mjs';
const { items } = JSON.parse(fs.readFileSync('data/news.json','utf8'));
const pool = t => items.filter(i => i.topic === t && Date.now() - new Date(i.date) < 30*3600e3).slice(0,60);
const fmt = a => a.map((i,n) => `${n+1}. ${i.title} (${i.source}) ${i.snippet||''}`).join('\n');
async function cards(topic, label) {
  const list = pool(topic);
  if (list.length < 3) return [];
  const prompt = `You prepare GK (general knowledge) quiz cards for Bangladeshi university and medical admission exams. Section: ${label}.
From the headlines below make up to 12 cards. Use ONLY facts stated in the headlines. Skip anything you cannot answer from them. Prefer exam-style facts: who, where, which, what, when, how many.
Each card: {"q": English question, "a": short exact English answer, "qBn": same question in Bangla, "aBn": same answer in Bangla, "tag": one word like Politics, Economy, Science, Sports, Awards, Appointments, Agreements, Environment, Health}.
Return ONLY a JSON array.

${fmt(list)}`;
  const t = await ask(prompt, true);
  try { const a = JSON.parse(t.replace(/```json|```/g,'').trim()); return Array.isArray(a) ? a.filter(c => c.q && c.a).slice(0,12) : []; }
  catch (e) { console.log('parse fail', label, t.slice(0,200)); return []; }
}
const db = fs.existsSync('data/gk.json') ? JSON.parse(fs.readFileSync('data/gk.json','utf8')) : { days: [] };
const today = new Date(Date.now() + 6*3600e3).toISOString().slice(0,10);
let day = db.days.find(d => d.date === today);
if (!day) { day = { date: today, intl: [], national: [] }; db.days.unshift(day); }
function add(k, fresh) {
  const seen = new Set(db.days.flatMap(d => d[k] || []).map(c => c.q.toLowerCase()));
  for (const c of fresh) if (!seen.has(c.q.toLowerCase())) { day[k].push(c); seen.add(c.q.toLowerCase()); }
}
add('intl', await cards('IntlGK', 'International affairs'));
add('national', await cards('BDGK', 'Bangladesh national affairs'));
db.days = db.days.slice(0,30);
fs.writeFileSync('data/gk.json', JSON.stringify(db));
console.log('gk saved', day.intl.length, day.national.length);
