import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AppDataProvider } from '@/src/context/AppDataContext';
import { LandingPage } from '@/src/pages/LandingPage';
import { MarketplacePage } from '@/src/pages/MarketplacePage';
import { ProductDetailPage } from '@/src/pages/ProductDetailPage';
import { CartCheckoutPage } from '@/src/pages/CartCheckoutPage';
import { SmartAgriculturePage } from '@/src/pages/SmartAgriculturePage';
import { AboutPage } from '@/src/pages/AboutPage';
import { LoginPage, RegisterPage } from '@/src/pages/AuthPages';
import { FarmerDashboard } from '@/src/pages/FarmerDashboard';
import { CustomerDashboard } from '@/src/pages/CustomerDashboard';
import { AdminDashboard } from '@/src/pages/AdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartCheckoutPage />} />
            <Route path="/smart-agriculture" element={<SmartAgriculturePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Role-Protected Dashboards */}
            <Route path="/farmer/*" element={<FarmerDashboard />} />
            <Route path="/customer/*" element={<CustomerDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </AppDataProvider>
    </LanguageProvider>
  );
}
