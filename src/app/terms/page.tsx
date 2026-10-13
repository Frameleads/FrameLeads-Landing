import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "../../components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | FrameLeads",
  description: "Terms for using FrameLeads and its outbound and reply-workflow services.",
  alternates: { canonical: "https://frameleads.io/terms" },
  openGraph: { title: "Terms of Service | FrameLeads", description: "Terms that apply when you use FrameLeads or place an order.", url: "https://frameleads.io/terms", siteName: "FrameLeads", type: "website" },
};

const termsLink = "text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]";

export default function TermsPage() {
  return <LegalPageShell title="Terms of Service" description="The terms that apply when you access FrameLeads, place an order, or use a service made available to your account." canonicalPath="/terms">
    <LegalSection title="1. About these Terms">
      <p>These Terms apply to the FrameLeads website and services offered under the BrandFlow Studio name. The seller for a paid order is identified during Whop checkout and on your receipt. By using the services or placing an order, you agree to these Terms on your own behalf or, if acting for an organization, on its behalf with authority to do so.</p>
      <p>Questions about these Terms: <a className={termsLink} href="mailto:akram@frameleads.io">akram@frameleads.io</a>.</p>
    </LegalSection>

    <LegalSection title="2. The Service">
      <p>FrameLeads supports outbound workflows, including prospect research, campaign preparation, Sandbox previews, native outbound execution, and connections to supported sending services. It also supports reply understanding, context, decision rules, automation controls, governance, routing, and next actions. Available features depend on your plan, account, and configuration. Any pilot has the scope and limits shown with its offer.</p>
    </LegalSection>

    <LegalSection title="3. Accounts and your responsibilities">
      <p>Where an account is provided, give accurate information, protect your credentials, limit access to authorized users, and promptly report suspected unauthorized use. You are responsible for activity under your account and for selecting and configuring available integrations and execution controls.</p>
      <p>You must have the rights and authority to provide or connect leads, contact details, account records, messages, and other material. You are responsible for its accuracy and lawful source, and for required notices, permissions, opt-outs, suppression lists, and retention.</p>
    </LegalSection>

    <LegalSection title="4. Acceptable use and outbound compliance">
      <p>Use FrameLeads in compliance with applicable privacy, marketing, anti-spam, consumer-protection, and platform requirements. Use authorized data sources, honor opt-outs, provide required disclosures, and do not contact people without the permissions or legal basis required for your activity.</p>
      <p>Do not use the service for unlawful, deceptive, abusive, or harmful communications; infringe another person’s rights; bypass a provider’s limits or access controls; transmit malicious code; or interfere with the service. You must also follow the terms and policies of connected email, social, advertising, data, and other third-party services.</p>
    </LegalSection>

    <LegalSection title="5. AI and automation">
      <p>AI-assisted or automated classifications, drafts, and recommendations may be incomplete, inaccurate, delayed, or unsuitable for a particular situation. They are not legal, financial, compliance, or other professional advice. You select available outbound execution controls and remain responsible for your configuration, messages, and actions.</p>
      <p>Do not rely on FrameLeads as the sole safeguard for a high-impact decision, legal obligation, emergency, or time-critical communication. We do not guarantee delivery, replies, meetings, revenue, or other business outcomes.</p>
    </LegalSection>

    <LegalSection title="6. Orders, subscriptions, cancellation, and refunds">
      <p>Whop provides checkout and payment processing. The offer, price, billing interval, renewal, taxes, and payment terms shown during checkout and in your order confirmation apply to your purchase. A subscription may renew automatically when checkout says it does.</p>
      <p>Follow the cancellation instructions provided for your order or through Whop, and cancel before the renewal date to avoid a later renewal charge. Refund requests are handled under the refund terms shown with the offer, the terms applicable to your order, and applicable law. For product access or service questions, contact the seller identified on your receipt. For a payment-processing issue, contact <a className={termsLink} href="https://whop.com/buyer-terms/" target="_blank" rel="noopener noreferrer">Whop</a>.</p>
      <p>Nothing in these Terms limits a refund, cancellation, withdrawal, or other right that applicable law makes non-waivable.</p>
    </LegalSection>

    <LegalSection title="7. Ownership and customer content">
      <p>FrameLeads and its licensors retain rights in the service, software, design, documentation, and related materials. Subject to these Terms and payment of applicable fees, you receive a limited, non-exclusive, non-transferable right to use the features made available to your account for your business purposes.</p>
      <p>You retain your rights in content you provide. You authorize us and our service providers to host, use, transmit, and process that content as needed to provide, secure, and support the service and as described in the <a className={termsLink} href="/privacy">Privacy Policy</a>. Do not copy, resell, distribute, reverse engineer, or create derivative works from the service except where applicable law permits or we authorize it in writing.</p>
    </LegalSection>

    <LegalSection title="8. Third-party services">
      <p>FrameLeads may connect to or link to services operated by others. Those providers control their services and their own terms and privacy practices. Their availability, changes, or failures may affect a feature, and their terms also apply when you use them.</p>
    </LegalSection>

    <LegalSection title="9. Availability and changes">
      <p>We may update, suspend, or discontinue features or parts of the service. We aim to provide reliable access but do not promise uninterrupted or error-free operation or a service level unless a separate written agreement says otherwise. We may suspend or restrict access when reasonably needed for security, legal compliance, payment issues, or misuse.</p>
    </LegalSection>

    <LegalSection title="10. Disclaimers and liability">
      <p>To the extent permitted by applicable law, the service is provided “as is” and “as available.” We disclaim implied warranties and conditions, including merchantability, fitness for a particular purpose, and non-infringement, only where the law permits. These Terms do not exclude a warranty or right that cannot legally be excluded.</p>
      <p>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, exemplary, or punitive loss, lost profits or data, or business interruption arising from use of the service. Nothing in these Terms limits liability that applicable law does not permit us to limit.</p>
    </LegalSection>

    <LegalSection title="11. Ending access and disputes">
      <p>You may stop using the service and end a subscription using the process that applies to your order. We may suspend or terminate access for a material breach, legal requirement, security risk, nonpayment, or discontinuation of the service. Terms that by their nature should continue remain effective to the extent permitted by law.</p>
      <p>Any dispute is subject to applicable law and the jurisdiction of a competent court, while preserving mandatory consumer rights. You may contact <a className={termsLink} href="mailto:akram@frameleads.io">akram@frameleads.io</a> to try to resolve a concern directly.</p>
    </LegalSection>

    <LegalSection title="12. Changes to these Terms">
      <p>We may revise these Terms by publishing an updated version with a new effective date. Changes apply from that date, subject to any notice or consent required by law. If you do not agree, stop using the affected service and manage any subscription under its order terms.</p>
    </LegalSection>
  </LegalPageShell>;
}
