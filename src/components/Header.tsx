import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { api, Category, Label } from '../lib/api';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Record<string, Label[]>>({});
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data: categoriesData } = await api
      .from('categories')
      .select('*')
      .order('display_order');

    if (categoriesData) {
      setCategories(categoriesData);

      const { data: labelsData } = await api
        .from('labels')
        .select('*')
        .order('display_order');

      if (labelsData) {
        const labelsByCategory = labelsData.reduce((acc, label) => {
          if (!acc[label.category_id]) {
            acc[label.category_id] = [];
          }
          acc[label.category_id].push(label);
          return acc;
        }, {} as Record<string, Label[]>);
        setLabels(labelsByCategory);
      }
    }
  };

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40 transition-colors">
        <nav className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_title || 'Mayobe Bros'}
                  className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[240px] object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-2xl sm:text-3xl">📰</div>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {settings.site_title || 'Mayobe Bros'}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <ThemeToggle />
              <button
                className="lg:hidden text-gray-800 dark:text-gray-200 p-1"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Home
            </Link>
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {category.name}
                </Link>
                {labels[category.id] && labels[category.id].length > 0 && hoveredCategory === category.id && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 min-w-[200px] border border-gray-100 dark:border-gray-700">
                    {labels[category.id].map((label) => (
                      <Link
                        key={label.id}
                        to={`/category/${category.slug}/${label.slug}`}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {label.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/advertise"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Advertise
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              to="/"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {categories.map((category) => (
              <div key={category.id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
                {labels[category.id] && labels[category.id].length > 0 && (
                  <div className="ml-4">
                    {labels[category.id].map((label) => (
                      <Link
                        key={label.id}
                        to={`/category/${category.slug}/${label.slug}`}
                        className="block py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {label.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/advertise"
              className="block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Advertise
            </Link>
          </div>
        )}
      </nav>
    </header>
    </>
  );
}
