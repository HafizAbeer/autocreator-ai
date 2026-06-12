"use client";

import { useEffect, useState } from "react";

/**
 * A reusable Ad component for Google AdSense.
 * Ad slots can be placed in Header, Sidebar, In-Content, and Footer.
 */
export function AdBanner({ dataAdSlot, dataAdFormat = "auto", dataFullWidthResponsive = true, className }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (window && typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  if (!isMounted) return <div className={`bg-muted/30 animate-pulse rounded-md ${className}`} />;

  return (
    <div className={`overflow-hidden flex justify-center items-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with actual Publisher ID via env later
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
