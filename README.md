# SuperHero MCP Server

An AI-generated Model Context Protocol (MCP) server that connects to the [SuperHero API](https://superheroapi.com/) to provide superhero information to AI assistants.

## Features

- 🔍 **Search Heroes** - Find heroes by name
- 📊 **Get Hero Details** - Retrieve full hero profiles with powerstats
- ⚔️ **Compare Heroes** - Compare powerstats between two heroes
- 🎲 **Random Hero** - Get a random hero's details

## Tools

| Tool | Description |
|------|-------------|
| `search_heroes` | Search for heroes by name (e.g., "batman", "superman") |
| `get_hero` | Get detailed information about a hero by ID |
| `compare_heroes` | Compare powerstats between two heroes |
| `get_random_hero` | Get a random superhero's details |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a SuperHero API Token

1. Go to [superheroapi.com](https://superheroapi.com/)
2. Sign in with Facebook to get your free access token
3. Set it as an environment variable:

```bash
export SUPERHERO_API_TOKEN="your-token-here"
```

Or create a `.env` file (see `.env.example`)

### 3. Build the server

```bash
npm run build
```

### 4. Configure with your MCP client

Add to your MCP client config (e.g., Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "superhero": {
      "command": "node",
      "args": ["/path/to/superhero-mcp-server/dist/index.js"],
      "env": {
        "SUPERHERO_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Development

```bash
# Watch mode
npm run dev

# Run with MCP Inspector for testing
npm run inspector
```

## API Response Format

Example hero data:
```json
{
  "id": "70",
  "name": "Batman",
  "powerstats": {
    "intelligence": "100",
    "strength": "26",
    "speed": "27",
    "durability": "50",
    "power": "47",
    "combat": "100"
  },
  "biography": {
    "full-name": "Bruce Wayne",
    "alter-egos": "No alter egos found.",
    "aliases": ["Insider", "Matches Malone"],
    "place-of-birth": "Gotham City, New York",
    "first-appearance": "Detective Comics #27",
    "publisher": "DC Comics",
    "alignment": "good"
  },
  "appearance": {
    "gender": "Male",
    "race": "Human",
    "height": ["6'2", "188 cm"],
    "weight": ["210 lb", "95 kg"],
    "eye-color": "blue",
    "hair-color": "black"
  },
  "work": {
    "occupation": "Businessman",
    "base": "Batcave, Stately Wayne Manor, Gotham City"
  },
  "connections": {
    "group-affiliation": "Batman Family",
    "relatives": "Damian Wayne (son)"
  },
  "image": {
    "url": "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg"
  }
}
```

## License

MIT
