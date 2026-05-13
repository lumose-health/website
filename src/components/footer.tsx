import { DiscordIcon, GitHubIcon, OpenCollectiveIcon } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">GlycemicGPT</h3>
            <p className="text-sm text-muted-foreground">
              Because no one should manage diabetes alone.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Project</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/GlycemicGPT/GlycemicGPT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/QbyhCQKDBs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <DiscordIcon className="h-3.5 w-3.5" />
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://opencollective.com/glycemicgpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <OpenCollectiveIcon className="h-3.5 w-3.5" />
                  Open Collective
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/GlycemicGPT/GlycemicGPT/blob/main/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Changelog
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/GlycemicGPT/GlycemicGPT/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  License (GPL-3.0)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Important</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GlycemicGPT is not a medical device. It is not FDA approved or CE
              marked. It does not deliver insulin or control any medical device.
              For informational and educational purposes only. Always consult
              your healthcare provider for medical decisions.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GlycemicGPT. Open source under GPL-3.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
