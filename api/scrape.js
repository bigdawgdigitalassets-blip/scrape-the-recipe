// api/scrape.js — Vercel Serverless Function
// This runs on Vercel's servers, keeping your ScraperAPI key hidden from the public.
 
export default async function handler(req, res) {
    // Allow requests from any origin (your GitHub Pages site)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
 
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
 
    const { url } = req.query;
 
    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter.' });
    }
 
    // Basic URL validation — reject anything that isn't http/https
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }
    } catch {
        return res.status(400).json({ error: 'Invalid URL provided.' });
    }
 
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
 
    if (!SCRAPER_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: API key not set.' });
    }
 
    try {
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=false`;
        const response = await fetch(scraperUrl, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml',
            }
        });
 
        if (!response.ok) {
            throw new Error(`ScraperAPI returned status ${response.status}`);
        }
 
        const html = await response.text();
 
        // Return the raw HTML — parsing happens client-side
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(html);
 
    } catch (err) {
        return res.status(502).json({ error: `Failed to fetch page: ${err.message}` });
    }
}
