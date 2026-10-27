"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observeMeasurement } from "../measurement";
import { privacyConsentEventName } from "../privacy-consent";

export default function FirstPartyMeasurement() {
  const pathname = usePathname();
  useEffect(() => {
    let pricingVisible = false;
    let pricingEncountered = false;
    let exposureTimer: number | undefined;
    const pageView = () => observeMeasurement("PAGE_VIEW");
    const consentChanged = () => {
      pageView();
      if (pricingEncountered) observeMeasurement("PRICING_VIEW");
    };
    const checkoutClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      let url: URL;
      try { url = new URL(link.href); } catch { return; }
      const nativeCheckout = url.origin === window.location.origin &&
        /^\/checkout\/(?:micro-pilot|core|enterprise)\/?$/.test(url.pathname);
      const hostedWhopCheckout = ["whop.com", "www.whop.com", "sandbox.whop.com"].includes(url.hostname) &&
        /^\/checkout\/plan_[A-Za-z0-9]+$/.test(url.pathname);
      if (nativeCheckout || hostedWhopCheckout) observeMeasurement("CHECKOUT_CLICK");
    };
    pageView();
    window.addEventListener(privacyConsentEventName(), consentChanged);
    document.addEventListener("click", checkoutClick, true);
    const pricing = document.querySelector("#pricing h2");
    let pricingObserver: IntersectionObserver | undefined;
    if (pricing && typeof IntersectionObserver !== "undefined") {
      pricingObserver = new IntersectionObserver(([entry]) => {
        pricingVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
        if (!pricingVisible) {
          window.clearTimeout(exposureTimer);
          exposureTimer = undefined;
          return;
        }
        if (pricingEncountered || exposureTimer !== undefined) return;
        exposureTimer = window.setTimeout(() => {
          exposureTimer = undefined;
          if (!pricingVisible) return;
          pricingEncountered = true;
          pricingObserver?.disconnect();
          observeMeasurement("PRICING_VIEW");
        }, 500);
      }, { threshold: 0.5 });
    }
    if (pricing) pricingObserver?.observe(pricing);
    return () => {
      window.removeEventListener(privacyConsentEventName(), consentChanged);
      document.removeEventListener("click", checkoutClick, true);
      window.clearTimeout(exposureTimer);
      pricingObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
