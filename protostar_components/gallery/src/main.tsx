import React from 'react';
import { createRoot } from 'react-dom/client';
import '@protostar/components/styles.css';
import { DemoStyleGuidePage } from './pages/demo-style-guide/DemoStyleGuidePage';
import { ComponentGalleryPage } from './pages/component-gallery/ComponentGalleryPage';

createRoot(document.getElementById('root')!).render(
  window.location.pathname === '/' ? <ComponentGalleryPage /> : window.location.pathname === '/example' ? <DemoStyleGuidePage /> : <main><h1>页面不存在</h1><a href="/">打开组件 Gallery</a></main>,
);
