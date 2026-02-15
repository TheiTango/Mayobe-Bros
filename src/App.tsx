import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ReviewsSection from './components/ReviewsSection';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import EnhancedPostPage from './pages/EnhancedPostPage';
import AdvertisePage from './pages/AdvertisePage';
import PopularPosts from './pages/PopularPosts';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PostsListPage from './pages/admin/PostsListPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import PagesListPage from './pages/admin/PagesListPage';
import PageEditorPage from './pages/admin/PageEditorPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import LabelsPage from './pages/admin/LabelsPage';
import CommentsPage from './pages/admin/CommentsPage';
import SettingsPage from './pages/admin/SettingsPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="posts" element={<PostsListPage />} />
                    <Route path="posts/new" element={<PostEditorPage />} />
                    <Route path="posts/edit/:id" element={<PostEditorPage />} />
                    <Route path="pages" element={<PagesListPage />} />
                    <Route path="pages/new" element={<PageEditorPage />} />
                    <Route path="pages/edit/:id" element={<PageEditorPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="labels" element={<LabelsPage />} />
                    <Route path="comments" element={<CommentsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="media" element={<MediaLibraryPage />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:categorySlug" element={<CategoryPage />} />
                      <Route path="/category/:categorySlug/:labelSlug" element={<CategoryPage />} />
                      <Route path="/post/:categorySlug/:postSlug" element={<EnhancedPostPage />} />
                      <Route path="/post/:categorySlug/:labelSlug/:postSlug" element={<EnhancedPostPage />} />
                      <Route path="/advertise" element={<AdvertisePage />} />
                      <Route path="/popular" element={<PopularPosts />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                      <Route path="/about" element={<AboutUsPage />} />
                      <Route path="/contact" element={<ContactUsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    <ReviewsSection />
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
