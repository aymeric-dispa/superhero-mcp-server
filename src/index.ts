import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

interface Env {
  SUPERHERO_API_TOKEN?: string;
}

interface Powerstats {
  intelligence: string;
  strength: string;
  speed: string;
  durability: string;
  power: string;
  combat: string;
}

interface Hero {
  id: string;
  name: string;
  powerstats: Powerstats;
  biography: {
    "full-name": string;
    "alter-egos": string;
    aliases: string[];
    "place-of-birth": string;
    "first-appearance": string;
    publisher: string;
    alignment: string;
  };
  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    "eye-color": string;
    "hair-color": string;
  };
  work: {
    occupation: string;
    base: string;
  };
  connections: {
    "group-affiliation": string;
    relatives: string;
  };
  image: {
    url: string;
  };
}

interface SearchResult {
  response: string;
  results: Hero[];
}

const API_BASE_URL = "https://superheroapi.com/api";

const MOCK_HEROES: Record<string, Hero> = {
  "70": {
    id: "70",
    name: "Batman",
    powerstats: {
      intelligence: "100",
      strength: "26",
      speed: "27",
      durability: "50",
      power: "47",
      combat: "100",
    },
    biography: {
      "full-name": "Bruce Wayne",
      "alter-egos": "No alter egos found.",
      aliases: ["Insider", "Matches Malone"],
      "place-of-birth": "Gotham City, New York",
      "first-appearance": "Detective Comics #27",
      publisher: "DC Comics",
      alignment: "good",
    },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["6'2", "188 cm"],
      weight: ["210 lb", "95 kg"],
      "eye-color": "blue",
      "hair-color": "black",
    },
    work: {
      occupation: "Businessman",
      base: "Batcave, Stately Wayne Manor, Gotham City",
    },
    connections: {
      "group-affiliation": "Batman Family, Justice League",
      relatives: "Damian Wayne (son), Dick Grayson (adopted son)",
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg",
    },
  },
  "644": {
    id: "644",
    name: "Superman",
    powerstats: {
      intelligence: "94",
      strength: "100",
      speed: "100",
      durability: "100",
      power: "100",
      combat: "85",
    },
    biography: {
      "full-name": "Clark Kent",
      "alter-egos": "Superman Prime One-Million",
      aliases: ["Clark Joseph Kent", "The Man of Steel"],
      "place-of-birth": "Krypton",
      "first-appearance": "Action Comics #1",
      publisher: "DC Comics",
      alignment: "good",
    },
    appearance: {
      gender: "Male",
      race: "Kryptonian",
      height: ["6'3", "191 cm"],
      weight: ["225 lb", "101 kg"],
      "eye-color": "blue",
      "hair-color": "black",
    },
    work: {
      occupation: "Reporter",
      base: "Metropolis",
    },
    connections: {
      "group-affiliation": "Justice League",
      relatives: "Lois Lane (wife), Jonathan Kent (adopted father)",
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/791.jpg",
    },
  },
  "149": {
    id: "149",
    name: "Captain America",
    powerstats: {
      intelligence: "69",
      strength: "19",
      speed: "38",
      durability: "55",
      power: "60",
      combat: "100",
    },
    biography: {
      "full-name": "Steve Rogers",
      "alter-egos": "No alter egos found.",
      aliases: ["Nomad", "The Captain"],
      "place-of-birth": "Manhattan, New York City, New York",
      "first-appearance": "Captain America Comics #1",
      publisher: "Marvel Comics",
      alignment: "good",
    },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["6'2", "188 cm"],
      weight: ["220 lb", "99 kg"],
      "eye-color": "blue",
      "hair-color": "blond",
    },
    work: {
      occupation: "Adventurer",
      base: "New York City",
    },
    connections: {
      "group-affiliation": "Avengers",
      relatives: "Joseph Rogers (father, deceased)",
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/274.jpg",
    },
  },
  "346": {
    id: "346",
    name: "Iron Man",
    powerstats: {
      intelligence: "100",
      strength: "85",
      speed: "58",
      durability: "85",
      power: "100",
      combat: "64",
    },
    biography: {
      "full-name": "Tony Stark",
      "alter-egos": "No alter egos found.",
      aliases: ["Iron Knight", "Hogan Potts"],
      "place-of-birth": "Long Island, New York",
      "first-appearance": "Tales of Suspence #39",
      publisher: "Marvel Comics",
      alignment: "good",
    },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["6'1", "185 cm"],
      weight: ["225 lb", "102 kg"],
      "eye-color": "blue",
      "hair-color": "black",
    },
    work: {
      occupation: "Inventor",
      base: "Stark Tower, New York",
    },
    connections: {
      "group-affiliation": "Avengers",
      relatives: "Howard Stark (father, deceased)",
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/85.jpg",
    },
  },
};

class SuperHeroApiClient {
  private baseUrl: string;
  private useMockData: boolean;

  constructor(token: string) {
    this.baseUrl = `${API_BASE_URL}/${token}`;
    this.useMockData = !token || token === "your-token-here";
  }

  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    if (this.useMockData) {
      throw new Error("MOCK_MODE");
    }

    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async searchHeroes(name: string): Promise<Hero[]> {
    try {
      const result = await this.fetchFromApi<SearchResult>(`search/${name}`);
      if (result.response === "error") {
        return [];
      }
      return result.results || [];
    } catch (error) {
      if ((error as Error).message === "MOCK_MODE") {
        const searchTerm = name.toLowerCase();
        return Object.values(MOCK_HEROES).filter((hero) =>
          hero.name.toLowerCase().includes(searchTerm)
        );
      }
      throw error;
    }
  }

  async getHero(id: string): Promise<Hero | null> {
    try {
      const result = await this.fetchFromApi<Hero>(id);
      if ("response" in result && (result as any).response === "error") {
        return null;
      }
      return result;
    } catch (error) {
      if ((error as Error).message === "MOCK_MODE") {
        return MOCK_HEROES[id] || null;
      }
      throw error;
    }
  }

  async getRandomHero(): Promise<Hero> {
    try {
      const randomId = Math.floor(Math.random() * 731) + 1;
      const hero = await this.getHero(randomId.toString());
      if (hero) return hero;
      for (let i = 0; i < 5; i++) {
        const id = Math.floor(Math.random() * 731) + 1;
        const h = await this.getHero(id.toString());
        if (h) return h;
      }
      throw new Error("Could not find a random hero");
    } catch (error) {
      if ((error as Error).message === "MOCK_MODE") {
        const ids = Object.keys(MOCK_HEROES);
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        return MOCK_HEROES[randomId];
      }
      throw error;
    }
  }
}

function formatHero(hero: Hero): string {
  return `
# ${hero.name} (ID: ${hero.id})

## Powerstats
| Stat | Value |
|------|-------|
| Intelligence | ${hero.powerstats.intelligence}/100 |
| Strength | ${hero.powerstats.strength}/100 |
| Speed | ${hero.powerstats.speed}/100 |
| Durability | ${hero.powerstats.durability}/100 |
| Power | ${hero.powerstats.power}/100 |
| Combat | ${hero.powerstats.combat}/100 |

## Biography
- **Full Name:** ${hero.biography["full-name"]}
- **Alter Egos:** ${hero.biography["alter-egos"]}
- **Aliases:** ${hero.biography.aliases.join(", ")}
- **Place of Birth:** ${hero.biography["place-of-birth"]}
- **First Appearance:** ${hero.biography["first-appearance"]}
- **Publisher:** ${hero.biography.publisher}
- **Alignment:** ${hero.biography.alignment}

## Appearance
- **Gender:** ${hero.appearance.gender}
- **Race:** ${hero.appearance.race}
- **Height:** ${hero.appearance.height.join(" / ")}
- **Weight:** ${hero.appearance.weight.join(" / ")}
- **Eye Color:** ${hero.appearance["eye-color"]}
- **Hair Color:** ${hero.appearance["hair-color"]}

## Work
- **Occupation:** ${hero.work.occupation}
- **Base:** ${hero.work.base}

## Connections
- **Group Affiliation:** ${hero.connections["group-affiliation"]}
- **Relatives:** ${hero.connections.relatives}

![${hero.name}](${hero.image.url})
`.trim();
}

function formatHeroList(heroes: Hero[]): string {
  if (heroes.length === 0) {
    return "No heroes found.";
  }

  return heroes
    .map(
      (hero) =>
        `- **${hero.name}** (ID: ${hero.id}) - ${hero.biography.publisher}`
    )
    .join("\n");
}

function compareHeroes(hero1: Hero, hero2: Hero): string {
  const stats: (keyof Powerstats)[] = [
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
  ];

  let hero1Wins = 0;
  let hero2Wins = 0;

  let table = `| Stat | ${hero1.name} | ${hero2.name} | Winner |\n`;
  table += `|------|${"-".repeat(hero1.name.length + 2)}|${"-".repeat(
    hero2.name.length + 2
  )}|--------|\n`;

  for (const stat of stats) {
    const val1 = parseInt(hero1.powerstats[stat]) || 0;
    const val2 = parseInt(hero2.powerstats[stat]) || 0;
    let winner: string;

    if (val1 > val2) {
      winner = hero1.name;
      hero1Wins++;
    } else if (val2 > val1) {
      winner = hero2.name;
      hero2Wins++;
    } else {
      winner = "Tie";
    }

    table += `| ${stat.charAt(0).toUpperCase() + stat.slice(1)} | ${val1} | ${val2} | ${winner} |\n`;
  }

  const overallWinner =
    hero1Wins > hero2Wins
      ? hero1.name
      : hero2Wins > hero1Wins
        ? hero2.name
        : "It's a tie!";

  return `
# ${hero1.name} vs ${hero2.name}

${table}
## Overall Winner: ${overallWinner}
- ${hero1.name}: ${hero1Wins} stats won
- ${hero2.name}: ${hero2Wins} stats won
`.trim();
}

function createServer(apiToken: string) {
  const apiClient = new SuperHeroApiClient(apiToken);
  const server = new McpServer({
    name: "superhero-mcp-server",
    version: "1.0.0",
  });

  server.registerTool(
    "search_heroes",
    {
      description: "Search for superheroes by name. Returns a list of matching heroes with their IDs and publishers.",
      inputSchema: {
        name: z.string().describe("The hero name to search for (e.g., 'batman', 'spider')"),
      },
    },
    async ({ name }) => {
      const heroes = await apiClient.searchHeroes(name);
      return {
        content: [
          {
            type: "text",
            text:
              heroes.length > 0
                ? `Found ${heroes.length} hero(es) matching "${name}":\n\n${formatHeroList(heroes)}`
                : `No heroes found matching "${name}".`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_hero",
    {
      description: "Get detailed information about a specific superhero by their ID.",
      inputSchema: {
        id: z.string().describe("The hero ID (e.g., '70' for Batman, '644' for Superman)"),
      },
    },
    async ({ id }) => {
      const hero = await apiClient.getHero(id);
      if (!hero) {
        return {
          content: [
            {
              type: "text",
              text: `Hero with ID "${id}" not found.`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: formatHero(hero),
          },
        ],
      };
    }
  );

  server.registerTool(
    "compare_heroes",
    {
      description: "Compare the powerstats of two heroes to see who is stronger in each category.",
      inputSchema: {
        hero1_id: z.string().describe("The ID of the first hero"),
        hero2_id: z.string().describe("The ID of the second hero"),
      },
    },
    async ({ hero1_id, hero2_id }) => {
      const [hero1, hero2] = await Promise.all([
        apiClient.getHero(hero1_id),
        apiClient.getHero(hero2_id),
      ]);

      if (!hero1) {
        return {
          content: [
            {
              type: "text",
              text: `Hero with ID "${hero1_id}" not found.`,
            },
          ],
          isError: true,
        };
      }

      if (!hero2) {
        return {
          content: [
            {
              type: "text",
              text: `Hero with ID "${hero2_id}" not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: compareHeroes(hero1, hero2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_random_hero",
    {
      description: "Get a random superhero's complete details.",
      inputSchema: {},
    },
    async () => {
      const hero = await apiClient.getRandomHero();
      return {
        content: [
          {
            type: "text",
            text: formatHero(hero),
          },
        ],
      };
    }
  );

  return server;
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    const server = createServer(env.SUPERHERO_API_TOKEN || "");
    return createMcpHandler(server)(request, env, ctx);
  },
};
