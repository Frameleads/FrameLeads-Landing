"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observeMeasurement } from "../measurement";
import { privacyConsentEventName } from "../privacy-consent";

export default function FirstPartyMeasurement() {
  const pathname = usePathname();
  useEffect(() => {
    const pageView = () => observeMeasurement("PAGE_VIEW");
    const checkoutStart = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('a[href*="whop.com/checkout/plan_"]')) return;
      observeMeasurement("CHECKOUT_INITIATED");
    };
    pageView();
    window.addEventListener(privacyConsentEventName(), pageView);
    document.addEventListener("click", checkoutStart, true);
    return () => {
      window.removeEventListener(privacyConsentEventName(), pageView);
      document.removeEventListener("click", checkoutStart, true);
    };
  }, [pathname]);

  return null;
}
