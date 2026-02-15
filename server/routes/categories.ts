import { Router } from 'express';
import { readJSON, writeJSON } from '../server/utils/fileSystem.js';
import { requireAuth } from '../server/middleware/auth.js';

const router = Router();

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

router.get('/', async (req, res) => {
  try {
    const categories = await readJSON<Category[]>('data/categories/categories.json');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const categories = await readJSON<Category[]>('data/categories/categories.json');
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    if (!newCategory.slug) {
      newCategory.slug = newCategory.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    categories.push(newCategory);
    await writeJSON('categories/categories.json', categories);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const categories = await readJSON<Category[]>('data/categories/categories.json');
    const index = categories.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categories[index] = { ...categories[index], ...req.body };
    await writeJSON('data/categories/categories.json', categories);
    res.json(categories[index]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const categories = await readJSON<Category[]>('data/categories/categories.json');
    const filtered = categories.filter(c => c.id !== req.params.id);
    await writeJSON('data/categories/categories.json', filtered);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
