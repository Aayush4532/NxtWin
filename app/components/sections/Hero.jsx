import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const Hero = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section aria-labelledby="hero-title" className="container mx-auto px-4">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: `radial-gradient(600px 300px at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.25), transparent 60%), var(--gradient-subtle)`,
        }}
      >
        <div className="px-6 py-12 md:px-12 md:py-16 grid md:grid-cols-2 items-center gap-8">
          <div>
            <h1
              id="hero-title"
              className="text-4xl md:text-5xl font-semibold leading-tight"
            >
              Personal Dashboard Landing
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              A clean hub for your search, categories and portfolio — crafted
              with a colorful, modern design system.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="hero">Explore Categories</Button>
              <Button variant="outline">View Portfolio</Button>
            </div>
          </div>
          <aside className="md:justify-self-end">
            <div className="rounded-xl border bg-card p-4 w-full md:w-[320px]">
              <p className="text-sm font-medium">News for you</p>
              <p className="text-sm text-muted-foreground mt-1">
                Market opens strong today. Your portfolio is up 2.4%.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;
