import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth.js';
import postsRoutes from './server/routes/posts.js';
import pagesRoutes from './server/routes/pages.js';
import categoriesRoutes from './server/routes/categories.js';
import labelsRoutes from './server/routes/labels.js';
import imagesRoutes from './server/routes/images.js';
import settingsRoutes from './server/routes/settings.js';
import commentsRoutes from './server/routes/comments.js';
import reviewsRoutes from './server/routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.mayobebros.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'mayobebros-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/data/images', express.static(path.join(__dirname, 'data/images')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/labels', labelsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reviews', reviewsRoutes);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/data')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mayobe Bros running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin/login`);
});
