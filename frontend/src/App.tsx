import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { NotificationProvider } from "./components/notifications/NotificationProvider";
import ShellPreviewPage from "./pages/ShellPreviewPage";

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route element={<Layout variant="basic" />}>
          <Route path="*" element={<ShellPreviewPage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}
