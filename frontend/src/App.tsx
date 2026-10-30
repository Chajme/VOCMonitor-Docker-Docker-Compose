import { useEffect, useState } from "react";

/**
 * Spec 0 skeleton.
 *
 * Deliberately minimal: it proves that the Vite build renders through Flask and
 * that API calls reach the backend (dev proxy or same origin). The real pages
 * arrive in Specs 3-7.
 */
export default function App() {
  const [backend, setBackend] = useState("checking…");

  useEffect(() => {
    let cancelled = false;

    fetch("/current_device")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ selected_device: string }>;
      })
      .then((data) => {
        if (!cancelled) setBackend(`connected — selected device: ${data.selected_device}`);
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
      <p>Spec 0 tooling skeleton.</p>
      <p>Backend: {backend}</p>
    </main>
  );
}
