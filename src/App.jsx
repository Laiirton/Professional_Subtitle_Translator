import { useState, useCallback } from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiCheck, FiX, FiMinus, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { invoke } from "@tauri-apps/api/core";
import { appWindow } from "@tauri-apps/api/window";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1b1e;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2c2d31;
  padding: 0.5rem 1rem;
  -webkit-app-region: drag;
`;

const WindowControls = styled.div`
  display: flex;
  gap: 0.5rem;
  -webkit-app-region: no-drag;
`;

const WindowButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#6366f1' : '#4b4c52'};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  background: ${props => props.isDragActive ? 'rgba(99, 102, 241, 0.1)' : '#2c2d31'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
  }
`;

const LanguageSelect = styled.select`
  background: #2c2d31;
  color: #ffffff;
  border: 1px solid #4b4c52;
  padding: 0.75rem;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #6366f1;
  }
`;

const TranslateButton = styled(motion.button)`
  background: #6366f1;
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    background: #4b4c52;
    cursor: not-allowed;
  }
`;

const PreviewSection = styled.div`
  background: #2c2d31;
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Toast = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: ${props => props.type === 'error' ? '#ef4444' : '#10b981'};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled(motion.div)`
  width: 100%;
  height: 4px;
  background: #2c2d31;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: #6366f1;
  width: ${props => props.progress}%;
`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.name.endsWith('.srt')) {
        setSelectedFile(file);
        showToast('File selected successfully', 'success');
      } else {
        showToast('Please select an SRT file', 'error');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/srt': ['.srt'],
    },
    multiple: false
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTranslate = async () => {
    if (!selectedFile) return;
    
    setIsTranslating(true);
    setProgress(0);
    
    try {
      const fileContent = await readFile(selectedFile);
      const suggestedName = selectedFile.name.replace('.srt', `_${targetLanguage}.srt`);
      
      const translatedContent = await translateSubtitleFile(
        fileContent,
        targetLanguage,
        (progress) => {
          setProgress(progress);
        }
      );
      
      const savedFileName = await saveFile(translatedContent, suggestedName);
      
      if (savedFileName) {
        showToast(`Translation saved as ${savedFileName}`, 'success');
      } else {
        showToast('Translation cancelled', 'error');
      }
    } catch (error) {
      console.error('Translation error:', error);
      showToast(error.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleMaximize = async () => {
    await appWindow.toggleMaximize();
    setIsMaximized(!isMaximized);
  };

  return (
    <AppContainer>
      <TitleBar>
        <h1 style={{ fontSize: '1rem', margin: 0 }}>SRT Translator</h1>
        <WindowControls>
          <WindowButton onClick={() => appWindow.minimize()}>
            <FiMinus />
          </WindowButton>
          <WindowButton onClick={toggleMaximize}>
            {isMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
          </WindowButton>
          <WindowButton onClick={() => appWindow.close()} style={{ ':hover': { background: '#ef4444' } }}>
            <FiX />
          </WindowButton>
        </WindowControls>
      </TitleBar>

      <MainContent>
        <DropZone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <FiUpload size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
          <p>{selectedFile ? selectedFile.name : 'Drag & drop an SRT file here, or click to select'}</p>
        </DropZone>

        <LanguageSelect
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="pt-BR">Portuguese (Brazil)</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          {/* Add more language options */}
        </LanguageSelect>

        <TranslateButton
          onClick={handleTranslate}
          disabled={!selectedFile || isTranslating}
          whileTap={{ scale: 0.98 }}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </TranslateButton>

        {isTranslating && (
          <ProgressBar>
            <ProgressFill
              progress={progress}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </ProgressBar>
        )}

        {selectedFile && (
          <PreviewSection id="translationPreview">
            {/* Translation preview content */}
          </PreviewSection>
        )}
      </MainContent>

      <AnimatePresence>
        {toast && (
          <Toast
            type={toast.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.type === 'success' ? <FiCheck /> : <FiX />}
            {toast.message}
          </Toast>
        )}
      </AnimatePresence>
    </AppContainer>
  );
}

export default App;
