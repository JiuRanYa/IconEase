import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import { RouterProvider } from 'react-router-dom';

import { getContainer } from './components/Message/MessageContainer';
import { router } from './router';
import { useImageStore } from './stores/imageStore';
import './i18n';

const initDarkMode = () => {
  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

initDarkMode();

getContainer();
useImageStore.getState().initImages().catch(console.error);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
