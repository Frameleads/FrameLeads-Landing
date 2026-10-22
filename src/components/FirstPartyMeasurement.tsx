"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observeMeasurement } from "../measurement";
import { privacyConsentEventName } from "../privacy-consent";

export default function FirstPartyMeasurement() {
  const pathname = usePathname();
  useEffect(() => {
    let pricingVisible = false;
    const pageView = () => observeMeasurement("PAGE_VIEW");
    const consentChanged = () => {
      pageView();
      if (pricingVisible) observeMeasurement("PRICING_VIEW");
    };
    const checkoutClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('a[href*="whop.com/checkout/plan_"]')) return;
      observeMeasurement("CHECKOUT_CLICK");
    };
    pageView();
    window.addEventListener(privacyConsentEventName(), consentChanged);
    document.addEventListener("click", checkoutClick, true);
    const pricing = document.getElementById("pricing");
    let pricingObserver: IntersectionObserver | undefined;
    if (pricing && typeof IntersectionObserver !== "undefined") {
      pricingObserver = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
            pricingVisible = true;
            observeMeasurement("PRICING_VIEW");
            pricingObserver?.disconnect();
          }
        }, { threshold: 0.5 })
    }
    if (pricing) pricingObserver?.observe(pricing);
    return () => {
      window.removeEventListener(privacyConsentEventName(), consentChanged);
      document.removeEventListener("click", checkoutClick, true);
      pricingObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
