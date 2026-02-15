import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Post, Category, Label } from '../lib/api.ts';
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react';

export default function PostPage() {
  const { categorySlug, labelSlug, postSlug } = useParams();
  const [post, setPost] = useState<(Post & { category: Category; label?: Label }) | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<(Post & { category: Category })[]>([]);

  useEffect(() => {
    loadPost();
  }, [categorySlug, labelSlug, postSlug]);

  const loadPost = async () => {
    const { data: categoryData } = await api
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (!categoryData) return;

    let query = api
      .from('posts')
      .select(`
        *,
        category:categories(*),
        label:labels(*)
      `)
      .eq('slug', postSlug)
      .eq('category_id', categoryData.id);

    if (labelSlug) {
      const { data: labelData } = await api
        .from('labels')
        .select('*')
        .eq('slug', labelSlug)
        .eq('category_id', categoryData.id)
        .maybeSingle();

      if (labelData) {
        query = query.eq('label_id', labelData.id);
      }
    }

    const { data: postData } = await query.maybeSingle();

    if (postData) {
      setPost(postData as any);

      await api
        .from('posts')
        .update({ views: postData.views + 1 })
        .eq('id', postData.id);

      const { data: relatedData } = await api
        .from('posts')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', postData.category_id)
        .neq('id', postData.id)
        .limit(3);

      if (relatedData) {
        setRelatedPosts(relatedData as any);
      }
    }
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400 transition-colors">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to={`/category/${post.category.slug}${post.label ? `/${post.label.slug}` : ''}`}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to {post.label?.name || post.category.name}
        </Link>

        <div className="mb-6">
          <span className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            {post.category.name}
            {post.label && ` • ${post.label.name}`}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 transition-colors">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{post.views} views</span>
            </div>
          </div>
        </div>

        {post.featured_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none mb-12">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/post/${relatedPost.category.slug}/${relatedPost.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={relatedPost.featured_image || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
