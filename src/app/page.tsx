import { HeroSection } from "@/components/layout/HeroSection"
import { CategoriesSection } from "@/components/layout/CategoriesSection"
import { HowItWorksSection } from "@/components/layout/HowItWorksSection"
import { CTASection } from "@/components/layout/CTASection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  )
}
