import React from "react";
import Hero from "./Hero";
import NavBar from "./NavBar";
import { ComparisonPage } from "./ComparisonPage";
import { CardsPage } from "./CardsPage";
import { PricingPage } from "./PricingPage";
import { ReviewsPage } from "./ReviewsPage";
import { FAQsPage } from "./FAQsPage";
import { Footer } from "./Footer";
const Home: React.FC = () => {
  return (
    <div className="h-full overflow-x-hidden">
      <NavBar />
      <Hero data-midnight="blue" />
      {/* bg-gray-100 dark:bg-neutral-900/50 */}
      <ComparisonPage />
      <CardsPage />
      <ReviewsPage />
      <PricingPage />
      <FAQsPage />
      <Footer />
    </div>
  );
};

export default Home;
