import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Post, Category } from '../lib/api';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<(Post & { category: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: postsData } = await api
      .from('posts')
      .select(`
        *,
        category:categories(*)
      `)
      .order('published_at', { ascending: false })
      .limit(6);

    if (postsData) {
      setRecentPosts(postsData as any);
    }

    const { data: categoriesData } = await api
      .from('categories')
      .select('*')
      .order('display_order');

    if (categoriesData) {
      setCategories(categoriesData);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <section className="relative h-[400px] sm:h-[500px] md:h-[900px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3177662/pexels-photo-3177662.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">Mayobe Bros</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200">
            Empowering minds with knowledge, insights, and stories that inspire
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/popular"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 transition-all transform hover:scale-105 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              Explore Popular Posts
            </Link>
            <Link
              to="/advertise"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all transform hover:scale-105 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Advertise With Us
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">Recent Posts</h2>
          <Link to="/all-posts" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors text-sm sm:text-base">
            View All
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recentPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/post/${post.category.slug}/${post.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all transform hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={post.featured_image || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-blue-600 dark:bg-blue-500 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold">
                  {post.category.name}
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4 transition-colors">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center transition-colors">Explore Our Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl dark:hover:shadow-2xl transition-all transform hover:-translate-y-1 group"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors">
                  {category.description || 'Discover amazing content and insights'}
                </p>
                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 transition-colors">
                  Explore
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
