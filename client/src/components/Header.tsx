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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const saveProject = useStore(state => state.saveProject);
  const clearHistory = useStore(state => state.clearHistory);
  
  const handleSaveProject = () => {
    saveProject();
    toast({
      title: "Project Saved",
      description: "Your aquascape design has been saved.",
    });
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
              onClick={handleSaveProject}
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
