// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Journey from "./pages/Journey";
import Learning from "./pages/Learning";
import Personality from "./pages/Personality";
import Diary from "./pages/Diary";
import Finance from "./pages/Finance";
import Riding from "./pages/Riding";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

// NEW
import AuthGate from "./pages/AuthGate";

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <AuthGate />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="journey" element={<Journey />} />
          <Route path="learning" element={<Learning />} />
          <Route path="personality" element={<Personality />} />
          <Route path="diary" element={<Diary />} />
          <Route path="finance" element={<Finance />} />
          <Route path="riding" element={<Riding />} />
          <Route path="goals" element={<Goals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
