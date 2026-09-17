# GameScope - Live Game Database Integration

## API Setup Instructions

GameScope now integrates with the RAWG Video Games Database API to provide live search and game details.

### Getting Your API Key

1. Visit [RAWG API Documentation](https://rawg.io/apidocs)
2. Sign up for a free account
3. Generate your API key from your dashboard

### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```
   VITE_RAWG_API_KEY=your_actual_api_key_here
   ```

3. **NEVER commit `.env` to version control** - it's already in `.gitignore`

### Features

#### Live Search
- Search for ANY game in the RAWG database
- Results appear after typing 2+ characters
- 500ms debounce to prevent excessive API calls
- Displays games with cover art, rating, genre, and platforms

#### Game Details
- Games from local dataset load instantly
- Games not in local dataset are fetched from API
- Seamless experience - users don't need to know the source

#### Hybrid Approach
- **Featured/Trending:** Uses local dataset for fast loading
- **Search:** Uses live API for comprehensive results
- **Game Details:** Checks local first, falls back to API

### Testing

Search for these games to verify API integration:
- GTA V
- Minecraft
- Elden Ring
- Cyberpunk 2077
- eFootball
- EA SPORTS FC 26
- Black Myth: Wukong

These games may not be in the local dataset but should appear from the API.

### API Rate Limits

The RAWG API free tier has rate limits. The app handles:
- Rate limit errors with user-friendly messages
- Network failures gracefully
- Missing API key warnings

### Error Handling

The app shows appropriate messages for:
- Missing API key
- Network failures
- Rate limit exceeded
- Game not found
- No search results

### Architecture

```
src/
├── services/
│   └── gameService.js       # API service layer
├── pages/
│   ├── Browse.jsx            # Live search integration
│   └── GameDetail.jsx        # API + local data
└── data/
    └── games.js              # Local dataset (featured games)
```

### Notes

- System requirements from API games are not available (API limitation)
- Pricing information is not available from API
- Local games still have full data including requirements
- API responses are normalized to match local game format
