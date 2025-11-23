// src/components/PasswordForm.tsx
import React, { useState } from "react";

interface Props { onSuccess: () => void; }

// ALLOW ANY SPECIAL CHARACTER
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const PasswordForm: React.FC<Props> = ({ onSuccess }) => {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const envPw = (import.meta.env.VITE_SITE_PASSWORD || "").trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // First check pattern validity
    if (!PASSWORD_REGEX.test(pw)) {
      setError("Password must contain uppercase, lowercase, number, special char and be 8+ characters.");
      return;
    }

    // Then compare with ENV
    if (pw === envPw) {
      onSuccess();
    } else {
      setError("Incorrect password.");
      const el = document.querySelector(".pw-input");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="pw-input w-full p-3 rounded-lg bg-white/10 text-white outline-none"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Enter password"
      />

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <button
        type="submit"
        className="mt-2 w-full py-2 rounded-lg bg-blue-600 text-white"
      >
        Unlock
      </button>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          50% { transform: translateX(6px) }
          75% { transform: translateX(-4px) }
          100% { transform: translateX(0) }
        }
        .animate-shake { animation: shake 0.45s; }
      `}</style>
    </form>
  );
};

export default PasswordForm;
