import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './index.css';

export const createRoot = ViteReactSSG({ routes });
