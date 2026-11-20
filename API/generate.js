module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mainDescription, chapterPrompt } = req.body;

  if (!mainDescription) {
    return res.status(400).json({ error: 'Main description is required' });
  }

  let prompt = `Write a story chapter of at least 1500 words based on this main description: "${mainDescription}".`;
  if (chapterPrompt) {
    prompt += ` For this chapter, focus on: "${chapterPrompt}".`;
  }
  prompt += ' Ensure the chapter is highly detailed, engaging, and strictly at least 1500 words long.';

  const API_KEY = process.env.GEMINI_API_KEY; 
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 8192 
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const storyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!storyText) {
      throw new Error('No story generated.');
    }

    res.status(200).json({ story: storyText });
  } catch (error) {
    console.error('Generation failed:', error);
    res.status(500).json({ error: error.message });
  }
};
