import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/store/editorStore";
import { useState } from "react";
import { 
  FaMoon, 
  FaSun, 
  FaSave, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaTrash, 
  FaExclamationTriangle,
  FaEllipsisV 
} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const saveProject = useStore(state => state.saveProject);
  const clearHistory = useStore(state => state.clearHistory);
  const tankDimensions = useStore(state => state.tankDimensions);
  
  const openSaveDialog = () => {
    setDesignName(`Aquascape ${tankDimensions.width}×${tankDimensions.height}cm (${new Date().toLocaleDateString()})`);
    setSaveDialogOpen(true);
  };
  
  const handleSaveProject = async () => {
    if (!designName.trim()) {
      toast({
        title: "Design Name Required",
        description: "Please provide a name for your design.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Override the store's saveProject to include the custom name
      const state = useStore.getState();
      const { tankDimensions, elements } = state;
      
      // Format data for API
      const designData = {
        name: designName.trim(),
        width: tankDimensions.width,
        height: tankDimensions.height,
        depth: tankDimensions.depth,
        elements: elements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Make API request to save design
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to save design to server');
      }
      
      setSaveDialogOpen(false);
      toast({
        title: "Design Saved",
        description: "Your aquascape design has been saved to your account.",
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your design. Your work is still saved locally.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      }
    });
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: "Coming Soon",
      description: "Dark mode is not yet implemented.",
    });
  };
  
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-1">
        <Link href="/">
          <h1 className="font-poppins font-bold text-2xl text-primary cursor-pointer">AquaDesign</h1>
        </Link>
        <span className="text-sm bg-[#9BE36D] text-ui-dark px-2 py-0.5 rounded-full font-medium">Beta</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/">
          <span className={`font-medium cursor-pointer ${location === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-ui-dark hover:text-primary'} transition`}>
            Home
          </span>
        </Link>
        <Link href="/editor">
          <span className={`font-medium cursor-pointer ${location === '/editor' ? 'text-primary border-b-2 border-primary pb-1' : 'text-ui-dark hover:text-primary'} transition`}>
            Editor
          </span>
        </Link>
        <Link href="/designs">
          <span className={`font-medium cursor-pointer ${location === '/designs' ? 'text-primary border-b-2 border-primary pb-1' : 'text-ui-dark hover:text-primary'} transition`}>
            My Designs
          </span>
        </Link>
        {/* Asset Generator hidden from regular users - accessible via direct URL */}
        <Link href="/about">
          <span className={`font-medium cursor-pointer ${location === '/about' ? 'text-primary border-b-2 border-primary pb-1' : 'text-ui-dark hover:text-primary'} transition`}>
            About
          </span>
        </Link>
      </nav>
      
      <div className="flex items-center space-x-4">
        <button 
          className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition" 
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <FaSun className="text-ui-dark"/> : <FaMoon className="text-ui-dark"/>}
        </button>
        
        {location === '/editor' && (
          <>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition flex items-center"
              onClick={openSaveDialog}
            >
              <FaSave className="mr-2" /> Save Project
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FaEllipsisV className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    clearHistory();
                    toast({
                      title: "History Cleared",
                      description: "The undo/redo history has been reset to save storage space.",
                    });
                  }}
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  <span>Reset History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.open('/reset-storage.html', '_blank');
                  }}
                >
                  <FaExclamationTriangle className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Storage Reset Tool</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Your Design</DialogTitle>
                  <DialogDescription>
                    Give your aquascape design a name to save it to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="designName">Design Name</Label>
                  <Input 
                    id="designName"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="My Aquascape Design"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProject}
                    disabled={isSaving || !designName.trim()}
                    className="ml-2"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Design
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium hidden md:block">
              Hi, {user.username}
            </div>
            <Link href="/profile">
              <Button 
                variant="ghost"
                className="flex items-center"
                size="sm"
              >
                <FaCog className="mr-2" /> Profile
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button className="flex items-center">
              <FaUser className="mr-2" /> Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
