const express = require('express');
const router = express.Router();
const axios = require('axios');

// Environment variables
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Helper functions
const calculateReadabilityScore = (text) => {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;

  let score = 100;
  if (avgWordsPerSentence > 20) score -= 20;
  if (avgWordsPerSentence < 10) score -= 10;
  if (text.length > 160) score -= 15;
  if (text.length < 120) score -= 10;

  return Math.max(0, score);
};

const calculateKeywordDensity = (content, keywords) => {
  const wordCount = content.split(/\s+/).length;
  const density = {};

  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex) || [];
    density[keyword] = (matches.length / wordCount) * 100;
  });

  return density;
};

const calculateContentScore = (content, keywords) => {
  let score = 0;
  
  // Keyword density score
  const density = calculateKeywordDensity(content, keywords);
  const avgDensity = Object.values(density).reduce((a, b) => a + b, 0) / keywords.length;
  if (avgDensity >= 0.5 && avgDensity <= 2.5) score += 30;
  
  // Content length score
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) score += 30;
  
  // Readability score
  score += calculateReadabilityScore(content) * 0.4;

  return score;
};

// Meta Description Generation
router.post('/meta-description', async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content || !title) {
      return res.status(400).json({
        success: false,
        message: 'Content and title are required'
      });
    }

    // Extract good sentences from content
    const sentences = content.split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .filter(s => s.length > 50 && s.length < 160);

    // Find the best sentence that includes the title
    const bestSentence = sentences.find(s => 
      s.toLowerCase().includes(title.toLowerCase())
    ) || sentences[0];

    // Generate meta description using templates
    const templates = [
      `Discover ${title} - ${bestSentence?.substring(0, 100)}...`,
      `Explore ${title} with our guide: ${bestSentence?.substring(0, 100)}...`,
      `Your complete guide to ${title}: ${bestSentence?.substring(0, 100)}...`,
      `Learn about ${title} - ${bestSentence?.substring(0, 100)}...`,
      `Master ${title} with our tips: ${bestSentence?.substring(0, 100)}...`
    ];

    // Select the best description
    const descriptions = templates.map(desc => ({
      description: desc,
      score: calculateReadabilityScore(desc),
      length: desc.length
    }));

    const bestDescription = descriptions.sort((a, b) => b.score - a.score)[0] || {
      description: `Discover everything about ${title} - from tips to best practices. ${content.substring(0, 100)}...`,
      score: 80,
      length: 150
    };

    res.json({
      success: true,
      data: bestDescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate meta description',
      error: error.message
    });
  }
});

// Keyword Suggestions
router.post('/keywords', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    let rapidApiSuggestions = [];
    let trendsSuggestions = [];

    // Get suggestions from RapidAPI if key is available
    if (RAPIDAPI_KEY) {
      try {
        const rapidResponse = await axios.get(
          'https://ahrefs-dr-rank-checker.p.rapidapi.com/keyword-metrics',
          {
            params: { 
              keyword: title,
              country: 'in'
            },
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'ahrefs-dr-rank-checker.p.rapidapi.com'
            }
          }
        );

        rapidApiSuggestions = (rapidResponse.data || []).map(metric => ({
          keyword: metric.keyword,
          volume: metric.search_volume,
          difficulty: metric.keyword_difficulty,
          source: 'Ahrefs',
          relevance: 100 - metric.keyword_difficulty
        }));

        } catch (rapidError) {
        // Continue without RapidAPI suggestions
      }
    }

    // Generate basic suggestions
    const basicSuggestions = [
      `${title} guide`,
      `${title} tips`,
      `best ${title}`,
      `how to ${title}`,
      `${title} in India`,
      `${title} information`,
      `${title} details`,
      `complete guide to ${title}`,
      `${title} for beginners`,
      `learn about ${title}`
    ].map(keyword => ({
      keyword,
      source: 'Basic',
      relevance: 5
    }));

    // Combine all suggestions
    const allSuggestions = [
      ...rapidApiSuggestions,
      ...trendsSuggestions,
      ...basicSuggestions
    ];

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = Array.from(
      new Map(allSuggestions.map(item => [item.keyword, item])).values()
    )
    .sort((a, b) => b.relevance - a.relevance);

    // Categorize suggestions
    const suggestions = {
      trending: trendsSuggestions.slice(0, 5),
      related: rapidApiSuggestions
        .filter(s => s.difficulty < 50)
        .slice(0, 5),
      all: uniqueSuggestions.slice(0, 10)
    };

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    // Return basic suggestions even if there's an error
    const basicSuggestions = [
      `${req.body.title} guide`,
      `${req.body.title} tips`,
      `best ${req.body.title}`,
      `how to ${req.body.title}`,
      `${req.body.title} in India`
    ].map(keyword => ({
      keyword,
      source: 'Basic',
      relevance: 5
    }));

    res.json({
      success: true,
      data: {
        trending: [],
        related: [],
        all: basicSuggestions
      }
    });
  }
});

// 3. Content Analysis
router.post('/analyze', async (req, res) => {
  try {
    const { content, keywords } = req.body;

    if (!content || !keywords) {
      return res.status(400).json({
        success: false,
        message: 'Content and keywords are required'
      });
    }

    // Get content analysis from Hugging Face
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: `Analyze this content for SEO: ${content.substring(0, 500)}... Keywords: ${keywords.join(', ')}`,
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );

    // Basic SEO analysis
    const analysis = {
      readability: calculateReadabilityScore(content),
      keywordDensity: calculateKeywordDensity(content, keywords),
      suggestions: response.data[0].summary_text,
      score: calculateContentScore(content, keywords)
    };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content',
      error: error.message
    });
  }
});

module.exports = router; 