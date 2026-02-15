import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import ImagePicker from '../../components/admin/ImagePicker';
import Toast from '../../components/admin/Toast';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  Folder,
  Star,
  Globe,
  Send,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Label {
  id: string;
  name: string;
  category_id: string;
}

export default function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [labelId, setLabelId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [published, setPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 16));
  const [author, setAuthor] = useState('Admin');

  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'featured' | 'content'>('featured');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCategories();
    loadLabels();
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  useEffect(() => {
    if (categoryId) {
      setFilteredLabels(labels.filter(l => l.category_id === categoryId));
    } else {
      setFilteredLabels([]);
    }
  }, [categoryId, labels]);

  useEffect(() => {
    // Auto-generate slug from title
    if (!isEditing || !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  useEffect(() => {
    // Auto-save functionality
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    if (isEditing && title) {
      const timeout = setTimeout(() => {
        handleSave(true);
      }, 30000); // Auto-save every 30 seconds
      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [title, content, excerpt, published]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    setCategories(data || []);
  };

  const loadLabels = async () => {
    const { data } = await supabase
      .from('labels')
      .select('id, name, category_id')
      .order('name');
    setLabels(data || []);
  };

  const loadPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setContent(data.content || '');
        setExcerpt(data.excerpt || '');
        setCategoryId(data.category_id || '');
        setLabelId(data.label_id || '');
        setFeaturedImage(data.featured_image || '');
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
        setMetaKeywords(data.meta_keywords || '');
        setPublished(data.published || false);
        setIsFeatured(data.is_featured || false);
        setPublishDate(data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
        setAuthor(data.author || 'Admin');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) {
      if (!isAutoSave) {
        setToast({ message: 'Please enter a title', type: 'error' });
      }
      return;
    }

    if (!categoryId) {
      if (!isAutoSave) {
        setToast({ message: 'Please select a category', type: 'error' });
      }
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId,
        label_id: labelId || null,
        featured_image: featuredImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        published,
        is_featured: isFeatured,
        published_at: published && !publishDate ? new Date().toISOString() : publishDate,
        author,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        if (!isAutoSave) {
          setToast({ message: 'Post saved successfully!', type: 'success' });
        }
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString(),
            views: 0,
          })
          .select()
          .single();

        if (error) throw error;
        setToast({ message: 'Post created successfully!', type: 'success' });
        setTimeout(() => navigate(`/admin/posts/edit/${data.id}`), 1500);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (!isAutoSave) {
        setToast({ message: 'Failed to save post. Please try again.', type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setToast({ message: 'Please enter a title before publishing', type: 'error' });
      return;
    }

    if (!categoryId) {
      setToast({ message: 'Please select a category before publishing', type: 'error' });
      return;
    }

    if (!content.trim()) {
      setToast({ message: 'Please add some content before publishing', type: 'error' });
      return;
    }

    setPublished(true);
    setPublishDate(new Date().toISOString().slice(0, 16));

    setSaving(true);
    try {
      const postData = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId,
        label_id: labelId || null,
        featured_image: featuredImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        published: true,
        is_featured: isFeatured,
        published_at: new Date().toISOString(),
        author,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        setToast({ message: 'Post published successfully! Now live on website.', type: 'success' });
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString(),
            views: 0,
          })
          .select()
          .single();

        if (error) throw error;
        setToast({ message: 'Post published successfully! Now live on website.', type: 'success' });
        setTimeout(() => navigate(`/admin/posts/edit/${data.id}`), 1500);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      setToast({ message: 'Failed to publish post. Please try again.', type: 'error' });
      setPublished(false);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (imagePickerTarget === 'featured') {
      setFeaturedImage(imageUrl);
    } else {
      // Insert image into content
      const imgTag = `<img src="${imageUrl}" alt="" class="max-w-full h-auto rounded-lg my-4" />`;
      setContent(content + imgTag);
    }
    setShowImagePicker(false);
  };

  const openImagePicker = (target: 'featured' | 'content') => {
    setImagePickerTarget(target);
    setShowImagePicker(true);
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/posts')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update your post content' : 'Create a new blog post'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
              <span>{published ? 'Update & Publish' : 'Publish Now'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none pb-2"
              />
            </div>

            {/* Slug */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                URL: /post/{categoryId ? 'category' : 'uncategorized'}/{slug}
              </p>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                onImageClick={() => openImagePicker('content')}
                placeholder="Start writing your post content..."
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a short excerpt or summary..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SEO Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe size={20} />
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (defaults to post title)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description (150-160 characters recommended)"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {metaDescription.length} characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Publishing
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Star size={14} />
                      Featured Post
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <User size={14} />
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Category & Label */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Folder size={14} />
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setLabelId('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Tag size={14} />
                    Label
                  </label>
                  <select
                    value={labelId}
                    onChange={(e) => setLabelId(e.target.value)}
                    disabled={!categoryId}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">No label</option>
                    {filteredLabels.map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Featured Image
              </h3>
              {featuredImage ? (
                <div className="relative group">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => openImagePicker('featured')}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-opacity"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openImagePicker('featured')}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Click to select image
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
