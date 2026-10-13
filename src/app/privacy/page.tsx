import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "../../components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | FrameLeads",
  description: "How FrameLeads handles website, Reply Workflow Audit, attribution, and service information.",
  alternates: { canonical: "https://frameleads.io/privacy" },
  openGraph: { title: "Privacy Policy | FrameLeads", description: "How FrameLeads handles personal information.", url: "https://frameleads.io/privacy", siteName: "FrameLeads", type: "website" },
};

export default function PrivacyPage() {
  return <LegalPageShell title="Privacy Policy" description="A practical explanation of the information used by the FrameLeads website, Reply Workflow Audit, and related services." canonicalPath="/privacy">
    <LegalSection title="1. Who operates FrameLeads and how to contact us">
      <p>FrameLeads is the product and brand described by this policy. The legal name and address of the person or entity responsible for operating it have not been verified for this publication. This policy uses “FrameLeads,” “we,” and “us” as shorthand for the service; those words do not identify a particular incorporated company.</p>
      <p>For privacy questions or requests, email <a className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]" href="mailto:akram@frameleads.io">akram@frameleads.io</a>. Please describe the request and the information or interaction it concerns. We may ask for information reasonably needed to verify identity and locate the relevant records.</p>
    </LegalSection>

    <LegalSection title="2. Information covered by this policy">
      <p><strong className="text-white">Reply Workflow Audit.</strong> The Audit processes five answers about monthly qualified outbound conversations, typical engagement value, weekly manual reply-decision work, who owns reply decisions, and how non-routine replies are handled. The answers are used in the browser to produce an immediate diagnosis before contact details are requested.</p>
      <p><strong className="text-white">Workflow-map request.</strong> If you choose to request a personalized map, the form collects your work email, company website/domain, optional first name, Audit answers, diagnosis and derived workflow signals. A successful submission is sent through the FrameLeads `/api/audit-lead` endpoint to the related Brand Brain service for the requested map and any follow-up resource or message described in the form.</p>
      <p><strong className="text-white">Site and device information.</strong> The hosting and security infrastructure may process connection and diagnostic details such as IP address, browser/device information, request time, requested path and error information to deliver and protect the site. When you permit analytics, the site also records page paths, a referring host, and campaign information such as UTM values and advertising click identifiers.</p>
      <p><strong className="text-white">Checkout and purchase information.</strong> Whop operates the checkout. Whop collects payment credentials and checkout information under its own terms and privacy notices. The related service can receive purchase or subscription records from Whop, including customer email where supplied, plan or membership identifiers, payment status, amount, currency and event time, to confirm and administer a purchase.</p>
    </LegalSection>

    <LegalSection title="3. Why information is used">
      <p>Information is used to operate and secure the site; calculate and display an Audit diagnosis; create a requested workflow map; respond to privacy or support requests; deliver the resources or follow-up you request; administer subscriptions and purchases; understand campaign and product performance where you allow measurement; prevent abuse; and meet legal obligations.</p>
      <p>The Audit can be completed and its diagnosis viewed without providing contact details and without accepting optional analytics or advertising measurement. Providing contact details is only needed to submit the separate workflow-map request.</p>
    </LegalSection>

    <LegalSection title="4. Cookies, browser storage, and attribution choices">
      <p>Optional analytics and advertising tags are off until you make a choice in the site’s Privacy choices control. You can accept or reject both categories, manage them separately, and reopen the control using the persistent Privacy settings button. The choice is stored in browser local storage so it can be remembered. If browser storage is blocked, the choice may only remain in memory for that page session.</p>
      <p>If analytics is allowed, the measurement code uses a pseudonymous browser identifier in local storage with a 365-day expiry value and a session identifier in session storage that rotates after 30 minutes without activity. It may retain campaign parameters, the landing path without its query string, and the referring host in session storage. These values are not the same as the Audit answers or contact details.</p>
      <p>If advertising measurement is allowed and a provider is configured, the site may load the Meta Pixel, a configured TikTok pixel, and Whop’s analytics script. It may read provider click or browser identifiers such as Meta’s `_fbp` and `_fbc` or TikTok’s `_ttp` and `ttclid`. The site does not load these optional tags before the relevant choice. You can change that choice later; browser settings also provide controls for stored cookies and site data.</p>
      <p>Embedded YouTube video content is click-to-load. Choosing to play or open the video connects your browser to YouTube, which may process information under its own privacy notice.</p>
    </LegalSection>

    <LegalSection title="5. Analytics and advertising conversion measurement">
      <p>With analytics permission, first-party browser observations may include genuine page views, VSL engagement after qualifying playback, Audit start, Audit completion, and checkout initiation when a checkout link is activated. Those observations are sent to the FrameLeads `/api/measurement` endpoint and the related Brand Brain measurement service. The flow uses opaque browser/session identifiers and SHA-256-derived event identifiers for deduplication. It does not include the Audit form’s raw email address or an email hash in these browser observations.</p>
      <p>With advertising permission, the configured Meta browser pixel may receive corresponding browser events. A related server-side conversion integration can send canonical captured-lead, qualified-lead, verified-purchase, or first-governed-decision events to Meta or TikTok when that provider is enabled and its private configuration is complete. The reviewed server-side payload uses valid provider browser/click identifiers when available; it does not include an email address or a hashed email in the reviewed conversion payload. A hash, if used by another enabled service for a separate purpose, would not by itself make information anonymous.</p>
      <p>The landing-page production configuration provided for this review identifies Meta browser tracking as enabled with a configured pixel ID. The Brand Brain source includes Meta and TikTok server-side delivery, but access to the production provider settings and delivery logs was not available for this review, so actual server-side activation and successful delivery cannot be confirmed here. TikTok browser/server tags are conditional on their configuration. A checkout-link click is not treated as a purchase; purchase measurement is based on Whop-confirmed payment evidence in the related service, not on a browser click.</p>
    </LegalSection>

    <LegalSection title="6. Service providers and other disclosures">
      <p>The reviewed service uses Vercel for website hosting and server execution. Audit data is handed to the related Brand Brain service, whose reviewed implementation uses Supabase for service storage. Whop provides checkout and purchase-event processing. Meta and, if enabled, TikTok provide advertising measurement. YouTube provides the user-initiated video. These providers process information under their own terms and privacy notices and our applicable arrangements with them.</p>
      <p>The broader FrameLeads service code also contains feature-dependent AI, inbox/email and prospect-research integrations, including Anthropic, Google Gmail APIs, and optional research/source connectors. Whether each is active for a particular account or production environment depends on feature use and configuration; the active set and provider processing regions were not available to verify in this review. A feature that connects an external provider may send the information needed for that feature to that provider.</p>
      <p>We may also disclose information if reasonably necessary to comply with law, respond to valid legal process, protect people or the service, or handle a business transfer, subject to applicable law.</p>
    </LegalSection>

    <LegalSection title="7. Retention and security">
      <p>The reviewed browser code rotates analytics sessions after 30 minutes of inactivity and assigns the pseudonymous analytics identifier a 365-day expiry value. These browser behaviors do not establish when every related server record is deleted. The repositories reviewed do not establish one complete retention schedule for Audit/prospect records, purchase records, hosting logs, support correspondence or provider records. We retain information only as needed for the described purposes, legitimate operational needs and applicable legal obligations; contact us to request deletion or ask about a specific record.</p>
      <p>The implementation uses request validation, bounded payloads, authenticated server-to-server Audit delivery and server-side provider credentials. We use reasonable technical and organizational measures, but no internet transmission or storage system can be guaranteed completely secure. If you believe information has been exposed, contact us promptly.</p>
    </LegalSection>

    <LegalSection title="8. International processing">
      <p>Our hosting and service providers may process information in countries other than the country where you live. The production regions used by Vercel and Supabase, the relevant provider transfer locations, and any specific contractual transfer safeguards were not verifiable from the reviewed repository. Where applicable law requires a transfer mechanism or additional safeguards, the responsible operator must put them in place.</p>
    </LegalSection>

    <LegalSection title="9. Your choices and privacy rights">
      <p>Depending on where you live and which laws apply, you may have rights to request access to, correction or deletion of personal information; to object to or restrict certain processing; to receive a portable copy; to withdraw consent for processing based on consent; or to complain to a regulator. These rights and exceptions vary by jurisdiction and are not all available to every person in every circumstance.</p>
      <p>Use the Privacy settings control to change optional analytics and advertising choices. To make an access, correction, deletion or other privacy request, email <a className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]" href="mailto:akram@frameleads.io">akram@frameleads.io</a>. We will review the request, verify it as reasonably necessary and respond under the law that applies. You can unsubscribe from Audit follow-up email using the unsubscribe method included in that email.</p>
    </LegalSection>

    <LegalSection title="10. Children and policy updates">
      <p>FrameLeads is intended for business users and is not directed to children. We do not knowingly seek children’s personal information through the Reply Workflow Audit.</p>
      <p>We may update this policy when the service, its providers or applicable requirements change. The effective date above will be updated when a new version is published. If applicable law requires notice or consent for a material change, we will provide it.</p>
    </LegalSection>
  </LegalPageShell>;
}
