import { Outlet } from 'react-router-dom';
import './App.css';
import BackgroundMusic from './components/BackgroundMusic';

function App() {
  return (
    <>
      <Outlet />
      <BackgroundMusic />
    </>
  );
}

export default App;