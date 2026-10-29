import React from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "./icons";
import SocialLinks from "./SocialLinks";

/** Slim footer for every page except home, whose last section plays this role. */
const Footer: React.FC = () => (
  <footer className="border-t border-white/[0.06]">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white">
        <LogoMark className="h-6 w-6" />
        <span className="font-display font-semibold">MetaSupply</span>
        <span className="text-sm">© {new Date().getFullYear()}</span>
      </Link>
      <SocialLinks size="sm" />
    </div>
  </footer>
);

export default Footer;
