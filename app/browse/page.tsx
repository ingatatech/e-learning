import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BrowseCoursesContent } from "@/components/browse-courses-content"

export const metadata = {
  title: "Browse Courses | Ingata E-learning",
  description: "Explore our full collection of online courses across multiple categories and skill levels.",
}

export default function BrowsePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto max-w-7xl">
          <BrowseCoursesContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
