import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from './components/Menu';
import { LocalGame } from './pages/LocalGame';
import { OnlineGame } from './pages/OnlineGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/online/:roomId?" element={<OnlineGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;