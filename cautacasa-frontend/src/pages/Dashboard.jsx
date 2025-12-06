import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Hero />
        <FeatureCards />
        <Footer />
      </div>
    </>
  );
}