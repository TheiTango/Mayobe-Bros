import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FileText,
  Eye,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Plus,
  Activity,
  FileEdit,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  totalViews: number;
}

interface RecentPost {
  id: string;
  title: string;
  status: string;
  published_at: string;
  views: number;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'page';
  title: string;
  action: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const [postsResult, commentsResult] = await Promise.all([
        supabase.from('posts').select('views, published'),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      const posts = postsResult.data || [];
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
      const publishedPosts = posts.filter(p => p.published).length;
      const draftPosts = posts.filter(p => !p.published).length;

      setStats({
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
        totalComments: commentsResult.count || 0,
        totalViews,
      });

      // Load recent posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, published, published_at, views, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPosts(
        (postsData || []).map(post => ({
          ...post,
          status: post.published ? 'published' : 'draft',
        }))
      );

      // Create mock activities (in a real app, you'd have an activities table)
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'post',
          title: 'New post published',
          action: 'created',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'comment',
          title: 'New comment on "Getting Started"',
          action: 'added',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'page',
          title: 'About page updated',
          action: 'updated',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-600', '-100')} dark:${color.replace('border-', 'bg-').replace('-600', '-900/30')}`}>
          <Icon size={24} className={color.replace('border-', 'text-')} />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
            <TrendingUp size={16} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value.toLocaleString()}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your site.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Posts"
            value={stats.totalPosts}
            change="+12%"
            color="border-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Published"
            value={stats.publishedPosts}
            change="+8%"
            color="border-green-600"
          />
          <StatCard
            icon={Circle}
            label="Drafts"
            value={stats.draftPosts}
            color="border-orange-600"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews}
            change="+23%"
            color="border-purple-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={MessageSquare}
            label="Total Comments"
            value={stats.totalComments}
            change="+5%"
            color="border-pink-600"
          />
          <StatCard
            icon={ThumbsUp}
            label="Engagement Rate"
            value="87%"
            change="+3%"
            color="border-indigo-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/admin/posts/new"
              className="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-lg transition-all"
            >
              <Plus size={18} />
              <span>New Post</span>
            </Link>
            <Link
              to="/admin/pages/new"
              className="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-lg transition-all"
            >
              <FileEdit size={18} />
              <span>New Page</span>
            </Link>
            <Link
              to="/admin/comments"
              className="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-lg transition-all"
            >
              <MessageSquare size={18} />
              <span>Comments</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-lg transition-all"
            >
              <Activity size={18} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>

        {/* Recent Posts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
              <Link
                to="/admin/posts"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {recentPosts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No posts yet</p>
                  <Link
                    to="/admin/posts/new"
                    className="inline-block mt-3 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create your first post
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'post'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : activity.type === 'comment'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}
                  >
                    {activity.type === 'post' && (
                      <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    )}
                    {activity.type === 'comment' && (
                      <MessageSquare size={16} className="text-green-600 dark:text-green-400" />
                    )}
                    {activity.type === 'page' && (
                      <FileEdit size={16} className="text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
