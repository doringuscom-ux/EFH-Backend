import News from '../models/News.js';

const generateSlug = async (baseText, excludeId = null) => {
  let slug = baseText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!slug) slug = 'entry';
  let isUnique = false;
  let counter = 0;
  let uniqueSlug = slug;

  while (!isUnique) {
    const query = { slug: uniqueSlug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await News.findOne(query);
    if (existing) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    } else {
      isUnique = true;
    }
  }
  return uniqueSlug;
};

// @desc    Create a new entry
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req, res) => {
  try {
    const { headline, summary, category, date, pdfLink, slug: customSlug, image } = req.body;

    if (!headline || !category || !date) {
      return res.status(400).json({ message: 'Please provide headline, category, and date' });
    }

    const finalSlug = await generateSlug(customSlug || headline);

    const news = await News.create({
      headline,
      summary,
      category,
      date,
      pdfLink,
      image,
      slug: finalSlug,
    });

    if (news) {
      res.status(201).json(news);
    } else {
      res.status(400).json({ message: 'Invalid data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getNews = async (req, res) => {
  try {
    const news = await News.find({}).sort('-createdAt');
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get news by slug
// @route   GET /api/news/slug/:slug
// @access  Public
export const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    if (news) {
      res.status(200).json(news);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete entry
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (news) {
      res.status(200).json({ message: 'Entry removed' });
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update entry
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = async (req, res) => {
  try {
    const { headline, summary, category, date, pdfLink, slug: customSlug, image } = req.body;

    const news = await News.findById(req.params.id);

    if (news) {
      if (customSlug && customSlug !== news.slug) {
        news.slug = await generateSlug(customSlug, news._id);
      } else if (headline && headline !== news.headline && !customSlug) {
        news.slug = await generateSlug(headline, news._id);
      } else if (customSlug === '' && headline) {
        news.slug = await generateSlug(headline, news._id);
      }

      news.headline = headline || news.headline;
      news.summary = summary !== undefined ? summary : news.summary;
      news.category = category || news.category;
      news.date = date || news.date;
      news.pdfLink = pdfLink !== undefined ? pdfLink : news.pdfLink;
      news.image = image !== undefined ? image : news.image;

      const updatedNews = await news.save();
      res.status(200).json(updatedNews);
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
