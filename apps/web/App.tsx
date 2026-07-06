import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/index";
import Inventory from "./pages/inventory";
import Ledger from "./pages/ledger";
import Receipt from "./pages/receipt";
import AppHome from "./pages/app";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/receipts" element={<Receipt />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
