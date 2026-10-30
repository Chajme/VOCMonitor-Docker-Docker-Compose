import { useEffect, useState } from "react";
import { getCurrentDevice } from "../api/endpoints";

/**
 * Temporary Spec 2 page: renders inside the shared Layout so the shell can be
 * compared side by side with an existing Jinja page. Replaced in Spec 3.
 */
export default function ShellPreviewPage() {
  const [backend, setBackend] = useState("checking…");

  useEffect(() => {
    let cancelled = false;

    getCurrentDevice()
      .then((result) => {
        if (cancelled) return;
        setBackend(
          result.ok
            ? `connected — selected device: ${result.data.selected_device}`
            : `backend error (HTTP ${result.status})`,
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) setBackend(`not reachable (${String(error)})`);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="main-section-chart">
      <div className="chart-flexbox-container">
        <div className="settings-container">
          <h2>Shared shell preview</h2>
          <p>Spec 2: Layout, Sidebar, menu toggle and notifications panel.</p>
          <p>Backend: {backend}</p>
        </div>
      </div>
    </div>
  );
}
