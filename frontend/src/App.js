import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ClientReservation from './ClientReservation';
import AdminDashboardComplete from './AdminDashboardComplete';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientReservation />} />
        <Route path="/admin" element={<AdminDashboardComplete />} />
      </Routes>
    </Router>
  );
}

export default App;