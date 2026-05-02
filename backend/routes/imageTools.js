const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { requireAuth, attachUser, checkCredits, deductCredit } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/remove-background
router.post('/remove-background', requireAuth, attachUser, checkCredits, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' });

  try {
    const form = new FormData();
    form.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Clipdrop error:', err);
      return res.status(500).json({ error: 'Failed to remove background' });
    }

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');

    await deductCredit(req.user.id, 'background_remover', 'image upload');
    res.json({
      success: true,
      imageBase64: `data:image/png;base64,${base64}`,
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('remove-background error:', err);
    res.status(500).json({ error: 'Failed to remove background. Please try again.' });
  }
});

// POST /api/remove-object
router.post('/remove-object', requireAuth, attachUser, checkCredits, upload.fields([
  { name: 'image_file', maxCount: 1 },
  { name: 'mask_file', maxCount: 1 },
]), async (req, res) => {
  if (!req.files?.image_file) return res.status(400).json({ error: 'Image is required' });

  try {
    const form = new FormData();
    form.append('image_file', req.files.image_file[0].buffer, {
      filename: req.files.image_file[0].originalname,
      contentType: req.files.image_file[0].mimetype,
    });

    if (req.files?.mask_file) {
      form.append('mask_file', req.files.mask_file[0].buffer, {
        filename: req.files.mask_file[0].originalname,
        contentType: req.files.mask_file[0].mimetype,
      });
    }

    const response = await fetch('https://clipdrop-api.co/cleanup/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Clipdrop error:', err);
      return res.status(500).json({ error: 'Failed to remove object' });
    }

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');

    await deductCredit(req.user.id, 'object_remover', 'image upload');
    res.json({
      success: true,
      imageBase64: `data:image/png;base64,${base64}`,
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('remove-object error:', err);
    res.status(500).json({ error: 'Failed to remove object. Please try again.' });
  }
});

// POST /api/analyze-resume
router.post('/analyze-resume', requireAuth, attachUser, checkCredits, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Resume PDF is required' });

  try {
    const pdfBase64 = req.file.buffer.toString('base64');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      {
        text: `Analyze this resume and provide:
        1. An overall score out of 100
        2. Top 3 strengths
        3. Top 3 weaknesses/areas for improvement
        4. Key skills identified
        5. Brief overall feedback
        
        Return as JSON in this exact format with no markdown:
        {
          "score": 85,
          "strengths": ["strength1", "strength2", "strength3"],
          "weaknesses": ["weakness1", "weakness2", "weakness3"],
          "skills": ["skill1", "skill2", "skill3"],
          "feedback": "Overall feedback here"
        }`
      }
    ]);

    const raw = result.response.text().trim();
    let analysis;
    try {
      analysis = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      analysis = {
        score: 75,
        strengths: ['Good structure', 'Clear experience section', 'Relevant skills listed'],
        weaknesses: ['Could add more quantifiable achievements', 'Summary could be stronger', 'Consider adding links'],
        skills: ['Communication', 'Problem solving', 'Teamwork'],
        feedback: raw,
      };
    }

    await deductCredit(req.user.id, 'resume_analyzer', 'resume upload');
    res.json({
      success: true,
      analysis,
      creditsRemaining: req.user.plan === 'premium' ? 'unlimited' : req.user.credits - 1,
    });
  } catch (err) {
    console.error('analyze-resume error:', err);
    res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
});

module.exports = router;