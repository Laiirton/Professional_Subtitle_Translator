import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1b1e;
  color: #ffffff;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #6366f1;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #a1a1aa;
`;

function App() {
  return (
    <AppContainer>
      <Title>SRT Translator</Title>
      <Subtitle>Bem-vindo ao tradutor de legendas!</Subtitle>
    </AppContainer>
  );
}

export default App;
