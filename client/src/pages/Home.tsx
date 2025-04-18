import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl w-full text-center">
          <h1 className="font-poppins font-bold text-3xl md:text-5xl text-foreground mb-6">
            Design Your Dream Aquascape
          </h1>
          <p className="text-ui-light text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Create stunning aquarium layouts with our intuitive drag-and-drop designer. 
            Visualize your aquascape before bringing it to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/editor">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md font-medium text-lg">
                Start Designing
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-8 py-6 rounded-md font-medium text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-center mb-12">
            Why Use AquaDesign?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg">
              <div className="w-12 h-12 bg-highlight rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">Easy to Use</h3>
              <p className="text-ui-light">Simple drag-and-drop interface makes aquascaping design accessible to everyone.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg">
              <div className="w-12 h-12 bg-highlight rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">Realistic Preview</h3>
              <p className="text-ui-light">See how your aquascape will look with realistic plants, rocks and substrate options.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg">
              <div className="w-12 h-12 bg-highlight rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">Save Your Designs</h3>
              <p className="text-ui-light">Create, save, and edit multiple aquascaping projects as you refine your vision.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
