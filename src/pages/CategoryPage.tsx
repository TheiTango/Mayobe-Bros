import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Post, Category, Label } from '../lib/api';
import { ArrowRight } from 'lucide-react';

export default function CategoryPage() {
  const { categorySlug, labelSlug } = useParams();
  const [posts, setPosts] = useState<(Post & { category: Category; label?: Label })[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [label, setLabel] = useState<Label | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    loadData();
  }, [categorySlug, labelSlug]);

  const loadData = async () => {
    const { data: categoryData } = await api
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (categoryData) {
      setCategory(categoryData);

      const { data: labelsData } = await api
        .from('labels')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('display_order');

      if (labelsData) {
        setLabels(labelsData);
      }

      let query = api
        .from('posts')
        .select(`
          *,
          category:categories(*),
          label:labels(*)
        `)
        .eq('category_id', categoryData.id)
        .order('published_at', { ascending: false });

      if (labelSlug) {
        const { data: labelData } = await api
          .from('labels')
          .select('*')
          .eq('slug', labelSlug)
          .eq('category_id', categoryData.id)
          .maybeSingle();

        if (labelData) {
          setLabel(labelData);
          query = query.eq('label_id', labelData.id);
        }
      }

      const { data: postsData } = await query;

      if (postsData) {
        setPosts(postsData as any);
      }
    }
  };

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400 transition-colors">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-12 sm:py-16 md:py-20 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            {label ? label.name : category.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 dark:text-blue-200 max-w-3xl">
            {label ? label.description : category.description || 'Explore our curated content'}
          </p>
        </div>
      </section>

      {!labelSlug && labels.length > 0 && (
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to={`/category/${categorySlug}`}
                className={`px-3 sm:px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-colors min-h-[44px] flex items-center ${
                  !labelSlug
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </Link>
              {labels.map((lbl) => (
                <Link
                  key={lbl.id}
                  to={`/category/${categorySlug}/${lbl.slug}`}
                  className="px-3 sm:px-4 py-2 rounded-full font-medium text-sm sm:text-base bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px] flex items-center"
                >
                  {lbl.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors">No posts found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.category.slug}${post.label ? `/${post.label.slug}` : ''}/${post.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={post.featured_image || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {post.is_popular && (
                    <div className="absolute top-3 right-3 bg-yellow-500 dark:bg-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4 transition-colors leading-relaxed">
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
        )}
      </section>
    </div>
  );
}
