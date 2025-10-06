import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import MovieDetail from './components/MovieDetail';
import './App.css';

function App() {
  return (
    <Router basename="/cs409-mp2-yawenou2">
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
