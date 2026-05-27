import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Accessibility Statement - GlycemicGPT",
  description:
    "GlycemicGPT's commitment to an accessible website and platform, the standards we aim for, and how to report accessibility issues.",
  openGraph: {
    title: "Accessibility Statement - GlycemicGPT",
    description:
      "Our commitment to an accessible website and platform, and how to report issues.",
    url: "https://glycemicgpt.org/accessibility",
    siteName: "GlycemicGPT",
    type: "website",
  },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility Statement"
      lastUpdated="May 27, 2026"
      intro="We want GlycemicGPT to be usable by everyone managing diabetes, regardless of ability."
    >
      <h2>Our commitment</h2>
      <p>
        Accessibility is part of the project&rsquo;s mission &mdash; because no
        one should manage diabetes alone. We aim to make this website and the
        GlycemicGPT platform usable for people with a wide range of abilities,
        including those who rely on screen readers, keyboard navigation, or
        other assistive technologies.
      </p>

      <h2>Standards we aim for</h2>
      <p>
        We work toward conformance with the{" "}
        <a
          href="https://www.w3.org/TR/WCAG21/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Web Content Accessibility Guidelines (WCAG) 2.1
        </a>{" "}
        at Level AA. This includes practical measures such as:
      </p>
      <ul>
        <li>Semantic, structured HTML and logical heading order;</li>
        <li>Keyboard-navigable interactive elements with visible focus;</li>
        <li>Text alternatives for meaningful images and icons;</li>
        <li>
          A dark and light theme, and color choices chosen with contrast in
          mind;
        </li>
        <li>
          Respect for the operating system&rsquo;s reduced-motion preference for
          animations.
        </li>
      </ul>

      <h2>Ongoing effort</h2>
      <p>
        Accessibility is an ongoing effort, not a one-time checkbox. As an
        open-source project, parts of the site and platform may not yet fully
        meet our target. We treat accessibility defects as real bugs and welcome
        contributions that improve them.
      </p>

      <h2>Reporting an accessibility issue</h2>
      <p>
        If you encounter a barrier on this website or in the platform, please
        let us know so we can fix it. Open a{" "}
        <a
          href="https://github.com/GlycemicGPT/GlycemicGPT/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issue
        </a>{" "}
        or reach us through the channels on our <Link href="/contact">Contact</Link>{" "}
        page. Please describe the page, the problem, and the assistive
        technology you were using, if any.
      </p>
    </LegalPage>
  );
}
