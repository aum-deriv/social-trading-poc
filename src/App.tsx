import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { routes } from '@/routes/routes';
import { ThemeProvider } from '@/context/ThemeContext';
import './App.css';

function App() {
  const router = createBrowserRouter(routes);

  useEffect(() => {
    // Add no-transition class initially
    document.documentElement.classList.add('no-transition');

    // Remove it after a short delay
    const timeoutId = setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);

    // Cleanup function to remove class and clear timeout if component unmounts
    return () => {
      clearTimeout(timeoutId);
      document.documentElement.classList.remove('no-transition');
    };
  }, []); // Empty dependency array since this should only run once on mount

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
