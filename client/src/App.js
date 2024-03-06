// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Game from './pages/Game';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/game" element={<Game />} />
                <Route path="/" element={<LandingPage />} />
            </Routes>
        </Router>
    );
}

export default App;

