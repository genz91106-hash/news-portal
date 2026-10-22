# World AI & Business News Portal (free)

## Setup (about 10 minutes)
1. Create a **public** GitHub repo and upload all these files (keep the folders and the hidden `.github` folder).
2. Get a free Gemini API key at https://aistudio.google.com/apikey
3. Repo -> Settings -> Secrets and variables -> Actions -> New secret: name `GEMINI_API_KEY`, value = your key.
4. Repo -> Settings -> Pages -> Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
5. Repo -> Actions tab -> "update" -> Run workflow (set brief to `morning` to test the AI summary).
6. Your site: https://YOUR-USERNAME.github.io/REPO-NAME/

## How it works
- Every ~15 min: fetches RSS feeds -> `data/news.json`. The page reloads it every 3 minutes.
- 6:00 AM and 10:00 PM Bangladesh time: Gemini writes the Morning / Night brief.

## Customize
- Add or remove sources in `feeds.json` (name, topic AI/Business/Tech, RSS url).
- Change brief times in `.github/workflows/update.yml` (cron is in UTC).
- If a Gemini model name stops working, set `GEMINI_MODEL` in the workflow env.
- If scheduled runs ever pause (GitHub can pause idle repos), press "Run workflow" once.

## Bangla & Bangladesh
- The page has an English / বাংলা button. Briefs are written in both languages.
- Bangladesh sources (Daily Star, TBS, Dhaka Tribune, Prothom Alo, BBC Bangla) are in the Bangladesh tab. Add `"lang":"bn"` in `feeds.json` for Bangla-language feeds.
