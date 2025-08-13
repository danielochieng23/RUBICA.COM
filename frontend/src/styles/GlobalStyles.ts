import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.75rem; }
  h4 { font-size: 1.5rem; }
  h5 { font-size: 1.25rem; }
  h6 { font-size: 1rem; }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: #e91e63;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #c2185b;
    }
  }

  button {
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.3s ease;
  }

  input, textarea, select {
    font-family: 'Montserrat', sans-serif;
    outline: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #e91e63;
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    h1 { font-size: 2rem; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    h5 { font-size: 1.1rem; }
    h6 { font-size: 1rem; }
  }
`;