import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const css = `
  .sidebar { width: 68px; background: #08090d; border-right: 1px solid #111116; display: flex; flex-direction: column; align-items: center; padding: 22px 0; gap: 4px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
  .sidebar-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #c084fc, #60d8fa); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 16px; color: #fff; cursor: pointer; }
  .nav-btn { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; background: transparent; color: rgba(255,255,255,0.26); font-size: 18px; transition: all 0.18s; position: relative; }
  .nav-btn:hover { background: #0c0d12; color: rgba(255,255,255,0.52); }
  .nav-btn.active { background: rgba(192,132,252,0.1); color: #c084fc; }
  .nav-dot { position: absolute; top: 7px; right: 7px; width: 5px; height: 5px; border-radius: 50%; background: #ff5f7e; border: 1.5px solid #08090d; }
  .sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 4px; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #1a0a30, #0d0520); border: 1.5px solid rgba(192,132,252,0.25); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12px; color: #c084fc; cursor: pointer; transition: all 0.18s; }
  .avatar:hover { border-color: rgba(192,132,252,0.5); }
  .avatar.active { border-color: #c084fc; background: rgba(192,132,252,0.15); }
`;

const NAV = [
  { icon: "🏠", path: "/dashboard", label: "Home"     },
  { icon: "📞", path: "/dialler",  label: "Dialler"  },
  { icon: "👥", path: "/contacts", label: "Contacts" },
  { icon: "💬", path: "/messages", label: "Messages", dot: true },
  { icon: "🏅", path: "/badge",    label: "Badge"    },
  { icon: "⚙",  path: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <style>{css}</style>
      <div className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>en</div>
        {NAV.map((n, i) => (
          <button
            key={i}
            className={`nav-btn${isActive(n.path) ? " active" : ""}`}
            title={n.label}
            onClick={() => navigate(n.path)}
          >
            {n.icon}
            {n.dot && <span className="nav-dot" />}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div
            className={`avatar${location.pathname === "/profile" ? " active" : ""}`}
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            {profile?.enumber ? profile.enumber.replace("E-", "").substring(0, 2) : "EN"}
          </div>
        </div>
      </div>
    </>
  );
}
