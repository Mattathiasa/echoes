import { NavLink, useNavigate } from "react-router-dom";
import { Mic, BookOpen, Search, Sparkles, LogOut, Settings } from "lucide-react";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/record", icon: Mic, label: "Record" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/digest", icon: Sparkles, label: "Digest" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold tracking-tight text-zinc-100">echoes</span>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="hidden sm:inline">{user?.email}</span>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn("hover:text-zinc-100 transition-colors", isActive && "text-emerald-400")
            }
          >
            <Settings size={16} />
          </NavLink>
          <button onClick={handleLogout} className="hover:text-zinc-100 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">{children}</main>

      <nav className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/record"}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-emerald-400 font-medium" : "text-zinc-500 hover:text-zinc-300",
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
