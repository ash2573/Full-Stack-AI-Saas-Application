const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { requireAuth, attachUser, checkCredits, deductCredit } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// POST /api/generate-article
router.post('/generate-article', requireAuth, attachUser, checkCredits, async (req, res) => {
  const { title, wordCount = 500, tone = 'professional' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (wordCount < 100 || wordCount > 3000)
    return res.status(400).json({ error: 'Word count must be between 100 and 3000' });

  try {
    const prompt = `You are an expert content writer. Write a ${wordCount}-word article about: "${title}". 
    Use a ${tone} tone. Make it informative, engaging, and well-structured with proper headings (##) and paragraphs.
    Include an introduction, body paragraphs, and conclusion. Use markdown formatting.`;

    const result = await model.generateContent(prompt);
    const article = result.response.text();
    await deductCredit(req.user.id, 'article_generator', title);

    res.json({
      success: true,
      article,
      wordsGenerated: article.split(' ').length,
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('generate-article error:', err);
    res.status(500).json({ error: 'Failed to generate article. Please try again.' });
  }
});

// POST /api/generate-titles
router.post('/generate-titles', requireAuth, attachUser, checkCredits, async (req, res) => {
  const { keyword, category = 'General', count = 5 } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  try {
    const prompt = `Generate ${count} unique, engaging, SEO-friendly blog titles for the keyword "${keyword}" in the "${category}" category.
    Return ONLY a JSON array of title strings, no other text, no markdown, no backticks.
    Example format: ["Title 1", "Title 2", "Title 3"]`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let titles;
    try {
      titles = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      titles = raw
        .split('\n')
        .filter((l) => l.trim() && (l.includes('"') || l.match(/^\d+\./)))
        .map((l) => l.replace(/^[\d\.\-\*\s"]+|["]+$/g, '').trim())
        .filter(Boolean)
        .slice(0, count);
    }

    await deductCredit(req.user.id, 'blog_title_generator', keyword);
    res.json({
      success: true,
      titles,
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('generate-titles error:', err);
    res.status(500).json({ error: 'Failed to generate titles. Please try again.' });
  }
});

// POST /api/generate-image
router.post('/generate-image', requireAuth, attachUser, checkCredits, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const imageUrl = `https://source.unsplash.com/1024x1024/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(','))}`;
    await deductCredit(req.user.id, 'image_generator', prompt);
    res.json({
      success: true,
      imageUrl,
      note: 'Image sourced from Unsplash based on your prompt.',
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('generate-image error:', err);
    res.status(500).json({ error: 'Failed to generate image. Please try again.' });
  }
});

module.exports = router;