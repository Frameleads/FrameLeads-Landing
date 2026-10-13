import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "../../components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | FrameLeads",
  description: "Terms for using FrameLeads outbound, reply intelligence, governance, and related services.",
  alternates: { canonical: "https://frameleads.io/terms" },
  openGraph: { title: "Terms of Service | FrameLeads", description: "Terms that apply when you use FrameLeads or place an order.", url: "https://frameleads.io/terms", siteName: "FrameLeads", type: "website" },
};

export default function TermsPage() {
  return <LegalPageShell title="Terms of Service" description="The terms that apply when you access FrameLeads, place an order, or use a feature made available to your account." canonicalPath="/terms">
    <LegalSection title="1. FrameLeads and acceptance">
      <p>FrameLeads is the product and brand that provides the website, products and services (collectively, the “Service”). The legal name and address of the person or entity that contracts with you have not been verified for this publication. By using the Service or placing an order, you agree to these terms on your own behalf or, if you use it for an organization, on that organization’s behalf with authority to bind it.</p>
      <p>For questions about these terms, contact <a className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]" href="mailto:akram@frameleads.io">akram@frameleads.io</a>.</p>
    </LegalSection>

    <LegalSection title="2. The Service">
      <p>Depending on your plan, account settings and connected services, FrameLeads may provide prospect research and ingestion, campaign preparation and Sandbox previews, native outbound execution, supported sending-stack connections, reply intake and classification, account context, decision rules, automation controls, governance, routing, and next-action workflows. Not every feature is available in every plan or configuration.</p>
      <p>An evaluation or Micro-Pilot includes only the scope, limits and price shown in its checkout. A pilot does not promise that every full-service feature is included.</p>
    </LegalSection>

    <LegalSection title="3. Accounts and customer responsibilities">
      <p>Where account access is provided, supply accurate account and billing information, protect credentials, restrict access to authorized users, and promptly report suspected unauthorized access. You are responsible for activity under your account and for configuring connected tools, permissions, policies and execution controls.</p>
      <p>You must have the rights and authority to provide leads, contact details, account records, messages and other information you submit or connect. You are responsible for the accuracy, source, notices, consent, lawful basis, retention, opt-outs and suppression rules that apply to your use of that information.</p>
    </LegalSection>

    <LegalSection title="4. Acceptable use and outbound compliance">
      <p>You are responsible for complying with privacy, marketing, anti-spam, consumer-protection and platform requirements when collecting data and sending or automating outreach. Use lawful sources, honor unsubscribes and suppression lists, provide required disclosures, and do not contact people where you lack a lawful basis or authorization.</p>
      <p>Do not use the Service to send unlawful, deceptive, abusive, unsolicited or harmful communications; violate privacy or intellectual-property rights; bypass provider limits or access controls; submit malicious code; or interfere with or disrupt the Service. Follow the terms and policies of every connected email, social, advertising, data-source and third-party platform.</p>
    </LegalSection>

    <LegalSection title="5. Automation and AI limitations">
      <p>Classification, drafting, scoring and recommendations may be automated or AI-assisted and can be incomplete, inaccurate, delayed or unsuitable for a particular situation. Outputs are decision support, not legal, financial, compliance or other professional advice. You choose whether to enable automated execution, approval or escalation, and remain responsible for configured rules, messages sent and actions taken.</p>
      <p>Do not rely on the Service as the sole safeguard for a high-impact decision, legal obligation, emergency or time-critical communication. We do not guarantee message delivery, replies, meetings, revenue or any other business result.</p>
    </LegalSection>

    <LegalSection title="6. Plans, recurring billing, cancellation and refunds">
      <p>Checkout is provided by Whop. The plan, price, billing interval, renewal terms, taxes and payment details shown in the Whop checkout and related order terms apply to your purchase. If you select a recurring subscription, the checkout disclosure governs its billing and renewal.</p>
      <p>Use the cancellation method presented by Whop for your order or account, or contact support if you cannot access it. The cancellation effective time, any remaining access and whether another billing period is due depend on the checkout terms and Whop’s account settings for that order; these terms do not promise a particular cancellation timing or access end date. Whop processes payment credentials. FrameLeads may receive purchase, subscription and payment-status information needed to administer the order.</p>
      <p>Except where applicable law requires otherwise or an exception is approved, payments are generally non-refundable. Nothing in these terms removes non-waivable statutory rights or creates a refund promise beyond the terms shown at checkout or an exception approved in writing.</p>
    </LegalSection>

    <LegalSection title="7. Ownership and permitted use">
      <p>FrameLeads and its licensors retain ownership of the Service, software, design, documentation and related intellectual property. Subject to these terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable right to use the features made available to your account for your internal business purposes.</p>
      <p>You retain rights in the content you provide. You authorize FrameLeads and its service providers to host, reproduce, transmit and process that content as needed to provide, secure and support the Service and as described in the Privacy Policy. Do not copy, resell, distribute, reverse engineer or create derivative works from the Service except where applicable law permits or we authorize it in writing.</p>
    </LegalSection>

    <LegalSection title="8. Third-party services">
      <p>The Service may connect to or link to services operated by others, including Whop, hosting and storage providers, inbox and email tools, AI services, video, advertising measurement and data-source integrations. Third parties control their own services and terms. Their availability, data practices, changes or failures may affect a FrameLeads feature, and their terms also apply to your use of them.</p>
    </LegalSection>

    <LegalSection title="9. Changes, availability and suspension">
      <p>We may maintain, update, suspend or discontinue features, integrations or parts of the Service. We aim to keep the Service available but do not promise uninterrupted or error-free operation or a particular service level unless a separate written agreement says otherwise. We may suspend or restrict access to address security, legal, payment or misuse concerns.</p>
    </LegalSection>

    <LegalSection title="10. Disclaimers and liability">
      <p>To the maximum extent permitted by applicable law, the Service is provided “as is” and “as available.” We disclaim implied warranties and conditions, including merchantability, fitness for a particular purpose and non-infringement, only to the extent the law permits. Nothing in these terms excludes a warranty or right that cannot legally be excluded.</p>
      <p>To the maximum extent permitted by applicable law, FrameLeads is not liable for indirect, incidental, special, consequential, exemplary or punitive loss, loss of profits or data, or business interruption arising from use of the Service. These terms do not state a numerical liability cap and do not limit liability that applicable law prohibits limiting.</p>
    </LegalSection>

    <LegalSection title="11. Termination">
      <p>You may stop using the Service and cancel any paid subscription using the applicable Whop or account process described for your order. We may suspend or terminate access for a material breach, legal requirement, security risk, nonpayment or discontinuation of the Service. When use ends, your permission to access the affected Service ends. Provisions that by their nature should continue, including payment obligations, intellectual-property provisions, disclaimers and liability terms, continue to the extent permitted by law.</p>
    </LegalSection>

    <LegalSection title="12. Governing law and disputes">
      <p>These terms do not designate a governing law, exclusive court or arbitration forum because the current FrameLeads operator’s legal registration and jurisdiction have not been established in the information available for this policy. Any dispute remains subject to the mandatory laws and competent forums that apply to the parties. Nothing here waives a consumer or other right that applicable law makes non-waivable. You may first contact <a className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]" href="mailto:akram@frameleads.io">akram@frameleads.io</a> to try to resolve a concern informally; doing so is not a required arbitration or court procedure.</p>
    </LegalSection>

    <LegalSection title="13. Changes and contact">
      <p>We may revise these terms by publishing an updated version and effective date on this page. Changes apply prospectively from the stated date, subject to any notice or consent required by law. If you do not agree to a change, stop using the affected Service and manage any subscription through its checkout/account terms.</p>
      <p>Questions about these terms: <a className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]" href="mailto:akram@frameleads.io">akram@frameleads.io</a>.</p>
    </LegalSection>
  </LegalPageShell>;
}
