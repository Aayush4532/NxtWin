import Aurora from "./components/Aurora";
import RippleGrid from "./components/RippleGrid";
import ShinyText from "./components/ShinyText";

export default function Home() {
  return (
    <main className="relative w-screen h-screen flex items-center justify-center overflow-hidden text-white">
      <div className="landing-page">
        <Aurora
          colorStops={["#7CFF67", "#B19EEF", "#5E9CF5"]}
          blend={0.5}
          amplitude={0.7}
          speed={0.7}
        />

        <div
          style={{
            position: "relative",
            height: "500px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background layer */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <RippleGrid
              enableRainbow={false}
              gridColor="#000000"
              rippleIntensity={0.05}
              gridSize={10}
              gridThickness={15}
              mouseInteraction={true}
              mouseInteractionRadius={1.2}
              opacity={0.8}
            />
          </div>

          {/* Foreground layer */}
          <section className="z-10 text-center px-6">
            <ShinyText
              text="Just some shiny text!"
              disabled={false}
              speed={3}
              className="text-5xl font-bold mb-4"
            />
            <p className="text-lg mb-6">A stunning gambling solution</p>
            <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition">
              Get Started
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
