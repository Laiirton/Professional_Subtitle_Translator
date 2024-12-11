import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #1a1b1e;
    color: #ffffff;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #2c2d31;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #4b4c52;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6366f1;
  }

  ::selection {
    background: #6366f1;
    color: #ffffff;
  }
`;

export default GlobalStyles;
