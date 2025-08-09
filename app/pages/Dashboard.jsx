import Header from "../components/layout/Header";
import Hero from "../components/sections/Hero";
import Categories from "../components/sections/Categories";
import Portfolio from "../components/sections/Portfolio";
import Footer from "../components/layout/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <Categories />
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
