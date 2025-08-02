import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "../config/context/auth-context";
import AdminLayout from "../module/admingeneral/AdminLayout";
import TrabajadorLayout from "../module/admingrupal/TrabajadorLayout";
import ForgotPasswordPage from "../module/auth/ForgotPasswordPage";
import ResetPasswordPage from "../module/auth/ResetPasswordPage";
import Home from "../module/admingeneral/Home";
import HomeT from "../module/admingrupal/HomeAdminG";
import SignInPage from "../module/auth/SingInpage";
import NotFound from "../components/NotFound";
import Profile from "../module/admingeneral/Profile";
import CreateUserPage from "../module/auth/CreateUserPage";
import Responsables from "../module/admingeneral/Responsables";
import Storages from "../module/admingeneral/Storages";
import Categories from "../module/admingeneral/Categories";
import Articles from "../module/admingeneral/Articles";
import Storage from "../module/admingrupal/Storage";

const AppRouter = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<SignInPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/create-user" element={<CreateUserPage />} />

        {/* Rutas protegidas ADMINISTRADOR */}
        {user?.signed && user?.roles?.name === "ADMINISTRADOR" && (
          <Route path="/administrador/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="responsables" element={<Responsables />} />
            <Route path="categories" element={<Categories />} />
            <Route path="storages" element={<Storages />} />
            <Route path="articles" element={<Articles />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        )}

        {/* Rutas protegidas TRABAJADOR */}
        {user?.signed && user?.roles?.name === "TRABAJADOR" && (
          <Route path="/trabajador/*" element={<TrabajadorLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomeT />} />
            <Route path="profile" element={<Profile />} />
            <Route path="storage" element={<Storage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        )}

        {/* Redirección según rol */}
        <Route
          path="*"
          element={
            user?.signed ? (
              user?.roles?.name === "ADMINISTRADOR" ? (
                <Navigate to="/administrador/home" replace />
              ) : (
                <Navigate to="/trabajador/home" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;