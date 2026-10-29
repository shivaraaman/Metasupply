import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTotalDocuments } from "../services/documents";
import HeroSection from "../components/home/HeroSection";
import StartSection from "../components/home/StartSection";
import HowSection from "../components/home/HowSection";
import ConnectSection from "../components/home/ConnectSection";
import SectionDots from "../components/home/SectionDots";

const HomePage: React.FC = () => {
  const { actor } = useAuth();
  const [total, setTotal] = useState<bigint | null>(null);

  useEffect(() => {
    if (actor) getTotalDocuments(actor).then(setTotal).catch(() => setTotal(null));
  }, [actor]);

  return (
    <>
      <SectionDots />
      <HeroSection total={total} />
      <StartSection />
      <HowSection />
      <ConnectSection />
    </>
  );
};

export default HomePage;
