"use client";

import Banner from "./homeComponents/banner";
import AboutPage from "./homeComponents/about";
import PetServices from "./homeComponents/services";
import MarqueeOffers from "./homeComponents/marquee";
import ProductSection from "./homeComponents/products";
import OfferBanner from "./homeComponents/offer";
import PricingSection from "./homeComponents/pricing";
import TestimonialSection from "./homeComponents/testimonials";
import Team from "./homeComponents/team";
import StatsSection from "./homeComponents/stats";
import ServicesMarquee from "./homeComponents/mark";
import BookAppointmentSection from "./homeComponents/bookappointment";
import WhoWeAreSection from "./homeComponents/dogpage";


export default function Home() {
  return (
      <>
        <Banner />
        <AboutPage />
        <PetServices />
        <StatsSection />
        <MarqueeOffers />
        <ProductSection />
        <OfferBanner />

        <ServicesMarquee />
        <WhoWeAreSection />

        <PricingSection />
        <Team />
        <BookAppointmentSection />

        <TestimonialSection />
      </>
  
  );
}

