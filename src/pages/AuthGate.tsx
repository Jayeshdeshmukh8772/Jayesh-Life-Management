// src/pages/AuthGate.tsx
import React, { useState } from "react";
import PatternLock from "../components/PatternLock";
import PasswordForm from "../components/PasswordForm";
import { supabase } from "../lib/supabase";

const AuthGate: React.FC = () => {
  const [tab, setTab] = useState<"pattern" | "password">("pattern");
  const [error, setError] = useState("");

  const loginEmail = import.meta.env.VITE_SITE_USER_EMAIL;
  const loginPassword = import.meta.env.VITE_SITE_USER_PASSWORD;

  // When pattern or password succeeds → perform Supabase login
  const handleAuthSuccess = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      console.error("Supabase login error:", error.message);
      setError("Authentication failed. Check your .env credentials.");
      return;
    }

    // Redirect after successful login
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">

        {/* TAB BUTTONS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("pattern")}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === "pattern"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            Pattern Lock
          </button>

          <button
            onClick={() => setTab("password")}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === "password"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            Password
          </button>
        </div>

        {/* AUTH UI */}
        <div>
          {tab === "pattern" ? (
            <PatternLock onSuccess={handleAuthSuccess} />
          ) : (
            <PasswordForm onSuccess={handleAuthSuccess} />
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-400 text-center mt-4 text-sm">{error}</p>
        )}

        <p className="text-sm text-white/50 mt-6 text-center">
          Pattern and Password secrets can be changed in <code>.env</code>.
        </p>
      </div>
    </div>
  );
};

export default AuthGate;
