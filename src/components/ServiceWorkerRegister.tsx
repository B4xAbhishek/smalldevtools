"use client";

import { useEffect } from "react";

async function unregisterAllWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: never register — Next.js HMR + SW fetch interception causes request storms.
    // Also clear any leftover workers from a prior production visit on localhost.
    if (process.env.NODE_ENV === "development") {
      void unregisterAllWorkers().catch(() => undefined);
      return;
    }

    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Pick up the bumped CACHE (tinykit-v2) promptly
        void registration.update();
      })
      .catch(() => undefined);
  }, []);

  return null;
}
