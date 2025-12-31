import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Editor from "./pages/Editor";
import PublicPage from "./pages/PublicPage";
import Preview from "./pages/Preview";
import Leads from "./pages/Leads";
import Wizard from "./pages/Wizard";
import UgcOnly from "./pages/UgcOnly";
import PageBuilder from "./pages/PageBuilder";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/builder" element={<Dashboard />} />
            <Route path="/builder/page-builder" element={<PageBuilder />} />
            <Route path="/builder/library" element={<Library />} />
            <Route path="/builder/wizard" element={<Wizard />} />
            <Route path="/builder/ugc" element={<UgcOnly />} />
            <Route path="/builder/pages/:id" element={<Editor />} />
            <Route path="/builder/leads" element={<Leads />} />
            <Route path="/preview/:id" element={<Preview />} />
            <Route path="/p/:slug" element={<PublicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
