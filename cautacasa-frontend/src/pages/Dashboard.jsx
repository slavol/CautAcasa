import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import CTAButtons from "../components/CTAButtons";
import Footer from "../components/Footer";

export default function Dashnoard() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Hero />
        <FeatureCards />
        {/* <CTAButtons /> */}
        <Footer />
      </div>
    </>
  );
}