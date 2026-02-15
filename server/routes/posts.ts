import { Router } from 'express';
import { readPostsFromFolder, writePost, deletePost } from '../utils/fileSystem.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const posts = await readPostsFromFolder();
    const { category, label, status, search } = req.query;

    let filtered = posts;

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    } else {
      filtered = filtered.filter(p => p.status === 'published');
    }

    if (category) {
      filtered = filtered.filter(p => p.categoryId === category);
    }

    if (label) {
      filtered = filtered.filter(p => p.labelIds?.includes(label));
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchLower) ||
        p.content?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const posts = await readPostsFromFolder();
    const post = posts.find(p => p.slug === req.params.slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const post = {
      id: `post-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!post.slug) {
      post.slug = post.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    await writePost(post);
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:slug', requireAuth, async (req, res) => {
  try {
    const posts = await readPostsFromFolder();
    const existingPost = posts.find(p => p.slug === req.params.slug);

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = {
      ...existingPost,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (existingPost.slug !== updatedPost.slug) {
      await deletePost(existingPost.slug);
    }

    await writePost(updatedPost);
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:slug', requireAuth, async (req, res) => {
  try {
    await deletePost(req.params.slug);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
