import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Close, LogoMark, LogOut, Menu } from "./icons";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen ? "border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="MetaSupply home">
          <LogoMark className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[60deg]" />
          <span className="font-display text-xl font-bold tracking-tight text-white">MetaSupply</span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/verify" className={({ isActive }) => `btn-ghost btn-sm ${isActive ? "border-white/30 bg-white/10" : ""}`}>
            Verify
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-1 md:flex">
                <NavLink to="/register" className={linkClass}>Register</NavLink>
                <NavLink to="/my-documents" className={linkClass}>My documents</NavLink>
                <button onClick={logout} className="btn-ghost btn-sm ml-1" title="Log out">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="btn-ghost btn-sm px-3 md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">Log in</Link>
          )}
        </div>
      </nav>

      {isAuthenticated && menuOpen && (
        <div className="border-t border-white/[0.06] px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            <NavLink to="/register" className={linkClass}>Register</NavLink>
            <NavLink to="/my-documents" className={linkClass}>My documents</NavLink>
            <button onClick={logout} className="flex items-center gap-2 rounded-full px-4 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
