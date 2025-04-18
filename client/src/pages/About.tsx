import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="font-poppins font-bold text-3xl mb-6">About AquaDesign</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg">
          AquaDesign is a web-based aquascaping design tool that enables hobbyists to create and visualize 
          aquarium layouts through an intuitive drag-and-drop interface.
        </p>
        
        <h2 className="font-poppins font-semibold text-2xl mt-8 mb-4">Features</h2>
        <ul className="space-y-2">
          <li>Drag-and-drop interface for placing aquascaping elements (plants, rocks, wood, substrate)</li>
          <li>Pre-loaded library of common aquascaping materials and plants</li>
          <li>Basic tank layout customization (size, shape)</li>
          <li>Save and edit aquascape designs</li>
          <li>Element rotation and scaling</li>
          <li>Zooming and panning in the canvas</li>
          <li>Categorized material library with thumbnails</li>
          <li>Basic undo/redo functionality</li>
        </ul>
        
        <h2 className="font-poppins font-semibold text-2xl mt-8 mb-4">Getting Started</h2>
        <p>
          Create your first aquascape design by navigating to the Editor page. 
          Choose your tank dimensions, select from our library of aquascaping elements,
          and start designing your ideal aquascape.
        </p>
        
        <div className="mt-8">
          <Link href="/editor">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium">
              Go to Editor
            </Button>
          </Link>
        </div>
        
        <h2 className="font-poppins font-semibold text-2xl mt-8 mb-4">Aquascaping Tips</h2>
        <p>
          Here are a few tips to help you create beautiful aquascapes:
        </p>
        <ul className="space-y-2">
          <li>Follow the rule of thirds to create balanced compositions</li>
          <li>Create depth by placing smaller elements in the background</li>
          <li>Consider plant growth when designing your layout</li>
          <li>Use odd numbers of hardscape elements for a more natural look</li>
          <li>Create a focal point to draw the viewer's eye</li>
        </ul>
      </div>
    </div>
  );
}
