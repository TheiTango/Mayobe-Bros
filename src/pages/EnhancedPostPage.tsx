import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Post, Category, Label, Comment, Reaction } from '../lib/api';
import { Calendar, Eye, User, ArrowLeft, Heart, Laugh, Frown, ThumbsUp, AlertCircle, Angry } from 'lucide-react';

const reactionIcons = {
  love: { icon: Heart, emoji: '❤️', label: 'Love' },
  laugh: { icon: Laugh, emoji: '😄', label: 'Laugh' },
  wow: { icon: AlertCircle, emoji: '😲', label: 'Wow' },
  think: { icon: ThumbsUp, emoji: '🤔', label: 'Think' },
  sad: { icon: Frown, emoji: '😢', label: 'Sad' },
  angry: { icon: Angry, emoji: '🤬', label: 'Angry' },
};

export default function EnhancedPostPage() {
  const { categorySlug, labelSlug, postSlug } = useParams();
  const [post, setPost] = useState<(Post & { category: Category; label?: Label }) | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<(Post & { category: Category })[]>([]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [activeSection, setActiveSection] = useState('');

  const userIdentifier = useMemo(() => {
    let id = localStorage.getItem('user_id');
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', id);
    }
    return id;
  }, []);

  const tableOfContents = useMemo(() => {
    if (!post) return [];

    const headings: { id: string; text: string; level: number }[] = [];
    const lines = post.content.split('\n');

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        headings.push({
          id: `heading-${index}`,
          text: line.replace(/^# /, ''),
          level: 1,
        });
      } else if (line.startsWith('## ')) {
        headings.push({
          id: `heading-${index}`,
          text: line.replace(/^## /, ''),
          level: 2,
        });
      }
    });

    return headings;
  }, [post]);

  useEffect(() => {
    loadPost();
  }, [categorySlug, labelSlug, postSlug]);

  useEffect(() => {
    if (post) {
      loadComments();
      loadReactions();
    }
  }, [post]);

  const loadPost = async () => {
    const { data: categoryData } = await supabase
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
        .eq('published', true)
        .neq('id', postData.id)
        .order('views', { ascending: false })
        .limit(6);

      if (relatedData) {
        setRelatedPosts(relatedData as any);
      }
    }
  };

  const loadComments = async () => {
    if (!post) return;

    const { data } = await api
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data);
    }
  };

  const loadReactions = async () => {
    if (!post) return;

    const { data } = await api
      .from('reactions')
      .select('*')
      .eq('post_id', post.id);

    if (data) {
      const counts = data.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setReactions(counts);

      const userReactionData = data.find(r => r.user_identifier === userIdentifier);
      if (userReactionData) {
        setUserReaction(userReactionData.reaction_type);
      }
    }
  };

  const handleReaction = async (type: string) => {
    if (!post) return;

    if (userReaction === type) {
      await api
        .from('reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_identifier', userIdentifier);

      setUserReaction(null);
      setReactions(prev => ({ ...prev, [type]: (prev[type] || 1) - 1 }));
    } else {
      if (userReaction) {
        await api
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_identifier', userIdentifier);

        setReactions(prev => ({ ...prev, [userReaction]: (prev[userReaction] || 1) - 1 }));
      }

      await api
        .from('reactions')
        .insert({
          post_id: post.id,
          reaction_type: type,
          user_identifier: userIdentifier,
        });

      setUserReaction(type);
      setReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    const { error } = await api
      .from('comments')
      .insert({
        post_id: post.id,
        user_name: commentForm.name,
        user_email: commentForm.email,
        content: commentForm.content,
      });

    if (!error) {
      setCommentForm({ name: '', email: '', content: '' });
      loadComments();
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
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
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        {post.featured_image && (
          <>
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </>
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-12">
            <Link
              to={`/category/${post.category.slug}${post.label ? `/${post.label.slug}` : ''}`}
              className="inline-flex items-center gap-2 text-white hover:text-blue-300 dark:hover:text-blue-400 mb-3 sm:mb-4 transition-colors text-sm sm:text-base min-h-[44px]"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              Back to {post.label?.name || post.category.name}
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 max-w-4xl leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base text-white/90 dark:text-white/80">
              <div className="flex items-center gap-2">
                <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className="sm:hidden">{new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {tableOfContents.length > 0 && (
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 transition-colors">
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4 transition-colors">Table of Contents</h3>
                <nav className="space-y-1 md:space-y-2">
                  {tableOfContents.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToSection(heading.id)}
                      className={`block w-full text-left px-2 md:px-3 py-2 rounded transition-colors text-sm ${
                        heading.level === 2 ? 'pl-4 md:pl-6' : ''
                      } ${
                        activeSection === heading.id
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          <article className={tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 md:p-8 mb-6 md:mb-8 transition-colors">
              <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h2 key={index} id={`heading-${index}`} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-6 sm:mt-8 mb-3 sm:mb-4 transition-colors leading-tight">
                        {paragraph.replace(/^# /, '')}
                      </h2>
                    );
                  } else if (paragraph.startsWith('## ')) {
                    return (
                      <h3 key={index} id={`heading-${index}`} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 sm:mt-6 mb-2 sm:mb-3 transition-colors leading-snug">
                        {paragraph.replace(/^## /, '')}
                      </h3>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <p key={index} className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">
                        {paragraph}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">How did you feel about this article?</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {Object.entries(reactionIcons).map(([type, { emoji, label }]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm sm:text-base min-h-[44px] ${
                        userReaction === type
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-110'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{emoji}</span>
                      <span className="font-medium">{label}</span>
                      {reactions[type] > 0 && (
                        <span className="ml-1 text-xs sm:text-sm">({reactions[type]})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 md:p-8 transition-colors">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 transition-colors">Comments ({comments.length})</h3>

              <form onSubmit={handleCommentSubmit} className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">Leave a Comment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors min-h-[44px]"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors min-h-[44px]"
                  />
                </div>
                <textarea
                  placeholder="Write your comment..."
                  required
                  rows={4}
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none mb-3 sm:mb-4 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-blue-600 dark:bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-medium text-sm sm:text-base min-h-[44px]"
                >
                  Post Comment
                </button>
              </form>

              <div className="space-y-4 sm:space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                        {comment.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white transition-colors">{comment.user_name}</span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 transition-colors leading-relaxed break-words">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-800 py-8 sm:py-12 md:py-16 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Recommended For You</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">More articles you might enjoy based on this topic</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/post/${relatedPost.category.slug}/${relatedPost.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="relative h-44 sm:h-48 overflow-hidden">
                    <img
                      src={relatedPost.featured_image || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                      {relatedPost.category.name}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-2">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {relatedPost.views} views
                      </span>
                      <span>{new Date(relatedPost.published_at).toLocaleDateString()}</span>
                    </div>
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
