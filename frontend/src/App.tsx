import { useEffect, useState } from "react";
import { getCurrentDevice } from "./api/endpoints";

/**
 * Spec 0/1 skeleton.
 *
 * Minimal by design: proves the Vite build renders through Flask and that the
 * typed API client reaches the backend (dev proxy or same origin). The real
 * pages arrive in Specs 3-7.
 */
export default function App() {
  const [backend, setBackend] = useState("checking…");

  useEffect(() => {
    let cancelled = false;

    getCurrentDevice()
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setBackend(`connected — selected device: ${result.data.selected_device}`);
        } else {
          setBackend(`backend error (HTTP ${result.status})`);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setBackend(`not reachable (${String(error)})`);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
      <h1>VOC Monitor — React frontend</h1>
      <p>Spec 0/1 tooling skeleton.</p>
      <p>Backend: {backend}</p>
    </main>
  );
}
