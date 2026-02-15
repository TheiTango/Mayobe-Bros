import { Router } from 'express';
import { readJSON, writeJSON } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
}

async function getComments(): Promise<Comment[]> {
  try {
    return await readJSON<Comment[]>('comments/comments.json');
  } catch {
    return [];
  }
}

async function saveComments(comments: Comment[]): Promise<void> {
  await writeJSON('comments/comments.json', comments);
}

router.get('/', async (req, res) => {
  try {
    const comments = await getComments();
    const { postId, status } = req.query;

    let filtered = comments;

    if (postId) {
      filtered = filtered.filter(c => c.postId === postId);
    }

    if (status) {
      filtered = filtered.filter(c => c.status === status);
    } else if (!req.session.userId) {
      filtered = filtered.filter(c => c.status === 'approved');
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const comments = await getComments();
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    await saveComments(comments);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const comments = await getComments();
    const index = comments.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comments[index] = { ...comments[index], ...req.body };
    await saveComments(comments);
    res.json(comments[index]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const comments = await getComments();
    const filtered = comments.filter(c => c.id !== req.params.id);
    await saveComments(filtered);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
