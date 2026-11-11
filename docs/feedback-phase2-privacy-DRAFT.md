# Proposed privacy language — Feedback Intelligence

**DRAFT FOR OWNER/LEGAL REVIEW. Do not publish or enable collection automatically.**

Existing privacy contact verified in `src/app/privacy/page.tsx`: `akram@frameleads.io`.

## Proposed additions to the existing Privacy Policy

These additions are proposed for the existing sections below. They do not replace or revise any current legal language. The page at `/privacy` is unchanged and this wording is not published or legally approved.

### Add to section 2, “Information we use”

**Private website feedback.** If you choose to use our optional feedback form, we collect the concern you select and any additional comments you submit (up to 1,200 characters). The server also records the page path and plan context associated with the form, plus the submission time. The page path is taken from a same-origin referrer without its query string. Plan context is derived from a checkout path where available; on the homepage it comes from the pricing-card context and is not independently verified. We use these details to understand questions about FrameLeads and improve the product, pricing information, onboarding and support. The form does not request a name, email address or FrameLeads account, but comments may contain personal information that you choose to provide. Please avoid including confidential client or prospect information.

This feedback is not published as a review or testimonial and is not shared publicly. It is processed through our website hosting provider (Vercel) and stored in restricted database infrastructure (Supabase) for internal analysis. To limit misuse, the server receives a network address from the hosting edge and derives a pseudonymous rate-limit key using a secret HMAC and the current date, so the resulting key changes daily. The database stores that key, an hourly bucket and an attempt count; it does not store the raw network address or full referrer. The hosting provider may separately process network information under its own policies.

### Add to section 3, “How we use information”

We use feedback submissions to understand prospective customers’ concerns and improve our product, pricing information, onboarding and support. Feedback is for internal analysis and is not used as a public review or testimonial without separate permission.

### Add Supabase to section 5, “Service providers and sharing”

Supabase provides restricted database storage for private website feedback. Vercel hosts the feedback form and server endpoint. These providers process information as needed to operate and protect the feedback service.

### Add to section 6, “Retention and security”

**Retention proposal, subject to operational verification:** delete feedback once it is older than 90 days and rate-limit records once they are older than 48 hours using hourly scheduled database jobs. Deletion can occur on the next job run after each threshold. These periods are not active until the retention migration has been approved, applied to the intended database and its job runs and deletion behavior have been verified. No longer retention exception is currently implemented for feedback.

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
