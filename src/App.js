import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NovelDetailPage from "./pages/NovelDetailPage";
import ChapterPage from "./pages/ChapterPage";
import Library from "./pages/Library";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/novel/:id" element={<NovelDetailPage />} />
          <Route path="/chapter" element={<ChapterPage />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
