export type AiProvider = {
  id: "claude" | "openai" | "copilot" | "ollama";
  name: string;
  logo: string;
  /** Where the answer comes from, as shown in the caption under the chat. */
  where: string;
  /** Provider type and model as the app stores them, for the browser demo. */
  model: string;
};

export const PROVIDERS: AiProvider[] = [
  {
    id: "claude",
    name: "Claude",
    logo: "/ai-providers/claude.svg",
    where: "Claude API",
    model: "claude_api / claude-sonnet",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "/ai-providers/openai.svg",
    where: "OpenAI API",
    model: "openai_api / gpt",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    logo: "/ai-providers/githubcopilot.svg",
    where: "Your Copilot plan",
    model: "copilot_subscription / copilot",
  },
  {
    // The app has no Ollama type. It connects as an OpenAI-compatible endpoint.
    id: "ollama",
    name: "Ollama",
    logo: "/ai-providers/ollama.svg",
    where: "On your server",
    model: "openai_compatible / local model",
  },
];

export const PROVIDER_NOTICE_SUBJECT =
  "Claude, OpenAI, GitHub Copilot and Ollama names and logos";
