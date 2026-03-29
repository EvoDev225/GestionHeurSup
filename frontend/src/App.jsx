import { BrowserRouter, Routes, Route } from "react-router-dom";
import Accueil from "./Accueil.jsx"
import Dashboard from "./components/Admin/Dashboard.jsx"
import DashboardAdminUser from "./components/Admin/DashboardAdminUser.jsx";
import DashboardAdminMatiere from "./components/Admin/DashboardAdminMatiere.jsx";
import DashboardAdminParametres from "./components/Admin/DashboardAdminParametres.jsx";
import DashboardAdminExports from "./components/Admin/DashboardAdminExports.jsx";

function App() {
  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/dashboard-admin" element={<Dashboard />} />
          <Route path="/dashboard-admin-user" element={<DashboardAdminUser />} />
          <Route path="/dashboard-admin-matiere" element={<DashboardAdminMatiere />} />
          <Route path="/dashboard-admin-parametres" element={<DashboardAdminParametres />} />
          <Route path="/dashboard-admin-export" element={<DashboardAdminExports />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
