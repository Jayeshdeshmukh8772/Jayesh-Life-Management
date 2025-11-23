// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  Home, User, Briefcase, BookOpen, Brain, BookMarked,
  DollarSign, Bike, Target, Settings, Menu, X, LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/portfolio", icon: User, label: "Portfolio" },
  { path: "/journey", icon: Briefcase, label: "Cognizant Journey" },
  { path: "/learning", icon: BookOpen, label: "Learning & Work" },
  { path: "/personality", icon: Brain, label: "Personality" },
  { path: "/diary", icon: BookMarked, label: "Diary" },
  { path: "/finance", icon: DollarSign, label: "Finance" },
  { path: "/riding", icon: Bike, label: "Riding & Travel" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white/10 backdrop-blur-xl border-r border-white/20
          transition-transform duration-300 z-40 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Jayesh
          </h1>
          <p className="text-sm text-gray-400 mt-1">Life Management</p>
        </div>

        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${active
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10"}
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 m-3 rounded-lg 
          text-red-300 hover:bg-red-500/20 hover:text-white transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
