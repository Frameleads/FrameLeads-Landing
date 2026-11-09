import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "../../components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | FrameLeads",
  description: "How FrameLeads uses personal information across its website, Reply Workflow Audit, and services.",
  alternates: { canonical: "https://frameleads.io/privacy" },
  openGraph: { title: "Privacy Policy | FrameLeads", description: "How FrameLeads uses personal information.", url: "https://frameleads.io/privacy", siteName: "FrameLeads", type: "website" },
};

const providerLink = "text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]";

export default function PrivacyPage() {
  return <LegalPageShell title="Privacy Policy" description="A clear summary of the information FrameLeads uses and the choices available to you." canonicalPath="/privacy">
    <LegalSection title="1. About FrameLeads and contact">
      <p>FrameLeads is offered under the BrandFlow Studio name and is operated by Akram Walid, based in the United Arab Emirates. The seller for a particular purchase is identified during Whop checkout and on your receipt. For privacy questions or requests, contact us at <a className={providerLink} href="mailto:akram@frameleads.io">akram@frameleads.io</a>.</p>
    </LegalSection>

    <LegalSection title="2. Information we use">
      <p><strong className="text-white">Website and device information.</strong> When you visit, our website and hosting providers may process technical information needed to deliver and protect the site, such as your IP address, browser and device details, requested pages, referring page, and request time. If you allow optional measurement, we may also use page activity, campaign information, and advertising or device identifiers.</p>
      <p><strong className="text-white">Reply Workflow Audit.</strong> The Audit uses your answers about your outbound workflow to prepare a diagnosis. You can view the diagnosis without giving us contact details. If you request a personalized workflow map, we also collect the work email and company website you provide, an optional first name, your Audit answers, and the resulting diagnosis so we can prepare and deliver that request.</p>
      <p><strong className="text-white">Email and support requests.</strong> If you request a resource or subscribe through a FrameLeads form, we use the email address you provide to send the requested material and related communications. If you contact support, we use your message and contact details to respond. Email distribution is supported by MailerLite.</p>
      <p><strong className="text-white">Accounts and purchases.</strong> If you use an account-enabled feature, we may process account, configuration, and usage information needed to provide it. Whop processes checkout and payment information, including payment credentials. The seller may receive purchase and subscription details needed to provide access, administer your order, and support you.</p>
    </LegalSection>

    <LegalSection title="3. How we use information">
      <p>We use information to operate and secure the website and services; provide the Audit diagnosis and any workflow map you request; respond to messages; deliver requested resources; manage accounts, purchases, and subscriptions; understand service performance when you allow analytics; measure advertising when you allow advertising measurement; prevent misuse; and meet legal obligations.</p>
      <p>We do not require optional analytics or advertising consent to complete the Reply Workflow Audit or view its diagnosis. You choose whether to provide contact details for a separate workflow-map request.</p>
    </LegalSection>

    <LegalSection title="4. Cookies and measurement choices">
      <p>Necessary browser storage remembers your privacy choices and supports basic site operation. Optional analytics and advertising measurement remain off until you choose them. You may reject optional measurement, choose analytics and advertising separately, or change your preferences later using the Privacy settings control.</p>
      <p>When enabled, analytics may process site visits, video engagement, Audit interactions, checkout initiation, and campaign or referral information. Advertising measurement may use the Meta Pixel and Meta Conversions API (CAPI), and, where enabled, TikTok browser or server-side measurement. These services may receive event, device, click, or other matching information. Where a matching integration uses contact identifiers in hashed form, hashing does not make the information anonymous.</p>
      <p>Whop analytics is used only when you allow advertising measurement. The FrameLeads video is click-to-load; choosing to play it connects your browser to YouTube, which processes information under its own privacy notice. You can also manage cookies through your browser settings.</p>
    </LegalSection>

    <LegalSection title="5. Service providers and sharing">
      <p>We use service providers to host and operate the website, deliver email, process checkout, provide requested Audit services, and support analytics and advertising measurement. These providers receive information needed for their services. They include Vercel for website hosting, MailerLite for email distribution, Whop for checkout and payment processing, and—when enabled—Meta and TikTok for advertising measurement. YouTube processes information when you choose to play its embedded video.</p>
      <p>Information provided for a personalized workflow map is shared with the service provider that prepares and delivers that request. We may also disclose information when required by law, to protect the rights or safety of people or services, or as part of a business transfer, subject to applicable law.</p>
      <p>Whop has its own <a className={providerLink} href="https://whop.com/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Meta, TikTok, YouTube, and other providers describe their own data practices in their respective privacy notices.</p>
    </LegalSection>

    <LegalSection title="6. Retention and security">
      <p>We keep information for as long as reasonably needed to provide the service or resource requested, administer accounts and purchases, respond to you, protect our services, and meet legal obligations. Retention periods depend on the type of information and the reason it was collected. Providers may retain information under their own policies and legal requirements.</p>
      <p>We use reasonable safeguards designed to protect information. No method of transmission or storage is completely secure. If you have a privacy or security concern, please contact us promptly.</p>
    </LegalSection>

    <LegalSection title="7. International processing">
      <p>Our service providers may process information in countries other than the one where you live. Where applicable law requires a transfer mechanism or additional protection, we will use the measures required by that law. Provider-specific information is available in the providers’ privacy notices.</p>
    </LegalSection>

    <LegalSection title="8. Your choices and rights">
      <p>Depending on your location and applicable law, you may have the right to request access to, correction of, or deletion of personal information; object to or restrict certain processing; receive a copy of information; withdraw consent; or opt out of certain advertising or sharing. The rights available and any exceptions depend on the law that applies.</p>
      <p>Use Privacy settings to change optional measurement choices. To make another privacy request, email <a className={providerLink} href="mailto:akram@frameleads.io">akram@frameleads.io</a>. Please tell us what request you are making; we may ask for reasonable information to verify it. You can unsubscribe from email communications using the link or instructions in the message.</p>
    </LegalSection>

    <LegalSection title="9. Children and policy updates">
      <p>FrameLeads is designed for business use and is not directed to children. We do not knowingly collect children’s personal information through the Reply Workflow Audit.</p>
      <p>We may update this policy as our services or requirements change. The effective date shown above identifies the current version. We will provide any additional notice or choice required by applicable law.</p>
    </LegalSection>
  </LegalPageShell>;
}
