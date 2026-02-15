import { Router } from 'express';
import { readJSON, writeJSON } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

interface Review {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

async function getReviews(): Promise<Review[]> {
  try {
    return await readJSON<Review[]>('reviews/reviews.json');
  } catch {
    return [];
  }
}

async function saveReviews(reviews: Review[]): Promise<void> {
  await writeJSON('reviews/reviews.json', reviews);
}

router.get('/', async (req, res) => {
  try {
    const reviews = await getReviews();
    const { status } = req.query;

    let filtered = reviews;

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    } else if (!req.session.userId) {
      filtered = filtered.filter(r => r.status === 'approved');
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const reviews = await getReviews();
    const newReview: Review = {
      id: `review-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    await saveReviews(reviews);
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const reviews = await getReviews();
    const index = reviews.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    reviews[index] = { ...reviews[index], ...req.body };
    await saveReviews(reviews);
    res.json(reviews[index]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reviews = await getReviews();
    const filtered = reviews.filter(r => r.id !== req.params.id);
    await saveReviews(reviews);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
