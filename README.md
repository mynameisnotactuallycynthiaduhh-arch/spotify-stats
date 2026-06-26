# Spotify Stats

Your personal Spotify dashboard — top songs, artists, albums, and listening stats. Log in with Spotify, see everything instantly.

## Deploy in 5 minutes

### 1. Create a Spotify App (free)

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in any name/description
4. Set **Redirect URI** to your deploy URL (e.g. `https://your-app.vercel.app`) — you can update this after deploy
5. Copy your **Client ID**

### 2. Deploy to Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this folder to a GitHub repo
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variable:
   - Key: `VITE_SPOTIFY_CLIENT_ID`
   - Value: your Client ID from step 1
4. Deploy — Vercel gives you a URL like `https://spotify-stats-abc.vercel.app`
5. Go back to your Spotify app settings and add that URL as a Redirect URI

### Or deploy to Netlify

1. Drag the project folder to [netlify.com/drop](https://app.netlify.com/drop) after running `npm run build` (drag the `dist/` folder)
2. Or connect your GitHub repo on [netlify.com](https://netlify.com)
3. Add environment variable: `VITE_SPOTIFY_CLIENT_ID` = your Client ID
4. Add your Netlify URL as a Redirect URI in your Spotify app settings

## Local dev

```bash
cp .env.example .env
# Edit .env and add your Client ID

npm install
npm run dev
```

Add `http://localhost:5173` as a Redirect URI in your Spotify app settings for local dev.

## What it shows

- **Minutes listened this week** (from your 50 most recent plays)
- **Estimated all-time hours** (based on your library size × average plays)
- **Saved tracks** count
- **Followed artists** count
- **Top 5 Songs** — switchable between 4 weeks / 6 months / all time
- **Top 5 Artists** — same time ranges
- **Top 5 Albums** — derived from your top tracks

> Note: Spotify's API doesn't expose an exact lifetime minutes figure — that's only in Spotify Wrapped. The all-time estimate is an approximation.
