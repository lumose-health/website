import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use - GlycemicGPT",
  description:
    "The terms governing use of the GlycemicGPT website and open-source software. Provided as-is under GPL-3.0, with no warranty, for monitoring and informational purposes only.",
  openGraph: {
    title: "Terms of Use - GlycemicGPT",
    description:
      "Terms governing use of the GlycemicGPT website and open-source software.",
    url: "https://glycemicgpt.org/terms",
    siteName: "GlycemicGPT",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      lastUpdated="May 27, 2026"
      intro="These terms govern your use of the GlycemicGPT website and the GlycemicGPT open-source software. By using either, you agree to them."
    >
      <h2>1. About GlycemicGPT</h2>
      <p>
        GlycemicGPT is a free, open-source diabetes monitoring and analysis
        platform maintained by a community of volunteer contributors (the
        &ldquo;project&rdquo;). It is not a company, and these terms do not
        create any commercial relationship, partnership, or warranty. The
        project provides this website and the software at no charge and on a
        voluntary basis.
      </p>

      <h2>2. The software is licensed, not sold</h2>
      <p>
        The GlycemicGPT software is licensed under the{" "}
        <a
          href="https://github.com/GlycemicGPT/GlycemicGPT/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          GNU General Public License v3.0 (GPL-3.0)
        </a>
        . Your rights to use, copy, modify, and distribute the software are
        defined by that license. Where these Terms of Use and the GPL-3.0 ever
        conflict regarding the software itself, the GPL-3.0 governs. These terms
        additionally govern your use of this website.
      </p>

      <h2>3. Not a medical device; not medical advice</h2>
      <p>
        GlycemicGPT is <strong>not a medical device</strong>. It has not been
        cleared, approved, or certified by the FDA, any EU Notified Body, or any
        other regulatory authority. It does not deliver insulin or control any
        medical device. It reads and displays data and generates AI text
        suggestions for informational and educational purposes only.
      </p>
      <p>
        Nothing produced by the software is medical advice. Do not make
        treatment decisions based on it without consulting your healthcare team.
        Your use of the software is subject to our{" "}
        <Link href="/disclaimer">Medical Disclaimer</Link>, which is incorporated into
        these terms by reference. If you do not accept the Medical Disclaimer,
        do not use the software.
      </p>

      <h2>4. Acceptable use</h2>
      <p>When using this website, you agree not to:</p>
      <ul>
        <li>
          Use it in any way that violates applicable law or the rights of
          others;
        </li>
        <li>
          Attempt to gain unauthorized access to, disrupt, or overload the site
          or its hosting infrastructure;
        </li>
        <li>
          Scrape, probe, or test the vulnerability of the site except through
          our responsible-disclosure process (see{" "}
          <Link href="/contact">Contact</Link>);
        </li>
        <li>
          Misrepresent the project, imply official endorsement you do not have,
          or remove required license and attribution notices.
        </li>
      </ul>

      <h2>5. Self-hosting and your responsibilities</h2>
      <p>
        GlycemicGPT is self-hosted software. When you deploy it, you are
        responsible for the security, configuration, and lawful operation of
        your own deployment, for the data it processes, and for any third-party
        services you connect to it (your AI provider, CGM or pump cloud,
        messaging bot, and so on). You are responsible for complying with the
        terms of those third-party services.
      </p>

      <h2>6. Third-party forks and modifications</h2>
      <p>
        GlycemicGPT ships as a monitoring and analysis platform across all
        builds the project distributes; its plugin SDK is read-only by design
        and has no insulin-delivery capability. Forks that modify the software
        to add device control or insulin delivery operate{" "}
        <strong>outside the project</strong>. Anyone who builds, installs, or
        runs such a fork becomes the manufacturer of their own personal medical
        device and accepts full responsibility for it. The maintainers do not
        review, recommend, or accept liability for third-party forks. See the{" "}
        <Link href="/disclaimer">Medical Disclaimer</Link> for details.
      </p>

      <h2>7. Intellectual property and trademarks</h2>
      <p>
        Source code is provided under the GPL-3.0. The GlycemicGPT name and
        logo, and third-party names referenced on this site (such as device and
        platform brands), belong to their respective owners. Reference to a
        third party does not imply any affiliation with or endorsement by that
        party.
      </p>

      <h2>8. No warranty</h2>
      <p>
        The website and software are provided <strong>&ldquo;as is&rdquo;</strong>{" "}
        and <strong>&ldquo;as available&rdquo;</strong>, without warranty of any
        kind, express or implied, including but not limited to the warranties of
        merchantability, fitness for a particular purpose, and noninfringement.
        The project does not warrant that the software is accurate, reliable,
        uninterrupted, or error-free. This mirrors Sections 15&ndash;17 of the
        GPL-3.0.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, no contributor,
        maintainer, or entity associated with the project shall be liable for
        any claim, damages, or other liability &mdash; including any injuries or
        adverse health outcomes &mdash; arising from or in connection with the
        website or the software or its use. You use GlycemicGPT entirely at your
        own risk.
      </p>
      <p>
        Some jurisdictions do not allow the exclusion of certain warranties or
        the limitation of liability for personal injury. In those jurisdictions,
        the limitations above apply only to the extent permitted by law.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above. Your
        continued use of the website or software after a change constitutes
        acceptance of the revised terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        GlycemicGPT is a distributed open-source project maintained by
        volunteers and is not incorporated in any single jurisdiction. These
        terms do not designate a specific governing law or exclusive venue. Any
        mandatory consumer-protection rights you have under the law of your place
        of residence are unaffected by these terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms can be raised through the channels on our{" "}
        <Link href="/contact">Contact</Link> page. This page is provided for general
        information and does not constitute legal advice.
      </p>
    </LegalPage>
  );
}
