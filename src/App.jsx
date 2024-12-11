import React, { useState } from 'react';
import styled from 'styled-components';
import { translateSubtitleFile, saveFile } from './services/translationService';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1E1F2E;
  color: #ffffff;
  padding: 2rem;
  gap: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #3B82F6;
  text-align: center;
  margin-bottom: 2rem;
`;

const FileSection = styled.div`
  border: 2px dashed #3B82F6;
  border-radius: 10px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.05);
`;

const FileButton = styled.button`
  background: #3B82F6;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563EB;
  }
`;

const FileStatus = styled.p`
  color: #94A3B8;
  font-size: 0.9rem;
`;

const LanguageSelect = styled.select`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  background: #2A2B3D;
  border: 1px solid #3B82F6;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #2563EB;
  }

  option {
    background: #2A2B3D;
    color: white;
  }
`;

const TranslateButton = styled.button`
  background: #4F46E5;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #4338CA;
  }

  &:disabled {
    background: #4B5563;
    cursor: not-allowed;
  }
`;

const PreviewBox = styled.div`
  background: #2A2B3D;
  border: 1px solid #3B82F6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  color: #94A3B8;
`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('pt-BR');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBlock, setCurrentBlock] = useState('');

  const handleFileSelect = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'SubRip Subtitle Files',
          accept: {
            'text/srt': ['.srt']
          }
        }]
      });
      
      const file = await fileHandle.getFile();
      setSelectedFile(file);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao selecionar arquivo:', error);
        alert('Erro ao selecionar o arquivo. Por favor, tente novamente.');
      }
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile) return;

    try {
      setIsTranslating(true);
      const content = await selectedFile.text();
      
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('Chave da API do Gemini não configurada. Configure a variável VITE_GEMINI_API_KEY no arquivo .env');
      }
      
      const translatedContent = await translateSubtitleFile(
        content,
        targetLanguage,
        (progress, currentBlockText) => {
          setProgress(Math.round(progress));
          setCurrentBlock(currentBlockText || '');
        }
      );

      const newFileName = `${selectedFile.name.replace('.srt', '')}_${targetLanguage}.srt`;
      const savedFileName = await saveFile(translatedContent, newFileName);
      
      if (savedFileName) {
        alert(`Arquivo traduzido salvo com sucesso como: ${savedFileName}`);
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      alert(error.message || 'Ocorreu um erro durante a tradução. Verifique se a chave da API está configurada corretamente.');
    } finally {
      setIsTranslating(false);
      setProgress(0);
      setCurrentBlock('');
    }
  };

  return (
    <AppContainer>
      <Title>Professional Subtitle Translator</Title>
      
      <FileSection>
        <FileButton onClick={handleFileSelect} disabled={isTranslating}>
          {isTranslating ? 'Processando...' : 'Selecionar Arquivo SRT'}
        </FileButton>
        <FileStatus>
          {selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}
        </FileStatus>
      </FileSection>

      <LanguageSelect
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
        disabled={isTranslating}
      >
        <option value="pt-BR">Português (Brasil)</option>
        <option value="en">Inglês</option>
        <option value="es">Espanhol</option>
        <option value="fr">Francês</option>
        <option value="de">Alemão</option>
        <option value="it">Italiano</option>
        <option value="ja">Japonês</option>
        <option value="ko">Coreano</option>
        <option value="zh-CN">Chinês (Simplificado)</option>
        <option value="ru">Russo</option>
      </LanguageSelect>

      <TranslateButton
        onClick={handleTranslate}
        disabled={!selectedFile || isTranslating}
      >
        {isTranslating ? `${progress}%` : 'Traduzir'}
      </TranslateButton>

      {isTranslating && currentBlock && (
        <PreviewBox>
          {currentBlock}
        </PreviewBox>
      )}
    </AppContainer>
  );
}

export default App;
