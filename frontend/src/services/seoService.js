import axios from 'axios';
import { GoogleTrends } from 'google-trends-api';

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
// const HUGGINGFACE_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY; // Disabled for security
const GOOGLE_TRENDS_API_KEY = process.env.REACT_APP_GOOGLE_TRENDS_API_KEY;

  

// Google Trends से डेटा फेच करने का फंक्शन
const getGoogleTrendsData = async (keyword) => {
  try {
    const response = await axios.get(
      'https://trends.google.com/trends/api/dailytrends',
      {
        params: {
          hl: 'en-US',
          tz: '-330', // IST timezone
          geo: 'IN',
          ns: '15'
        },
        headers: {
          'Authorization': `Bearer ${GOOGLE_TRENDS_API_KEY}`
        }
      }
    );

    // Google Trends API रिस्पांस को प्रोसेस करें
    const trendsData = response.data
      .filter(trend => 
        trend.title.toLowerCase().includes(keyword.toLowerCase()) ||
        trend.articles.some(article => 
          article.title.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .map(trend => ({
        keyword: trend.title,
        volume: trend.traffic,
        source: 'Google Trends',
        articles: trend.articles.map(article => ({
          title: article.title,
          url: article.url
        }))
      }));

    return trendsData;
  } catch (error) {
    return [];
  }
};

// API keys टेस्ट करने का फंक्शन
export const testApiKeys = async () => {
  const results = {
    rapidApi: { valid: false, error: null },
    huggingFace: { valid: false, error: null },
    googleTrends: { valid: false, error: null }
  };

  // RapidAPI टेस्ट
  if (RAPIDAPI_KEY) {
    try {
      const response = await axios.get(
        'https://ahrefs-dr-rank-checker.p.rapidapi.com/keyword-metrics',
        {
          params: { 
            keyword: 'test',
            country: 'in'
          },
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'ahrefs-dr-rank-checker.p.rapidapi.com'
          }
        }
      );
      results.rapidApi.valid = response.status === 200;
    } catch (error) {
      results.rapidApi.error = error.response?.data?.message || error.message;
    }
  } else {
    results.rapidApi.error = 'RAPIDAPI_KEY is not set';
  }

  // Hugging Face टेस्ट - Disabled for security
  // if (HUGGINGFACE_API_KEY) {
  //   try {
  //     const response = await axios.post(
  //       'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
  //       {
  //         inputs: 'Test input for API validation'
  //       },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
  //         }
  //       }
  //     );
  //     results.huggingFace.valid = response.status === 200;
  //   } catch (error) {
  //     results.huggingFace.error = error.response?.data?.error || error.message;
  //   }
  // } else {
  //   results.huggingFace.error = 'HUGGINGFACE_API_KEY is not set';
  // }
  results.huggingFace.error = 'Hugging Face API disabled for security';

  // Google Trends टेस्ट
  if (GOOGLE_TRENDS_API_KEY) {
    try {
      const trendsData = await getGoogleTrendsData('test');
      results.googleTrends.valid = Array.isArray(trendsData);
    } catch (error) {
      results.googleTrends.error = error.response?.data?.error || error.message;
    }
  } else {
    results.googleTrends.error = 'GOOGLE_TRENDS_API_KEY is not set';
  }

  // कंसोल में रिजल्ट्स दिखाएं
    rapidApi: {
      status: results.rapidApi.valid ? '✅ Working' : '❌ Not Working',
      error: results.rapidApi.error
    },
    huggingFace: {
      status: results.huggingFace.valid ? '✅ Working' : '❌ Not Working',
      error: results.huggingFace.error
    },
    googleTrends: {
      status: results.googleTrends.valid ? '✅ Working' : '❌ Not Working',
      error: results.googleTrends.error
    }

  return results;
};

// API keys चेक करने का फंक्शन
const checkApiKeys = async () => {
  const results = await testApiKeys();
  return results.rapidApi.valid && results.huggingFace.valid && results.googleTrends.valid;
};

// बेसिक कीवर्ड सजेशन्स जनरेट करने का फंक्शन
const generateBasicSuggestions = (title) => {
  const basicKeywords = [
    title + ' guide',
    title + ' tips',
    'best ' + title,
    'how to ' + title,
    title + ' in India',
    title + ' information',
    title + ' details',
    'complete guide to ' + title,
    title + ' for beginners',
    'learn about ' + title
  ];

  return basicKeywords.map(keyword => ({
    keyword,
    source: 'Basic',
    relevance: 5
  }));
};

// बेसिक मेटा डिस्क्रिप्शन जनरेट करने का फंक्शन
const generateBasicMetaDescription = (content, title) => {
  const templates = [
    `Discover everything about ${title} - from tips to best practices. ${content.substring(0, 100)}...`,
    `Looking for ${title}? Get expert insights, tips, and guides. ${content.substring(0, 100)}...`,
    `Your complete guide to ${title}. Find out the best ways to explore and experience. ${content.substring(0, 100)}...`,
    `Learn everything about ${title} with our comprehensive guide. ${content.substring(0, 100)}...`,
    `Master ${title} with our expert tips and strategies. ${content.substring(0, 100)}...`
  ];

  return templates.map(description => ({
    description,
    score: calculateMetaDescriptionScore(description),
    length: description.length
  }));
};

// Hugging Face API कॉल्स के लिए नया फंक्शन - Disabled for security
// const callHuggingFaceAPI = async (prompt, model = 'gpt2') => {
//   try {
//     if (!HUGGINGFACE_API_KEY) {
//       throw new Error('HUGGINGFACE_API_KEY is not set');
//     }

//     const response = await axios.post(
//       `https://api-inference.huggingface.co/models/${model}`,
//       {
//         inputs: prompt,
//         parameters: {
//           max_length: 150,
//           temperature: 0.7,
//           return_full_text: false
//         }
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     if (!response.data || !response.data[0]) {
//       throw new Error('Invalid response from Hugging Face API');
//     }

//     return response.data[0].generated_text || response.data[0].summary_text;
//   } catch (error) {
//     throw error;
//   }
// };

// कीवर्ड सजेशन्स फंक्शन अपडेट करें
export const getKeywordSuggestions = async (title) => {
  try {
    
    // RapidAPI से कीवर्ड मेट्रिक्स
    let rapidApiSuggestions = [];
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

        rapidApiSuggestions = rapidResponse.data.map(metric => ({
          keyword: metric.keyword,
          volume: metric.search_volume,
          difficulty: metric.keyword_difficulty,
          source: 'Ahrefs',
          relevance: 100 - metric.keyword_difficulty // डिफिकल्टी को रिवर्स करके रिलेवेंस बनाएं
        }));

      } catch (rapidError) {
      }
    }

    // Google Trends से डेटा
    let trendsSuggestions = [];
    try {
      const trendsData = await GoogleTrends.relatedQueries({
        keyword: title,
        geo: 'IN',
        hl: 'hi',
        timezone: 330 // IST timezone
      });

      // Google Trends से मिले डेटा को प्रोसेस करें
      const relatedQueries = trendsData.default?.rankedList[0]?.rankedKeyword || [];
      trendsSuggestions = relatedQueries.map(query => ({
        keyword: query.query,
        volume: query.value,
        source: 'Google Trends',
        relevance: query.value // Google Trends का स्कोर ही रिलेवेंस है
      }));

    } catch (trendsError) {
    }

    // दोनों सोर्सेज को कंबाइन करें
    const allSuggestions = [
      ...rapidApiSuggestions,
      ...trendsSuggestions
    ];

    // डुप्लिकेट्स हटाएं और रिलेवेंस के हिसाब से सॉर्ट करें
    const uniqueSuggestions = Array.from(
      new Map(allSuggestions.map(item => [item.keyword, item])).values()
    )
    .sort((a, b) => b.relevance - a.relevance);

    // सजेशन्स को कैटेगराइज करें
    const suggestions = {
      trending: trendsSuggestions.slice(0, 5), // टॉप 5 ट्रेंडिंग कीवर्ड्स
      related: rapidApiSuggestions
        .filter(s => s.difficulty < 50) // कम डिफिकल्टी वाले कीवर्ड्स
        .slice(0, 5),
      all: uniqueSuggestions.slice(0, 10) // टॉप 10 सजेशन्स
    };

    return suggestions;
  } catch (error) {
    // बेसिक सजेशन्स रिटर्न करें
    return {
      trending: [],
      related: [],
      all: generateBasicSuggestions(title)
    };
  }
};

// 2. कंटेंट एनालिसिस
export const analyzeContent = async (content, keywords) => {
  try {
    // अगर API keys नहीं हैं तो बेसिक एनालिसिस दें
    // Hugging Face API disabled for security
    return {
      readability: calculateReadabilityScore(content),
      keywordDensity: calculateKeywordDensity(content, keywords),
      suggestions: 'Consider adding more relevant keywords and improving content structure.',
      score: calculateContentScore(content, keywords)
    };
  } catch (error) {
    return {
      readability: calculateReadabilityScore(content),
      keywordDensity: calculateKeywordDensity(content, keywords),
      suggestions: 'Consider adding more relevant keywords and improving content structure.',
      score: calculateContentScore(content, keywords)
    };
  }
};

// 3. मेटा डिस्क्रिप्शन जनरेशन
export const generateMetaDescription = async (content, title) => {
  try {
    // कंटेंट से एक अच्छा सेंटेंस एक्सट्रैक्ट करें
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const bestSentence = sentences.find(s => 
      s.toLowerCase().includes(title.toLowerCase()) && 
      s.length > 50 && 
      s.length < 160
    ) || sentences[0];

    // टेम्पलेट्स के साथ कंबाइन करें
    const templates = [
      `Discover ${title} - ${bestSentence?.substring(0, 100)}...`,
      `Explore ${title} with our guide: ${bestSentence?.substring(0, 100)}...`,
      `Your complete guide to ${title}: ${bestSentence?.substring(0, 100)}...`,
      `Learn about ${title} - ${bestSentence?.substring(0, 100)}...`,
      `Master ${title} with our tips: ${bestSentence?.substring(0, 100)}...`
    ];

    // सबसे अच्छा डिस्क्रिप्शन चुनें
    const bestDescription = templates
      .map(desc => ({
        description: desc,
        score: calculateMetaDescriptionScore(desc),
        length: desc.length
      }))
      .sort((a, b) => b.score - a.score)[0];

    return bestDescription || {
      description: `Discover everything about ${title} - from tips to best practices. ${content.substring(0, 100)}...`,
      score: 80,
      length: 150
    };
  } catch (error) {
    return {
      description: `Discover everything about ${title} - from tips to best practices. ${content.substring(0, 100)}...`,
      score: 80,
      length: 150
    };
  }
};

// मेटा डिस्क्रिप्शन सजेशन्स
export const getMetaDescriptionSuggestions = async (content, title) => {
  try {
    
    // कंटेंट से अच्छे सेंटेंसेस एक्सट्रैक्ट करें
    const sentences = content.split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .filter(s => s.length > 50 && s.length < 160);

    // टेम्पलेट्स
    const templates = [
      `Discover ${title} - `,
      `Explore ${title} with our guide: `,
      `Your complete guide to ${title}: `,
      `Learn about ${title} - `,
      `Master ${title} with our tips: `,
      `Experience ${title} like never before: `,
      `Plan your perfect ${title} trip: `,
      `Everything you need to know about ${title}: `,
      `The ultimate ${title} guide: `,
      `Make the most of your ${title} journey: `
    ];

    // सभी सजेशन्स जनरेट करें
    const suggestions = [
      // टेम्पलेट्स के साथ सेंटेंसेस
      ...templates.map(template => 
        sentences.map(sentence => ({
          description: template + sentence.substring(0, 100) + '...',
          score: calculateMetaDescriptionScore(template + sentence),
          length: (template + sentence).length
        }))
      ).flat(),
      
      // बेसिक सजेशन्स
      ...generateBasicMetaDescription(content, title)
    ];

    // डुप्लिकेट्स हटाएं और स्कोर के हिसाब से सॉर्ट करें
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [item.description, item])).values()
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // टॉप 10 सजेशन्स

    return uniqueSuggestions;
  } catch (error) {
    return generateBasicMetaDescription(content, title);
  }
};

// मेटा कीवर्ड्स सजेशन्स अपडेट करें
export const getMetaKeywordsSuggestions = async (content, title) => {
  try {

    // RapidAPI से कीवर्ड मेट्रिक्स
    let rapidApiKeywords = [];
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

        rapidApiKeywords = rapidResponse.data
          .filter(metric => metric.keyword_difficulty < 70) // सिर्फ कम डिफिकल्टी वाले कीवर्ड्स
          .map(metric => ({
            keyword: metric.keyword,
            relevance: 100 - metric.keyword_difficulty,
            source: 'Ahrefs'
          }));
      } catch (rapidError) {
      }
    }

    // Google Trends से डेटा
    let trendsKeywords = [];
    try {
      const trendsData = await GoogleTrends.relatedQueries({
        keyword: title,
        geo: 'IN',
        hl: 'hi',
        timezone: 330
      });

      trendsKeywords = (trendsData.default?.rankedList[0]?.rankedKeyword || [])
        .map(query => ({
          keyword: query.query,
          relevance: query.value,
          source: 'Google Trends'
        }));
    } catch (trendsError) {
    }

    // कंटेंट से कीवर्ड्स एक्सट्रैक्ट करें
    const contentKeywords = extractKeywordsFromContent(content)
      .map(keyword => ({
        keyword,
        relevance: calculateKeywordRelevance(keyword, content, title),
        source: 'Content'
      }));

    // सभी कीवर्ड्स को कंबाइन करें
    const allKeywords = [
      ...rapidApiKeywords,
      ...trendsKeywords,
      ...contentKeywords,
      {
        keyword: title.toLowerCase(),
        relevance: 100,
        source: 'Title'
      },
      ...title.toLowerCase().split(' ').map(word => ({
        keyword: word,
        relevance: 80,
        source: 'Title'
      }))
    ];

    // डुप्लिकेट्स हटाएं और रिलेवेंस के हिसाब से सॉर्ट करें
    const uniqueKeywords = Array.from(
      new Map(allKeywords.map(item => [item.keyword, item])).values()
    )
    .filter(k => k.keyword.length > 2) // छोटे कीवर्ड्स हटाएं
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 15); // टॉप 15 कीवर्ड्स

    return uniqueKeywords;
  } catch (error) {
    return [];
  }
};

// हेल्पर फंक्शन्स
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
  
  // कीवर्ड डेंसिटी स्कोर
  const density = calculateKeywordDensity(content, keywords);
  const avgDensity = Object.values(density).reduce((a, b) => a + b, 0) / keywords.length;
  if (avgDensity >= 0.5 && avgDensity <= 2.5) score += 30;
  
  // कंटेंट लेंथ स्कोर
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) score += 30;
  
  // रीडेबिलिटी स्कोर
  score += calculateReadabilityScore(content) * 0.4;

  return score;
};

const calculateMetaDescriptionScore = (description) => {
  let score = 100;
  
  // लेंथ चेक
  if (description.length < 120) score -= 20;
  if (description.length > 160) score -= 15;
  
  // कीवर्ड्स चेक
  if (!description.includes('how to') && !description.includes('guide')) score -= 10;
  if (!description.includes('best') && !description.includes('tips')) score -= 10;
  
  // रीडेबिलिटी चेक
  const sentences = description.split(/[.!?]+/).length;
  if (sentences > 2) score -= 10;
  
  return Math.max(0, score);
};

const extractKeywordsFromContent = (content) => {
  // कंटेंट से स्टॉप वर्ड्स हटाएं
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopWords.includes(word) && word.length > 3);

  // वर्ड फ्रीक्वेंसी कैलकुलेट करें
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // टॉप कीवर्ड्स रिटर्न करें
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

const calculateKeywordRelevance = (keyword, content, title) => {
  let relevance = 0;
  
  // टाइटल में कीवर्ड
  if (title.toLowerCase().includes(keyword)) relevance += 5;
  
  // कंटेंट में कीवर्ड फ्रीक्वेंसी
  const regex = new RegExp(keyword, 'gi');
  const matches = content.match(regex) || [];
  relevance += matches.length;
  
  // कीवर्ड लेंथ स्कोर
  if (keyword.length > 5) relevance += 2;
  
  // कीवर्ड कॉम्प्लेक्सिटी
  if (keyword.includes(' ')) relevance += 3;
  
  return relevance;
}; 