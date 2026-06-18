import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ImportPage from "@/pages/ImportPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DispatchPage from "@/pages/DispatchPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/import" replace />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/dispatch" element={<DispatchPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
