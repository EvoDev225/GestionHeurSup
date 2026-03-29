import { BrowserRouter, Routes, Route } from "react-router-dom";
import Accueil from "./Accueil.jsx"
import Dashboard from "./components/Admin/Dashboard.jsx"
import DashboardAdminUser from "./components/Admin/DashboardAdminUser.jsx";

function App() {
  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/dashboard-admin" element={<Dashboard />} />
          <Route path="/dashboard-admin-user" element={<DashboardAdminUser />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
