// Shared Gemini helper: tries several models in order, so one retired model does not break everything.
const key = process.env.GEMINI_API_KEY;
const models = [process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'].filter(Boolean);
export async function ask(prompt, json = false) {
  if (!key) { console.log('No GEMINI_API_KEY'); return ''; }
  for (const m of models) {
    try {
      const body = { contents: [{ parts: [{ text: prompt }] }] };
      if (json) body.generationConfig = { responseMimeType: 'application/json' };
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      const t = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
      if (t) { console.log('model ok:', m); return t; }
      console.log('model failed:', m, JSON.stringify(j.error || j).slice(0, 200));
    } catch (e) { console.log('model error:', m, e.message); }
  }
  return '';
}
