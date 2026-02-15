import { Router } from 'express';
import { readJSON, writeJSON } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

interface Label {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
}

router.get('/', async (req, res) => {
  try {
    const labels = await readJSON<Label[]>('labels/labels.json');
    res.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const labels = await readJSON<Label[]>('labels/labels.json');
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    if (!newLabel.slug) {
      newLabel.slug = newLabel.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    labels.push(newLabel);
    await writeJSON('labels/labels.json', labels);
    res.status(201).json(newLabel);
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const labels = await readJSON<Label[]>('labels/labels.json');
    const index = labels.findIndex(l => l.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Label not found' });
    }

    labels[index] = { ...labels[index], ...req.body };
    await writeJSON('labels/labels.json', labels);
    res.json(labels[index]);
  } catch (error) {
    console.error('Error updating label:', error);
    res.status(500).json({ error: 'Failed to update label' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const labels = await readJSON<Label[]>('labels/labels.json');
    const filtered = labels.filter(l => l.id !== req.params.id);
    await writeJSON('labels/labels.json', filtered);
    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Error deleting label:', error);
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

export default router;
