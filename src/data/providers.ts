/**
 * One sample exchange for the chat mockup. The chat sees about 6 hours of data,
 * so each one stays inside that window and describes what already happened: no
 * dosing suggestions, nothing about what comes next. Numbers match the sample
 * day in the device demos (a 245 mg/dL peak after lunch, then 210 and falling).
 */
export type SampleChat = {
  question: string;
  /** Follows "What I see in your data:". */
  seen: string;
  points: readonly string[];
  /** Follows "Worth mentioning to your endo/CDE:". */
  mention: string;
  /** For the mockup's text alternative. */
  summary: string;
};

/**
 * A local server for the OpenAI-compatible option. Each has to be one the
 * product docs name, with its mark taken unchanged from the project's own
 * brand files. The README lists where each came from.
 */
export type LocalRuntime = { name: string; logo: string };

/** In the order they're shown, wherever the local model steps through them. */
export const LOCAL_RUNTIMES: readonly LocalRuntime[] = [
  { name: "Ollama", logo: "/ai-providers/ollama.svg" },
  { name: "LM Studio", logo: "/ai-providers/lmstudio.svg" },
  { name: "llama.cpp", logo: "/ai-providers/llamacpp.svg" },
  { name: "vLLM", logo: "/ai-providers/vllm.svg" },
];

export type AiProvider = {
  id: "claude" | "openai" | "copilot" | "ollama";
  /** The name on the button and in the caption under the chat. */
  name: string;
  /**
   * Shown on the button one at a time in place of the name and logo. The name
   * stays as the start of the button's fixed accessible name.
   */
  runtimes?: readonly LocalRuntime[];
  logo: string;
  /** Where the answer comes from, as shown in the caption under the chat. */
  where: string;
  /** Provider type and model as the app stores them, for the browser demo. */
  model: string;
  chat: SampleChat;
};

export const PROVIDERS: AiProvider[] = [
  {
    id: "claude",
    name: "Claude",
    logo: "/ai-providers/claude.svg",
    where: "Your Claude subscription",
    model: "claude_subscription / claude-sonnet-4-5-20250929",
    chat: {
      question: "Why did I go high after breakfast?",
      seen: "you rose about 75 mg/dL within an hour of eating.",
      points: [
        "You were in range before breakfast, so the rise started after you ate.",
      ],
      mention: "how often this happens after breakfast.",
      summary:
        "Someone asks why they went high after breakfast. The answer describes the rise in their glucose and suggests raising it with their care team.",
    },
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "/ai-providers/openai.svg",
    where: "Your ChatGPT subscription or API key",
    model: "chatgpt_subscription / gpt-4o",
    chat: {
      question: "How much of the last 6 hours was I in range?",
      seen: "78% of your readings were in range (70-180 mg/dL).",
      points: [
        "The rest were above 180, with a peak of 245 after lunch.",
        "None were below 70.",
      ],
      mention: "the time you spent above range after lunch.",
      summary:
        "Someone asks how much of the last 6 hours they were in range. The answer gives the share of readings in range and the highest reading, and suggests raising the time above range with their care team.",
    },
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    logo: "/ai-providers/githubcopilot.svg",
    where: "Your Copilot plan",
    model: "copilot_subscription / copilot-claude-sonnet-4.5",
    chat: {
      question: "Did I come back down after lunch?",
      seen: "you're at 210 mg/dL and trending down, after a peak of 245.",
      points: [
        "That's 35 mg/dL below the peak, and still above 180, the top of your range.",
      ],
      mention: "how long you stay high after lunch.",
      summary:
        "Someone asks whether they came back down after lunch. The answer gives their current glucose and the earlier peak, and suggests raising how long the high lasted with their care team.",
    },
  },
  {
    // The app has no type per local runtime. Each one connects as an
    // OpenAI-compatible endpoint.
    id: "ollama",
    name: "Local model",
    runtimes: LOCAL_RUNTIMES,
    logo: LOCAL_RUNTIMES[0].logo,
    where: "Runs on your network",
    model: "openai_compatible / local model",
    chat: {
      question: "Give me a quick summary of my morning.",
      seen: "over the last 6 hours you ranged from 98 to 185 mg/dL, with 94% of readings in range.",
      points: [
        "Your highest reading came after breakfast.",
        "You're at 118 mg/dL and steady now.",
      ],
      mention: "the rise after breakfast.",
      summary:
        "Someone asks for a quick summary of their morning. The answer gives their glucose range and time in range for the last 6 hours, and suggests raising the rise after breakfast with their care team.",
    },
  },
];

export const PROVIDER_NOTICE_SUBJECT =
  "Claude, OpenAI, GitHub Copilot, Ollama and other product names and logos";
