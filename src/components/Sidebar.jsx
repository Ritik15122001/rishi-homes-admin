import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import logo from "../assets/logo.png";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/designs", label: "Designs" },
  { to: "/categories", label: "Room Types" },
  { to: "/collections", label: "Collections" },
  { to: "/consultations", label: "Consultations" }
];

export default function Sidebar() {
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-full w-60 flex-none flex-col border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
        <img src={logo} alt="Rishi Home Interior" className="h-11 w-11 rounded-md" />
        <div>
          <div className="font-serif text-base font-semibold tracking-wide leading-tight">Rishi Home</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Studio Admin</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              "block rounded-lg px-3 py-2 text-sm font-medium transition " +
              (isActive ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100")
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <div className="mb-2 truncate text-xs text-neutral-500">{admin && admin.email}</div>
        <button className="btn-secondary w-full" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
