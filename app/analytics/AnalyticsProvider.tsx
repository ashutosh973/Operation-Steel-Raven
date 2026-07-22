"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "./client";

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
