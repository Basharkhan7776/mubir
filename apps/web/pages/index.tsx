import { EarlyAccess } from "@/components/EarlyAccess";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-white text-black selection:bg-black selection:text-white">
      <Hero />
      <FeatureShowcase />
      <EarlyAccess />
    </main>
  );
}
