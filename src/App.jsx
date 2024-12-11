import React, { useState } from 'react';
import styled from 'styled-components';
import { translateSubtitleFile } from './services/translationService';

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  justify-content: center;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 0.5rem;
`;

const FileInfo = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  align-items: center;
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

  &:disabled {
    background: #4B5563;
    cursor: not-allowed;
  }
`;

const FileStatus = styled.p`
  color: #94A3B8;
  font-size: 0.9rem;
  text-align: center;
`;

const FolderStatus = styled.p`
  color: #94A3B8;
  font-size: 0.9rem;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 30px;
  background: #2A2B3D;
  border-radius: 10px;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #4F46E5;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
  position: relative;
`;

const ProgressText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  min-width: 40px;
  text-align: center;
`;

const QueueContainer = styled.div`
  margin-top: 1rem;
  background: #2A2B3D;
  border-radius: 8px;
  padding: 1rem;
`;

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: ${props => {
    if (props.$status === 'concluído') return 'rgba(16, 185, 129, 0.1)';
    if (props.$status === 'em progresso') return 'rgba(79, 70, 229, 0.1)';
    if (props.$status === 'erro') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(107, 114, 128, 0.1)';
  }};
  border-radius: 6px;
`;

const QueueStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: ${props => {
    if (props.$status === 'concluído') return '#10B981';
    if (props.$status === 'em progresso') return '#4F46E5';
    if (props.$status === 'erro') return '#EF4444';
    return '#6B7280';
  }};
  background: ${props => {
    if (props.$status === 'concluído') return 'rgba(16, 185, 129, 0.2)';
    if (props.$status === 'em progresso') return 'rgba(79, 70, 229, 0.2)';
    if (props.$status === 'erro') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(107, 114, 128, 0.2)';
  }};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #EF4444;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
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
  margin-top: 1rem;

  &:hover {
    background: #4338CA;
  }

  &:disabled {
    background: #4B5563;
    cursor: not-allowed;
  }
`;

const OutputFolderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const FolderText = styled.span`
  color: #94A3B8;
  font-size: 0.9rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'pendente':
        return 'rgba(107, 114, 128, 0.2)';
      case 'em_progresso':
        return 'rgba(79, 70, 229, 0.2)';
      case 'concluido':
        return 'rgba(16, 185, 129, 0.2)';
      case 'erro':
        return 'rgba(239, 68, 68, 0.2)';
      default:
        return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pendente':
        return '#6B7280';
      case 'em_progresso':
        return '#4F46E5';
      case 'concluido':
        return '#10B981';
      case 'erro':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }};
`;

function App() {
  const [fileQueue, setFileQueue] = useState([]);
  const [targetLanguage, setTargetLanguage] = useState('pt-BR');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [outputFolder, setOutputFolder] = useState(null);

  const selectOutputFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      try {
        // Tenta verificar se podemos criar arquivos na pasta
        const testHandle = await handle.getFileHandle('test.tmp', { create: true });
        // Se conseguir criar, remove o arquivo de teste
        await testHandle.remove();
        
        setOutputFolder(handle);
      } catch (error) {
        throw new Error('A pasta selecionada não permite a criação de arquivos. Por favor, escolha outra pasta.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao selecionar pasta:', error);
        alert(error.message || 'Erro ao selecionar a pasta de destino. Por favor, escolha uma pasta que você tenha permissão para salvar arquivos.');
      }
    }
  };

  const handleFileSelect = async () => {
    try {
      const fileHandles = await window.showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'SubRip Subtitle Files',
          accept: {
            'text/srt': ['.srt']
          }
        }]
      });
      
      const newFiles = await Promise.all(fileHandles.map(async handle => {
        const file = await handle.getFile();
        return {
          file,
          handle,
          status: 'pendente',
          progress: 0,
          error: null,
          translatedContent: null
        };
      }));

      setFileQueue(prevQueue => [...prevQueue, ...newFiles]);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao selecionar arquivos:', error);
        alert('Erro ao selecionar os arquivos. Por favor, tente novamente.');
      }
    }
  };

  const saveTranslatedFile = async (fileIndex, translatedContent) => {
    if (!outputFolder || !translatedContent) return;

    const currentFile = fileQueue[fileIndex];
    if (!currentFile) return;

    try {
      const newFileName = `${currentFile.file.name.replace('.srt', '')}_${targetLanguage}.srt`;
      const fileHandle = await outputFolder.getFileHandle(newFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(translatedContent);
      await writable.close();

      setFileQueue(prevQueue => prevQueue.map((item, index) => 
        index === fileIndex ? { ...item, status: 'concluido', progress: 100 } : item
      ));

      console.log(`Arquivo salvo com sucesso: ${newFileName}`);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      setFileQueue(prevQueue => prevQueue.map((item, index) => 
        index === fileIndex ? { ...item, status: 'erro', error: 'Erro ao salvar o arquivo' } : item
      ));
      alert('Erro ao salvar o arquivo. Por favor, verifique a pasta de destino e tente novamente.');
    }
  };

  const processFile = async (fileIndex) => {
    if (fileIndex < 0 || fileIndex >= fileQueue.length || !outputFolder) return;

    setCurrentFileIndex(fileIndex);
    setIsTranslating(true);
    setProgress(0);

    const currentFile = fileQueue[fileIndex];
    setFileQueue(prevQueue => prevQueue.map((item, index) => 
      index === fileIndex ? { ...item, status: 'em_progresso' } : item
    ));

    try {
      const content = await currentFile.file.text();
      
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('Chave da API do Gemini não configurada. Configure a variável VITE_GEMINI_API_KEY no arquivo .env');
      }
      
      const translatedContent = await translateSubtitleFile(
        content,
        targetLanguage,
        (progress, currentBlockText) => {
          setProgress(Math.round(progress));
          setFileQueue(prevQueue => prevQueue.map((item, index) => 
            index === fileIndex ? { ...item, progress } : item
          ));
        }
      );

      await saveTranslatedFile(fileIndex, translatedContent);

      const nextFileIndex = fileQueue.findIndex((file, index) => index > fileIndex && file.status === 'pendente');
      if (nextFileIndex !== -1) {
        setTimeout(() => processFile(nextFileIndex), 1000);
      }

    } catch (error) {
      console.error('Erro detalhado:', error);
      setFileQueue(prevQueue => prevQueue.map((item, index) => 
        index === fileIndex ? { ...item, status: 'erro', error: error.message } : item
      ));
      alert(error.message || 'Ocorreu um erro durante a tradução. Verifique se a chave da API está configurada corretamente.');
    } finally {
      setIsTranslating(false);
      setProgress(0);
      setCurrentFileIndex(-1);
    }
  };

  const handleTranslate = () => {
    if (!outputFolder) {
      alert('Por favor, selecione uma pasta de destino antes de iniciar a tradução.');
      return;
    }
    
    const nextFileIndex = fileQueue.findIndex(file => file.status === 'pendente');
    if (nextFileIndex !== -1) {
      processFile(nextFileIndex);
    }
  };

  const removeFromQueue = (index) => {
    if (index === currentFileIndex && isTranslating) {
      alert('Não é possível remover um arquivo que está sendo traduzido.');
      return;
    }
    setFileQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
  };

  return (
    <AppContainer>
      <Title>Professional Subtitle Translator</Title>
      
      <FileSection>
        <ButtonGroup>
          <ButtonColumn>
            <FileButton onClick={handleFileSelect} disabled={isTranslating}>
              {isTranslating ? 'Processando...' : 'Selecionar Arquivos SRT'}
            </FileButton>
            <FileStatus>
              {fileQueue.length === 0 ? 'Nenhum arquivo selecionado' : `${fileQueue.length} arquivo(s) na fila`}
            </FileStatus>
          </ButtonColumn>
          <ButtonColumn>
            <FileButton onClick={selectOutputFolder} disabled={isTranslating}>
              Selecionar Pasta de Destino
            </FileButton>
            <FileStatus>
              {outputFolder ? outputFolder.name : 'Nenhuma pasta selecionada'}
            </FileStatus>
          </ButtonColumn>
        </ButtonGroup>
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

      {fileQueue.length > 0 && !isTranslating && (
        <TranslateButton
          onClick={handleTranslate}
          disabled={!fileQueue.some(file => file.status === 'pendente') || !outputFolder}
        >
          Traduzir Próximo Arquivo
        </TranslateButton>
      )}

      {isTranslating && (
        <ProgressBar>
          <ProgressFill $progress={progress} />
          <ProgressText>{Math.round(progress)}%</ProgressText>
        </ProgressBar>
      )}

      {fileQueue.length > 0 && (
        <QueueContainer>
          {fileQueue.map((item, index) => (
            <QueueItem key={index} $status={item.status}>
              <div>
                <span>{item.file.name}</span>
                <StatusBadge $status={item.status}>
                  {item.status === 'em_progresso' && `${Math.round(item.progress)}%`}
                  {item.status === 'pendente' && 'Aguardando'}
                  {item.status === 'concluido' && 'Concluído'}
                  {item.status === 'erro' && 'Erro'}
                </StatusBadge>
              </div>
              {item.status !== 'em_progresso' && (
                <RemoveButton onClick={() => removeFromQueue(index)}>
                  ✕
                </RemoveButton>
              )}
            </QueueItem>
          ))}
        </QueueContainer>
      )}
    </AppContainer>
  );
}

export default App;
