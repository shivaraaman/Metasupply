import Header from "./Header";
import Footer from "./Footer";
import Navbar from "../Navbar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 p-4">{children}</main>
      <Footer />
    </div>
  );
}