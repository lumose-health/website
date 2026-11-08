import { Reveal } from "@/components/reveal";
import { routes } from "@/lib/v2/routes";
import { ButtonLink, EXTERNAL_LINK, FOCUS_RING } from "./button";
import { CodePanel } from "./code-panel";
import type { CodeTab } from "./code-panel";

// Checked against lumose-health/lumose: cloning creates a `lumose` folder that
// holds .env.example, docker-compose.yml and k8s/overlays/prod. The Docker
// defaults run as-is on one computer. Kubernetes needs its Secret and domain
// filled in first, so the block says so before the apply.
const SETUP_GUIDE = `${routes.docs}/platform/get-started`;
const KUBERNETES_GUIDE = `${routes.docs}/platform/install/kubernetes`;
const ANDROID_RELEASES =
  "https://github.com/lumose-health/android-unofficial/releases";
const CLONE = "git clone https://github.com/lumose-health/lumose.git";

const NOTE_LINK = `rounded-lm-sm text-lm-blue-light underline underline-offset-4 hover:text-[#8CC8FF] ${FOCUS_RING}`;

const TABS: CodeTab[] = [
  {
    id: "docker",
    label: "Docker",
    lines: [CLONE, "cd lumose && cp .env.example .env", "docker compose up -d"],
    note: (
      <>
        {"The defaults are for one computer. For an always-on server, set the secrets in "}
        <code className="font-lm-mono text-[13px]">.env</code>
        {" first, as the "}
        <a href={SETUP_GUIDE} className={NOTE_LINK}>
          setup guide
        </a>
        {" shows."}
      </>
    ),
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    lines: [CLONE, "cd lumose", "kubectl apply -k k8s/overlays/prod"],
    comment: {
      before: 2,
      text: "# First fill in k8s/base/secret.yaml and your domain",
    },
    note: (
      <>
        {"The "}
        <a href={KUBERNETES_GUIDE} className={NOTE_LINK}>
          Kubernetes guide
        </a>
        {" covers secrets, your domain and HTTPS."}
      </>
    ),
  },
];

export function GetStarted() {
  return (
    <section id="start" className="border-t border-lm-line-subtle">
      <div className="mx-auto grid max-w-lm-content grid-cols-1 items-center gap-12 px-lm-gutter py-[72px] tablet:py-[96px] desktop:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] desktop:py-[112px]">
        <Reveal className="min-w-0">
          <h2 className="mb-3.5 font-lm-display text-lm-h2 text-balance">
            Up and running in minutes
          </h2>
          <p className="mb-6 text-lm-lead text-lm-ink-muted">
            Laptop, home server or a VPS. Then install the Android app to
            connect your pump.
          </p>
          <div className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap">
            <ButtonLink href={SETUP_GUIDE} className="min-h-12! px-[22px]!">
              Read the setup guide
            </ButtonLink>
            <ButtonLink
              variant="ghost"
              href={ANDROID_RELEASES}
              {...EXTERNAL_LINK}
              className="min-h-12! px-[22px]!"
            >
              Android releases
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={100} className="w-full min-w-0">
          <CodePanel tabs={TABS} label="Install method" />
        </Reveal>
      </div>
    </section>
  );
}
