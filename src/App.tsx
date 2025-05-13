
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupConfirmation from "./pages/SignupConfirmation";
import Submit from "./pages/submit/Submit";
import EditListing from "./pages/EditListing"; // Import the new EditListing page
import Pricing from "./pages/Pricing";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyTerms from "./pages/PrivacyTerms";
import Favorites from "./pages/Favorites"; // Import the new Favorites page
import { FormDataProvider } from "./contexts/FormDataContext";
import PreviewListing from "./pages/PreviewListing";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <TooltipProvider>
            <FormDataProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/business/:id" element={<ListingDetail />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signup-confirmation" element={<SignupConfirmation />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/preview-listing" element={<PreviewListing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<PrivacyTerms />} />
                <Route path="/favorites" element={<Favorites />} /> {/* Add the new Favorites route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </FormDataProvider>
          </TooltipProvider>
        </BrowserRouter>
      </DndProvider>
    </QueryClientProvider>
  );
};

export default App;
