/**
 * Scrolls to a home page section. Plain "#id" links don't work here because the
 * hash router uses the URL hash for page routes.
 */
export const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
