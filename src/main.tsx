import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { router } from './app/router';
import { store } from './app/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/fonts.css';
import './styles/theme.scss';

// Some libraries expect a Node-like `global` to exist in the browser.
// Provide a small shim so imports like Draft.js work without bundler polyfills.
(window as any).global = window;

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container was not found');
}

createRoot(container).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer autoClose={5000} hideProgressBar newestOnTop />
    </Provider>
  </React.StrictMode>
);
