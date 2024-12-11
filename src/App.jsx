import React, { useState } from 'react';
import styled from 'styled-components';

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

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('pt-BR');

  const handleFileSelect = async () => {
    try {
      // Implementar seleção de arquivo
      console.log('Selecionar arquivo');
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
    }
  };

  const handleTranslate = async () => {
    try {
      // Implementar tradução
      console.log('Traduzindo...');
    } catch (error) {
      console.error('Erro na tradução:', error);
    }
  };

  return (
    <AppContainer>
      <Title>Professional Subtitle Translator</Title>
      
      <FileSection>
        <FileButton onClick={handleFileSelect}>
          Select SRT File
        </FileButton>
        <FileStatus>
          {selectedFile ? selectedFile.name : 'No file selected'}
        </FileStatus>
      </FileSection>

      <LanguageSelect
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        <option value="pt-BR">Portuguese (Brazil)</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="it">Italian</option>
        <option value="ja">Japanese</option>
        <option value="ko">Korean</option>
        <option value="zh-CN">Chinese (Simplified)</option>
        <option value="ru">Russian</option>
      </LanguageSelect>

      <TranslateButton
        onClick={handleTranslate}
        disabled={!selectedFile}
      >
        Translate
      </TranslateButton>
    </AppContainer>
  );
}

export default App;
