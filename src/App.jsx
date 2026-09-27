import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Collections from "./pages/Collections";
import Consultations from "./pages/Consultations";
import DesignsList from "./pages/DesignsList";
import DesignForm from "./pages/DesignForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/designs" element={<DesignsList />} />
          <Route path="/designs/new" element={<DesignForm />} />
          <Route path="/designs/:id/edit" element={<DesignForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/consultations" element={<Consultations />} />
        </Route>
      </Route>
    </Routes>
  );
}
