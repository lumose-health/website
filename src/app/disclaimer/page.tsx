import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Medical Disclaimer - GlycemicGPT",
  description:
    "GlycemicGPT is not a medical device and not a substitute for professional medical care. It is experimental open-source software for informational and educational purposes only.",
  openGraph: {
    title: "Medical Disclaimer - GlycemicGPT",
    description:
      "GlycemicGPT is not a medical device and not a substitute for professional medical care.",
    url: "https://glycemicgpt.org/disclaimer",
    siteName: "GlycemicGPT",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Medical Disclaimer"
      lastUpdated="May 27, 2026"
      intro="Read this before using GlycemicGPT. It is experimental, open-source software for informational and educational purposes only."
    >
      <h2>Regulatory status</h2>
      <p>
        This software has <strong>not</strong>{" "}been cleared, approved, or
        certified by any regulatory authority worldwide, including but not
        limited to:
      </p>
      <ul>
        <li>The U.S. Food and Drug Administration (FDA)</li>
        <li>EU Notified Bodies (no CE marking under MDR 2017/745)</li>
        <li>Health Canada</li>
        <li>Australia&rsquo;s Therapeutic Goods Administration (TGA)</li>
        <li>Any equivalent national regulatory authority</li>
      </ul>

      <h2>Not a medical device</h2>
      <p>
        <strong>This software is NOT a medical device.</strong>{" "}It is
        experimental open-source software provided for educational and
        informational purposes only. No individual, organization, or entity
        associated with this project is the &ldquo;manufacturer&rdquo; of a
        medical device under any regulatory framework.
      </p>
      <p>
        GlycemicGPT does not control any medical devices. It reads data from
        insulin pumps and continuous glucose monitors (CGMs), displays that
        data, and provides AI-generated text suggestions. These suggestions are
        not medical advice and must not be treated as such.
      </p>

      <h2>Health data and AI providers</h2>
      <p>
        The self-hosted GlycemicGPT platform stores your data on infrastructure
        you control. However, whether health data leaves that infrastructure
        depends on which AI provider you configure:
      </p>
      <ul>
        <li>
          <strong>Cloud-hosted AI providers</strong>{" "}receive your glucose,
          insulin, pump, and therapy data context for inference. That data is
          then subject to the provider&rsquo;s data-handling policy and the
          policies of any upstream providers it routes to.
        </li>
        <li>
          <strong>Local AI providers</strong>{" "}(models running on infrastructure
          you control, such as Ollama, vLLM, or llama.cpp) keep that data on
          your own network.
        </li>
      </ul>
      <p>
        It is your responsibility to verify where your configured AI endpoint
        routes traffic and to review its data-handling policy before configuring
        it. See our <Link href="/privacy">Privacy Policy</Link> for how the platform
        itself handles data.
      </p>

      <h2>AI limitations</h2>
      <p>
        AI-generated suggestions are produced by large language models that are
        known to:
      </p>
      <ul>
        <li>
          <strong>Hallucinate</strong>{" "}&mdash; generate plausible-sounding but
          incorrect information;
        </li>
        <li>
          <strong>Misinterpret data</strong>{" "}&mdash; draw incorrect conclusions
          from glucose readings;
        </li>
        <li>
          <strong>Provide outdated information</strong>{" "}&mdash; not reflect the
          latest medical guidelines;
        </li>
        <li>
          <strong>Lack context</strong>{" "}&mdash; not understand your complete
          medical history, comorbidities, or current medications.
        </li>
      </ul>
      <p>
        All AI-generated content is labeled as suggestions, not medical advice.
        Never act on AI suggestions without consulting your healthcare team.
      </p>

      <h2>Critical warnings</h2>
      <ol>
        <li>
          <strong>Do not replace professional medical care.</strong>{" "}Always
          consult your endocrinologist, diabetes educator, or healthcare
          provider before making any changes to your diabetes management.
        </li>
        <li>
          <strong>Verify all suggestions.</strong>{" "}Any insulin dosing, carb
          ratio, or correction factor suggestion must be verified with your
          healthcare team before use.
        </li>
        <li>
          <strong>Use extreme caution.</strong>{" "}Incorrect diabetes management
          can result in severe hypoglycemia, diabetic ketoacidosis (DKA), or
          other life-threatening conditions.
        </li>
        <li>
          <strong>
            If you experience a diabetes emergency, contact your healthcare
            provider or emergency services immediately.
          </strong>{" "}
          Do not rely on this software for emergency medical guidance.
        </li>
      </ol>

      <h2>Third-party forks and device control</h2>
      <p>
        GlycemicGPT is a monitoring and analysis platform across all builds it
        ships; the plugin SDK is read-only by design and has no insulin-delivery
        primitives. Forks that modify the SDK to add device control or insulin
        delivery operate <strong>outside the GlycemicGPT project</strong>. The
        maintainers do not review, recommend, or accept liability for them.
      </p>
      <p>
        Anyone who builds, installs, or runs such a fork becomes the{" "}
        <strong>manufacturer of their personal medical device</strong>{" "}and
        accepts full responsibility for that decision &mdash; the same posture
        used by DIY diabetes projects such as Loop and AndroidAPS.
      </p>

      <h2>Untested device compatibility</h2>
      <p>
        This software may declare protocol compatibility with devices that have
        not been tested against physical hardware. Protocol compatibility does
        not guarantee correct operation. Data from untested devices may be
        inaccurate, delayed, or missing, and connection behavior may differ.
        Safety-critical values (insulin on board, glucose readings, basal rates)
        must always be verified against the device manufacturer&rsquo;s official
        companion app. Users who use this software with untested hardware accept
        all associated risk.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        THE AUTHORS, CONTRIBUTORS, AND MAINTAINERS OF THIS SOFTWARE PROVIDE IT
        &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THEY BE
        LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY &mdash; INCLUDING ANY
        DAMAGES, INJURIES, OR ADVERSE HEALTH OUTCOMES &mdash; ARISING FROM OR IN
        CONNECTION WITH THE SOFTWARE OR ITS USE.
      </p>
      <p>By using GlycemicGPT, you acknowledge that:</p>
      <ul>
        <li>You are using this software entirely at your own risk;</li>
        <li>
          You will not rely solely on AI-generated suggestions for medical
          decisions;
        </li>
        <li>You understand that AI can and will make errors;</li>
        <li>
          You will maintain regular care with qualified healthcare professionals;
        </li>
        <li>
          You accept full responsibility for any decisions made based on this
          software&rsquo;s output;
        </li>
        <li>
          No individual or entity associated with this project is liable for
          medical outcomes.
        </li>
      </ul>
      <p>
        This software is licensed under the GPL-3.0; see Sections 15&ndash;17 of
        the <Link href="/terms">Terms of Use</Link> and the{" "}
        <a
          href="https://github.com/GlycemicGPT/GlycemicGPT/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          LICENSE
        </a>{" "}
        for the full warranty disclaimer. Limitation-of-liability clauses for
        personal injury may be unenforceable in some jurisdictions. This
        disclaimer does not constitute legal advice.
      </p>
    </LegalPage>
  );
}
