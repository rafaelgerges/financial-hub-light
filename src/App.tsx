import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Payables from "./pages/Payables";
import Receivables from "./pages/Receivables";
import CashFlow from "./pages/CashFlow";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <FinanceProvider>
          <PWAUpdatePrompt />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/payables" element={<Payables />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/cashflow" element={<CashFlow />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FinanceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
