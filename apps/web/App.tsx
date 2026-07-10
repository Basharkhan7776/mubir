import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/lib/store";
import { queryClient } from "@/lib/query-client";
import Home from "./pages/index";
import Inventory from "./pages/inventory";
import Ledger from "./pages/ledger";
import Receipt from "./pages/receipt";
import ProtectedApp from "./pages/app";
import DashboardOverview from "./pages/dashboard-overview";
import NotFound from "./pages/not-found";

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/app" element={<ProtectedApp />}>
                <Route index element={<DashboardOverview />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="ledger" element={<Ledger />} />
                <Route path="receipts" element={<Receipt />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default App;
