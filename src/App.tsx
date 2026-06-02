import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Captura from "./pages/Captura";
import Parceiros from "./pages/Parceiros";
import Produtos from "./pages/Produtos";
import Regras from "./pages/Regras";
import Divergencias from "./pages/Divergencias";
import Sped from "./pages/Sped";
import Assistente from "./pages/Assistente";
import WhiteLabel from "./pages/WhiteLabel";
import BaseFiscal from "./pages/BaseFiscal";
import { BrandProvider } from "./context/BrandContext";
import { AppProvider } from "./store/AppStore";

export default function App() {
  return (
    <BrandProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/captura" element={<Captura />} />
              <Route path="/parceiros" element={<Parceiros />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/regras" element={<Regras />} />
              <Route path="/divergencias" element={<Divergencias />} />
              <Route path="/sped" element={<Sped />} />
              <Route path="/base-fiscal" element={<BaseFiscal />} />
              <Route path="/assistente" element={<Assistente />} />
              <Route path="/white-label" element={<WhiteLabel />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </BrandProvider>
  );
}
