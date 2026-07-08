import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "next-themes";
import Home from "./pages/index";
import Inventory from "./pages/inventory";
import Ledger from "./pages/ledger";
import Receipt from "./pages/receipt";
import AppHome from "./pages/app";
import DashboardOverview from "./pages/dashboard-overview";

const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<AppHome />}>
            <Route index element={<DashboardOverview />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="receipts" element={<Receipt />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
