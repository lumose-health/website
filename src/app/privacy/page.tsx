import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy - GlycemicGPT",
  description:
    "How GlycemicGPT handles your data. A privacy-first, self-hosted platform that does not phone home or collect telemetry from the builds it distributes.",
  openGraph: {
    title: "Privacy Policy - GlycemicGPT",
    description:
      "A privacy-first, self-hosted platform that does not phone home or collect telemetry.",
    url: "https://glycemicgpt.org/privacy",
    siteName: "GlycemicGPT",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 27, 2026"
      intro="GlycemicGPT is a privacy-first, open-source project. This page explains what happens to your data on this website and in the self-hosted platform."
    >
      <h2>This website</h2>
      <p>
        The GlycemicGPT website (<code>glycemicgpt.org</code>) is a static,
        open-source site. It sets no advertising or tracking cookies, runs no
        third-party analytics, and does not build a profile of visitors. We do
        not sell, rent, or share visitor information, because we do not collect
        it. See our{" "}
        <Link href="/accessibility">Accessibility Statement</Link> for related
        commitments.
      </p>
      <p>
        The site is served as static files. The hosting provider may keep
        standard, short-lived server access logs (such as IP address and
        requested URL) for security and abuse prevention, as is typical for any
        website. We do not use those logs to track or identify individual
        visitors.
      </p>

      <h2>In production: nothing is centralized</h2>
      <p>
        GlycemicGPT is self-hosted software. Your data &mdash; glucose readings,
        insulin and pump data, AI chat, settings, and credentials &mdash; lives
        entirely in the database on infrastructure <strong>you</strong>{" "}control.
        The platform does not phone home, collect telemetry, or transmit your
        data to the project or any third party.
      </p>
      <p>
        The only outbound calls a running platform makes are the ones you
        configure: your AI provider, your Dexcom or Tandem cloud account, your
        Telegram bot, and your reverse proxy. Whether your health data leaves
        your own infrastructure is determined by those choices, not by the
        platform itself. See the{" "}
        <Link href="/disclaimer">Medical Disclaimer</Link> for how this applies to
        third-party AI providers.
      </p>

      <h2>Error monitoring: the project&rsquo;s own development only</h2>
      <p>
        The project uses{" "}
        <a
          href="https://sentry.io/for/good/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sentry (donated through Sentry for Good)
        </a>{" "}
        for error monitoring in <strong>its own</strong>{" "}development, CI, and
        staging environments &mdash; to catch crashes before they reach a
        release.
      </p>
      <p>
        No build the project distributes phones home. The Sentry connection
        string is supplied only via an environment variable in
        maintainer-controlled environments; it is{" "}
        <strong>
          never baked into any published Docker image, web bundle, or Android
          APK
        </strong>{" "}
        &mdash; production or pre-release. A build you pull and run reports
        nothing to the project&rsquo;s Sentry. The project never enables Session
        Replay, log ingestion, or event attachments on any project-operated
        instance.
      </p>
      <p>An error report from the project&rsquo;s own environments contains:</p>
      <ul>
        <li>Stack trace and exception type</li>
        <li>Operating system and runtime versions</li>
        <li>GlycemicGPT version and commit hash</li>
        <li>The line of code that triggered the error</li>
      </ul>
      <p>An error report never contains:</p>
      <ul>
        <li>Blood glucose readings or any health data</li>
        <li>User identifiers, names, or contact information</li>
        <li>API keys, tokens, or credentials</li>
        <li>Device serial numbers or pairing IDs</li>
        <li>Database contents or query parameters</li>
        <li>HTTP request or response bodies</li>
      </ul>

      <h2>Controlling error monitoring in your deployment</h2>
      <p>
        Distributed builds carry no Sentry connection string, so a build you
        pull and run reports nothing to anyone &mdash; there is no project
        telemetry to disable. If you <em>want</em>{" "}error monitoring for your own
        self-hosted deployment, you can set your own connection string; reports
        then go to <em>your</em>{" "}account, never the project&rsquo;s.
      </p>

      <h2>Your rights</h2>
      <p>
        Because the project does not hold your personal or health data, requests
        to access, correct, export, or delete that data are satisfied directly
        within your own self-hosted deployment, which includes built-in data
        export and purge controls. For data held by the third-party services you
        connect (your AI provider, CGM or pump cloud, etc.), exercise your rights
        with those providers under their own policies.
      </p>

      <h2>Privacy questions</h2>
      <p>
        Privacy is load-bearing for this project and reports are taken
        seriously. For sensitive concerns, use{" "}
        <a
          href="https://github.com/GlycemicGPT/GlycemicGPT/security/advisories/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Security Advisories
        </a>
        . For general privacy questions, open a{" "}
        <a
          href="https://github.com/GlycemicGPT/GlycemicGPT/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issue
        </a>{" "}
        or reach us via the channels on our <Link href="/contact">Contact</Link> page.
      </p>
    </LegalPage>
  );
}
