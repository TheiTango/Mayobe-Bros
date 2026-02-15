import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import ImagePicker from '../../components/admin/ImagePicker';
import Toast from '../../components/admin/Toast';
import {
  Save,
  Send,
  ArrowLeft,
  Globe,
  Menu as MenuIcon,
} from 'lucide-react';

export default function PageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [showInMenu, setShowInMenu] = useState(false);
  const [isIndexed, setIsIndexed] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadPage();
    }
  }, [id]);

  useEffect(() => {
    if (!isEditing || !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setContent(data.content || '');
        setPublished(data.published || false);
        setShowInMenu(data.show_in_menu || false);
        setIsIndexed(data.is_indexed ?? true);
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
      }
    } catch (error) {
      console.error('Error loading page:', error);
      alert('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ message: 'Please enter a title', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const pageData = {
        title,
        slug,
        content,
        published,
        show_in_menu: showInMenu,
        is_indexed: isIndexed,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('static_pages')
          .update(pageData)
          .eq('id', id);

        if (error) throw error;
        setToast({ message: 'Page saved successfully!', type: 'success' });
      } else {
        const { data, error } = await supabase
          .from('static_pages')
          .insert({
            ...pageData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        setToast({ message: 'Page created successfully!', type: 'success' });
        setTimeout(() => navigate(`/admin/pages/edit/${data.id}`), 1500);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setToast({ message: 'Failed to save page. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setToast({ message: 'Please enter a title before publishing', type: 'error' });
      return;
    }

    if (!content.trim()) {
      setToast({ message: 'Please add some content before publishing', type: 'error' });
      return;
    }

    setPublished(true);

    setSaving(true);
    try {
      const pageData = {
        title,
        slug,
        content,
        published: true,
        show_in_menu: showInMenu,
        is_indexed: isIndexed,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('static_pages')
          .update(pageData)
          .eq('id', id);

        if (error) throw error;
        setToast({ message: 'Page published successfully! Now live on website.', type: 'success' });
      } else {
        const { data, error } = await supabase
          .from('static_pages')
          .insert({
            ...pageData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        setToast({ message: 'Page published successfully! Now live on website.', type: 'success' });
        setTimeout(() => navigate(`/admin/pages/edit/${data.id}`), 1500);
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      setToast({ message: 'Failed to publish page. Please try again.', type: 'error' });
      setPublished(false);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    const imgTag = `<img src="${imageUrl}" alt="" class="max-w-full h-auto rounded-lg my-4" />`;
    setContent(content + imgTag);
    setShowImagePicker(false);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/pages')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Page' : 'New Page'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update your page content' : 'Create a new static page'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none pb-2"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-url-slug"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                URL: /{slug}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                onImageClick={() => setShowImagePicker(true)}
                placeholder="Start writing your page content..."
              />
            </div>

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
                    placeholder="SEO title (defaults to page title)"
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
                    placeholder="SEO description"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Page Settings
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
                      checked={showInMenu}
                      onChange={(e) => setShowInMenu(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <MenuIcon size={14} />
                      Show in Menu
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIndexed}
                      onChange={(e) => setIsIndexed(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Index by Search Engines
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
