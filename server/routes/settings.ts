import { Router } from 'express';
import { readJSON, writeJSON } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const settings = await readJSON('settings/site-settings.json');
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    await writeJSON('settings/site-settings.json', req.body);
    res.json(req.body);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
