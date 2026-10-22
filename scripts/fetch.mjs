import fs from 'node:fs';
const feeds = JSON.parse(fs.readFileSync('feeds.json','utf8'));
const clean = s => (s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ')
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&nbsp;/g,' ')
  .replace(/\s+/g,' ').trim();
const tag = (b,t) => { const m = b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`,'i')); return m ? m[1] : ''; };
function parse(xml, f) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/(item|entry)>/gi) || [];
  return blocks.map(b => {
    let link = clean(tag(b,'link'));
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ''; }
    const d = new Date(clean(tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')||tag(b,'dc:date')));
    return { title: clean(tag(b,'title')), link, source: f.name, topic: f.topic, lang: f.lang||'en',
      date: isNaN(d) ? new Date().toISOString() : d.toISOString(),
      snippet: clean(tag(b,'description')||tag(b,'summary')).slice(0,300) };
  }).filter(i => i.title && i.link);
}
const old = JSON.parse(fs.readFileSync('data/news.json','utf8')).items || [];
let all = [...old];
await Promise.all(feeds.map(async f => {
  try {
    const r = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0 NewsPortalBot' }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(r.status);
    all.push(...parse(await r.text(), f));
  } catch (e) { console.log('skip', f.name, e.message); }
}));
const seen = new Set(), cutoff = Date.now() - 48*3600*1000;
const items = all.filter(i => new Date(i.date) > cutoff && !seen.has(i.link) && seen.add(i.link))
  .sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,400);
fs.writeFileSync('data/news.json', JSON.stringify({ updated: new Date().toISOString(), items }));
console.log('saved', items.length);
