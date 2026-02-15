import { Router } from 'express';
import { readJSON } from '../server/utils/fileSystem.js';

const router = Router();

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await readJSON<User[]>('data/auth/users.json');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/session', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ user: null });
  }

  try {
    const users = await readJSON<User[]>('data/auth/users.json');
    const user = users.find(u => u.id === req.session.userId);

    if (!user) {
      return res.status(401).json({ user: null });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
