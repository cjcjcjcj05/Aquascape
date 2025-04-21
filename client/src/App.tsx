import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./components/Header";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import About from "./pages/About";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import ProfilePage from "./pages/ProfilePage";
import DesignsPage from "./pages/DesignsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

export default function App() {
  const [location] = useLocation();
  const isEditorPage = location === "/editor";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DndProvider backend={HTML5Backend}>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto">
                <Switch>
                  <Route path="/" component={Home} />
                  <ProtectedRoute path="/editor" component={Editor} />
                  <ProtectedRoute path="/profile" component={ProfilePage} />
                  <ProtectedRoute path="/designs" component={DesignsPage} />
                  <Route path="/about" component={About} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/forgot-password" component={ForgotPasswordPage} />
                  <Route path="/reset-password" component={ResetPasswordPage} />
                  <Route path="/verify-email" component={VerifyEmailPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </DndProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
