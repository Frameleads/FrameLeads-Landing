# Proposed privacy language — Feedback Intelligence

**DRAFT FOR OWNER/LEGAL REVIEW. Do not publish or enable collection automatically.**

Existing privacy contact verified in `src/app/privacy/page.tsx`: `akram@frameleads.io`.

## Suggested new section in the existing Privacy Policy

**Private website feedback.** If you choose to use our optional feedback form, we collect the purchase concern you select and any additional comments you submit. We use this information to understand questions about FrameLeads, evaluate how well we explain the offer, and improve the product, pricing information, onboarding and support. We do not require a name, email address or FrameLeads account to send feedback. Please avoid including confidential client or prospect information in your comments.

This feedback is not published as a review or testimonial and is not shared publicly. It is processed through our website hosting provider (Vercel) and stored in our restricted database infrastructure (Supabase) for internal analysis. Our server temporarily processes a pseudonymous, rotating rate-limit key to prevent misuse; the feedback database does not store raw IP addresses in feedback records.

**Retention proposal, subject to operational verification:** keep written feedback for up to 90 days, then delete it on an automated schedule unless a longer period is justified by legal requirements; delete rate-limiting records after 48 hours. This time limit must be implemented and verified before the policy claims it is active.

For a privacy request, contact `akram@frameleads.io`. We may need information sufficient to locate a submission; anonymous feedback without contact details may not be individually identifiable after submission.

## Suggested text immediately next to the form

"Private feedback. Not publicly posted."

Additional small-print or linked text:
"Your response helps us improve FrameLeads. Please don't include confidential information. [Privacy Policy]"

## Release checklist

- Confirm policy wording, retention, international transfer and provider list with the owner/legal reviewer.
- Add Supabase to the actual provider disclosure.
- Verify retention scheduler is active and deletion works.
- Link `/privacy` from the live feedback panel when collection is enabled.
- Do not promise anonymous feedback is technically untraceable: host/request security systems may still process network data.
- Do not use submitted text to publish testimonials or marketing without separate express permission.
- Do not use the private feedback category as implied consent for optional analytics/advertising tracking.
