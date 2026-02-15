import { Router } from 'express';
import { readPagesFromFolder, writePage, deletePage } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pages = await readPagesFromFolder();
    const { status } = req.query;

    let filtered = pages;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    } else {
      filtered = filtered.filter(p => p.status === 'published');
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const pages = await readPagesFromFolder();
    const page = pages.find(p => p.slug === req.params.slug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const page = {
      id: `page-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!page.slug) {
      page.slug = page.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    await writePage(page);
    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/:slug', requireAuth, async (req, res) => {
  try {
    const pages = await readPagesFromFolder();
    const existingPage = pages.find(p => p.slug === req.params.slug);

    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const updatedPage = {
      ...existingPage,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (existingPage.slug !== updatedPage.slug) {
      await deletePage(existingPage.slug);
    }

    await writePage(updatedPage);
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/:slug', requireAuth, async (req, res) => {
  try {
    await deletePage(req.params.slug);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;
