import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tag,
  Folder,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Label {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  categories?: { name: string };
}

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    display_order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [labelsResult, categoriesResult] = await Promise.all([
        supabase.from('labels').select('*, categories(name)').order('display_order'),
        supabase.from('categories').select('id, name').order('name'),
      ]);

      if (labelsResult.error) throw labelsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setLabels(labelsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (label: Label) => {
    setEditingId(label.id);
    setFormData({
      name: label.name,
      slug: label.slug,
      description: label.description || '',
      category_id: label.category_id,
      display_order: label.display_order,
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a label name');
      return;
    }
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    try {
      const labelData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || null,
        category_id: formData.category_id,
        display_order: formData.display_order,
      };

      if (editingId) {
        const { error } = await supabase
          .from('labels')
          .update(labelData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Label updated successfully');
      } else {
        const { error } = await supabase
          .from('labels')
          .insert(labelData);

        if (error) throw error;
        alert('Label created successfully');
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving label:', error);
      alert('Failed to save label');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this label?')) return;

    try {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Label deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting label:', error);
      alert('Failed to delete label');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      display_order: 0,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const groupedLabels = categories.map(cat => ({
    category: cat,
    labels: labels.filter(l => l.category_id === cat.id),
  }));

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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Labels</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create labels to further organize posts within categories
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Label</span>
          </button>
        </div>

        {(showAddForm || editingId) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Label' : 'Add New Label'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Label name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="label-slug (auto-generated if empty)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Label description"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={20} />
                <span>{editingId ? 'Update' : 'Create'} Label</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {groupedLabels.map(({ category, labels }) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Folder size={20} className="text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({labels.length} {labels.length === 1 ? 'label' : 'labels'})
                  </span>
                </div>
              </div>

              {labels.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {labels.map((label) => (
                      <tr key={label.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Tag size={16} className="text-green-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {label.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {label.slug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {label.display_order}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(label)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(label.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Tag size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No labels in this category yet</p>
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Folder size={48} className="mx-auto mb-3 opacity-50 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No categories found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please create categories first before adding labels
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
