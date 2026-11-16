import { LOCAL_RUNTIMES } from "./providers";
import type { LocalRuntime } from "./providers";

// The tiles in the home page diagram.

export type BeamMark = {
  name: string;
  /** Shown when `flags.logosCleared` is off. */
  initials: string;
  logo: string;
  /** Logos the tile steps through in place of `logo`, starting with it. */
  runtimes?: readonly LocalRuntime[];
};

export const BEAM_DEVICES: BeamMark[] = [
  { name: "Dexcom", initials: "D", logo: "/vendors/dexcom.png" },
  { name: "Tandem", initials: "T", logo: "/vendors/tandem.png" },
  { name: "Medtronic", initials: "M", logo: "/vendors/medtronic.jpg" },
  { name: "Glooko", initials: "G", logo: "/vendors/glooko.png" },
  { name: "Nightscout", initials: "N", logo: "/vendors/nightscout.png" },
];

// Two letters, since one would read C, O, C, O.
export const BEAM_PROVIDERS: BeamMark[] = [
  { name: "Claude", initials: "Cl", logo: "/ai-providers/claude.svg" },
  { name: "OpenAI", initials: "Op", logo: "/ai-providers/openai.svg" },
  { name: "Copilot", initials: "Co", logo: "/ai-providers/githubcopilot.svg" },
  {
    name: "Ollama",
    initials: "Ol",
    logo: LOCAL_RUNTIMES[0].logo,
    runtimes: LOCAL_RUNTIMES,
  },
];
