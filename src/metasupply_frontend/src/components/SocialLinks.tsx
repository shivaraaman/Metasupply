import React from "react";
import { GITHUB_URL, INSTAGRAM_URL } from "../config";
import { GitHub, Instagram } from "./icons";

/** GitHub and Instagram buttons; Instagram shows "coming soon" until its URL is set in config.ts. */
const SocialLinks: React.FC<{ size?: "sm" | "md" }> = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "btn-sm" : "";
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={`btn-ghost ${sizeClass}`}>
        <GitHub className="h-4 w-4" />
        GitHub
      </a>
      {INSTAGRAM_URL ? (
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={`btn-ghost ${sizeClass}`}>
          <Instagram className="h-4 w-4" />
          Instagram
        </a>
      ) : (
        <span className={`btn-ghost ${sizeClass} cursor-default opacity-60`} title="Instagram link coming soon">
          <Instagram className="h-4 w-4" />
          Instagram · soon
        </span>
      )}
    </div>
  );
};

export default SocialLinks;
