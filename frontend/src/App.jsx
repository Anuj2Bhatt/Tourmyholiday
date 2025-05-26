import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import History from './pages/History';
import Packages from './pages/Packages';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Webstories from './pages/Webstories';
import Wildlife from './pages/Wildlife';
import Contact from './pages/Contact';
import DistrictDetail from './pages/DistrictDetail';
import ManageStates from './components/admin/ManageStates';
import ManageStateHistory from './components/admin/ManageStateHistory';
import ManageDistricts from './components/admin/ManageDistricts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import HistoryDetail from './pages/HistoryDetail';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import ManageArticles from './components/admin/ManageArticles';
import ManagePackages from './components/admin/ManagePackages';
import HomePageGallery from './components/HomePageGallery';
import PackageDetails from './pages/PackageDetails';
import States from './components/States';
import StatePage from './components/StatePage';
import HotelsView from './components/HotelsView';
import UnionTeritory from './pages/UnionTeritory';
import TerritoryDetail from './pages/TerritoryDetail';
import TerritoryHistoryDetail from './pages/TerritoryHistoryDetail';
import TerritoryDistrictDetail from './pages/TerritoryDistrictDetail';
import SubdistrictDetail from './pages/SubdistrictDetail';
import AdminLogin from './pages/AdminLogin';
import VillageDashboard from './pages/VillageDashboard';
import VillageView from './pages/VillageView';

function App() {
  const isAdminRoute = window.location.pathname.includes('/admin');

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ToastContainer
            position="top-right"
            autoClose={5000}  
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          {!isAdminRoute && <Header />}
          <main className={isAdminRoute ? '' : 'main-content'}>
            <Routes>
              <Route path="/" element={
                <div className="home-page">
                  <div className="gallery-section">
                    <HomePageGallery />
                  </div>
                  <div className="states-section">
                    <States />
                  </div>
                  <div className="home-content">
                    <Home />
                  </div>
                </div>
              } />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/articles" 
                element={
                  <ProtectedRoute>
                    <ManageArticles />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/packages" 
                element={
                  <ProtectedRoute>
                    <ManagePackages />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/districts" 
                element={
                  <ProtectedRoute>
                    <ManageDistricts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/states" 
                element={
                  <ProtectedRoute>
                    <ManageStates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/state-history" 
                element={
                  <ProtectedRoute>
                    <ManageStateHistory />
                  </ProtectedRoute>
                } 
              />
              <Route path="/union-territories" element={<UnionTeritory />} />
              <Route path="/territory/:slug" element={<TerritoryDetail />} />
              <Route path="/history/:slug" element={<HistoryDetail />} />
              <Route path="/history" element={<History />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/:slug" element={<PackageDetails />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/webstories" element={<Webstories />} />
              <Route path="/wildlife" element={<Wildlife />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/district/:slug" element={<DistrictDetail />} />
              <Route path="/hotels" element={<HotelsView />} />
              <Route path="/:stateName" element={<StatePage />} />
              <Route path="/territory-district/:slug" element={<TerritoryDistrictDetail />} />
              <Route path="/subdistrict-detail/:slug" element={<SubdistrictDetail />} />
              <Route path="/village" element={<VillageDashboard />} />
              <Route path="territory-history/:slug" element={<TerritoryHistoryDetail />} />
              <Route path="/village/:id" element={<VillageView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 