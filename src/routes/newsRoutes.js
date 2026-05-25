import express from 'express';
import { createNews, getNews, deleteNews, updateNews, getNewsBySlug } from '../controllers/newsController.js';

const router = express.Router();

router.route('/')
  .post(createNews)
  .get(getNews);

router.get('/slug/:slug', getNewsBySlug);

router.route('/:id')
  .put(updateNews)
  .delete(deleteNews);

export default router;
