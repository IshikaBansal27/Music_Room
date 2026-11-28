// Proxies YouTube search server-side so the API key never reaches the browser.
async function searchSongs(req, res) {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'YouTube search is not configured' });
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=8&q=${encodeURIComponent(q)}&key=${apiKey}`;
        const ytRes = await fetch(url);
        const data = await ytRes.json();

        if (data.error) {
            return res.status(502).json({ message: data.error.message || 'YouTube search failed' });
        }

        const songs = (data.items || []).map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
        }));

        res.json({ songs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { searchSongs };
