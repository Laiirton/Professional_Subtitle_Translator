import { GoogleGenerativeAI } from '@google/generative-ai';

export const translateSubtitleFile = async (fileContent, targetLanguage, onProgress) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Chave da API do Gemini não encontrada. Por favor, configure a variável VITE_GEMINI_API_KEY no arquivo .env');
  }

  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    };

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

    const normalizedContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const blocks = normalizedContent.split(/\n\s*\n/).filter(block => {
      const lines = block.trim().split('\n');
      return lines.length >= 2 && /^\d+$/.test(lines[0].trim()) && 
             /^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}$/.test(lines[1].trim());
    });

    const BLOCK_SIZE = 180;
    let translatedContent = [];

    for (let i = 0; i < blocks.length; i += BLOCK_SIZE) {
      try {
        const endIndex = Math.min(i + BLOCK_SIZE, blocks.length);
        const progress = (i / blocks.length) * 100;
        
        const blockSlice = blocks.slice(i, endIndex);
        const blockContent = blockSlice.join('\n\n');
        
        onProgress(progress, blockContent);
        
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

        const result = await chatSession.sendMessage(blockContent);
        const translatedBlock = result.response.text().trim();
        
        translatedContent.push(translatedBlock);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro traduzindo lote ${Math.floor(i / BLOCK_SIZE) + 1}:`, error);
        throw error;
      }
    }

    onProgress(100, '');
    return translatedContent.join('\n\n');
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      apiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'Configurada' : 'Não configurada'
    });
    throw new Error(`Erro na tradução: ${error.message}`);
  }
};

export const saveFile = async (content, suggestedName) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'SubRip Subtitle File',
        accept: { 'text/srt': ['.srt'] },
      }],
    });
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    return handle.name;
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error;
    }
    return null;
  }
};
