import { GoogleGenerativeAI } from '@google/generative-ai';

// Main function to translate subtitle files using Google's Gemini API
export const translateSubtitleFile = async (fileContent, targetLanguage, onProgress) => {
  // Verify if API key is configured
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Chave da API do Gemini não encontrada. Por favor, configure a variável VITE_GEMINI_API_KEY no arquivo .env');
  }

  try {
    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Configure generation parameters for optimal translation
    const generationConfig = {
      temperature: 0.7,     // Controls randomness (0.0 = deterministic, 1.0 = creative)
      topP: 0.8,           // Nucleus sampling parameter
      topK: 40,            // Limits vocabulary diversity
      maxOutputTokens: 8192, // Maximum response length
    };

    // Map of language codes to full language names for Gemini API
    const languageMap = {
      'en': 'English',
      'pt-BR': 'Brazilian Portuguese',
      'pt-PT': 'European Portuguese',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh-CN': 'Simplified Chinese',
      'zh-TW': 'Traditional Chinese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'pl': 'Polish',
      'vi': 'Vietnamese',
      'th': 'Thai',
      'id': 'Indonesian',
      'ms': 'Malay',
      'fil': 'Filipino',
      'bn': 'Bengali',
      'uk': 'Ukrainian',
      'cs': 'Czech',
      'sv': 'Swedish',
      'da': 'Danish',
      'fi': 'Finnish',
      'el': 'Greek',
      'he': 'Hebrew',
      'hu': 'Hungarian',
      'no': 'Norwegian',
      'ro': 'Romanian',
      'sk': 'Slovak',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sr': 'Serbian',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'fa': 'Persian',
      'ur': 'Urdu'
    };

    // Normalize line endings for consistent processing
    const normalizedContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split content into blocks and validate SRT format
    // Each block should have: number, timestamp, and subtitle text
    const blocks = normalizedContent.split(/\n\s*\n/).filter(block => {
      const lines = block.trim().split('\n');
      return lines.length >= 2 && /^\d+$/.test(lines[0].trim()) && 
             /^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}$/.test(lines[1].trim());
    });

    // Process subtitles in chunks to avoid token limits
    const BLOCK_SIZE = 180; // Number of subtitle blocks per request
    let translatedContent = [];

    // Iterate through blocks in chunks
    for (let i = 0; i < blocks.length; i += BLOCK_SIZE) {
      try {
        // Calculate current chunk range and progress
        const endIndex = Math.min(i + BLOCK_SIZE, blocks.length);
        const progress = (i / blocks.length) * 100;
        
        const blockSlice = blocks.slice(i, endIndex);
        const blockContent = blockSlice.join('\n\n');
        
        onProgress(progress, blockContent);
        
        // Initialize chat session with translation instructions
        const chatSession = model.startChat({
          generationConfig,
          history: [
            {
              role: "user",
              parts: [{ text: `You are a professional subtitle translator. Translate the following subtitle block to ${languageMap[targetLanguage]}. 
              Keep all subtitle numbers and time codes exactly as they are.
              Keep the same format and structure as the SRT file.
              Translate only the subtitle text, keeping all technical aspects of the file intact.
              Ensure natural and contextually appropriate translations.
              
              Original subtitle block:
              ${blockContent}` }],
            }
          ],
        });

        // Get translation and add to results
        const result = await chatSession.sendMessage(blockContent);
        const translatedBlock = result.response.text().trim();
        
        translatedContent.push(translatedBlock);

        // Rate limiting - pause between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro traduzindo lote ${Math.floor(i / BLOCK_SIZE) + 1}:`, error);
        throw error;
      }
    }

    onProgress(100, '');
    return translatedContent.join('\n\n');
  } catch (error) {
    // Log detailed error information for debugging
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      apiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'Configurada' : 'Não configurada'
    });
    throw new Error(`Erro na tradução: ${error.message}`);
  }
};

// Function to save translated content to a file using the File System Access API
export const saveFile = async (content, suggestedName) => {
  try {
    // Show file save dialog
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'SubRip Subtitle File',
        accept: { 'text/srt': ['.srt'] },
      }],
    });
    
    // Write content to file
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    return handle.name;
  } catch (error) {
    // Ignore abort errors (user cancelled)
    if (error.name !== 'AbortError') {
      throw error;
    }
    return null;
  }
};
