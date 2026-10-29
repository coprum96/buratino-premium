import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/index.css';
import '../src/motion/motion.css';
import './film.css';
import { LaunchFilm } from './LaunchFilm';

const params = new URLSearchParams(window.location.search);
const ratioParam = params.get('ratio');
const ratio = ratioParam === '9x16' || ratioParam === '1x1' ? ratioParam : '16x9';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LaunchFilm ratio={ratio} />
  </React.StrictMode>
);
