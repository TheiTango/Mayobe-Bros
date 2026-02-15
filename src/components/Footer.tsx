import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Lock } from 'lucide-react';
import { api, Category } from '../lib/api';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Footer() {
  const [footerCategories, setFooterCategories] = useState<Category[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    loadFooterCategories();
  }, []);

  const loadFooterCategories = async () => {
    const { data } = await api
      .from('categories')
      .select('*')
      .eq('show_in_footer', true)
      .order('display_order');

    if (data) {
      setFooterCategories(data);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-12 sm:mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src={settings.logo_url || '/mayobebroslogo copy copy.png'}
              alt={settings.site_title || 'Mayobe Bros'}
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[280px] object-contain mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              {settings.site_description || 'Your trusted source for knowledge, insights, and stories that matter. Exploring education, business, technology, history, and more.'}
            </p>
            <div className="flex space-x-4">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="text-gray-400 hover:text-white transition-colors">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link to="/popular" className="text-gray-400 hover:text-white transition-colors">
                  Popular Posts
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Subscribe to get the latest updates and articles delivered to your inbox.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 sm:px-4 py-2 rounded-l-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              />
              <button className="bg-blue-600 px-3 sm:px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                <Mail size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-center sm:text-left text-sm sm:text-base">
              {settings.footer_copyright || `© ${new Date().getFullYear()} Mayobe Bros. All rights reserved.`}
            </p>
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 hover:border-gray-600 text-sm sm:text-base"
            >
              <Lock size={14} className="sm:w-4 sm:h-4" />
              <span className="font-medium">Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
