import React, { useContext, useState } from "react";
import AuthContext from "../../config/context/auth-context";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import NeonLogo from "../../assets/img/log.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome, FaSignOutAlt, FaUser, FaBars, FaTimes,
  FaCog, FaBell, FaSearch, FaUsersCog, FaCalendarCheck,
  FaFileInvoice, FaUserFriends, FaChartLine, FaClipboardList
} from "react-icons/fa";
import { Spinner } from "flowbite-react";
import NotFound from "../../components/NotFound";

const TrabajadorLayout = () => {
  const { dispatch, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isNotFound = location.pathname.split('/').includes('*');

  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.clear();
      dispatch({ type: "SIGNOUT" });
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Menú de navegación específico para Grupal
  const navItems = [
    { to: "/trabajador/home", icon: <FaHome />, text: "Inicio" },
    { to: "/trabajador/storage", icon: <FaFileInvoice />, text: "Almacen" },
  ];

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black w-full relative overflow-hidden">
      {/* Efectos de fondo futuristas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(168, 85, 247, 0.5)',
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() * 3 + 1}px ${Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.3 + 0.1
            }}
          ></div>
        ))}
      </div>

      {/* --- Navbar Superior --- */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">

            {/* Logo + Hamburger (solo mobile) */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-cyan-500/10 transition-all text-cyan-400"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              <NavLink to="/trabajador/home" className="flex items-center space-x-2 group">
                <div className="relative">
                  <img src={NeonLogo} alt="Logo" className="h-10 w-10 glow-cyan" />
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md -z-10"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  SINV<span className="font-light">HUB</span>
                </span>
              </NavLink>
            </div>

            {/* Menú Principal (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1 mx-4 flex-1 justify-center">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  className={({ isActive }) => `
                    px-4 py-2 rounded-lg transition-all flex items-center
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-b-2 border-cyan-400'
                      : 'hover:bg-cyan-500/10 text-gray-300 hover:text-white'}
                  `}
                >
                  <span className="mr-2 text-cyan-400">{item.icon}</span>
                  {item.text}
                </NavLink>
              ))}
            </nav>

            {/* Controles de Usuario */}
            <div className="flex items-center space-x-4">

              <div className="relative group">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setTimeout(() => setIsHovered(false), 6000)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <span className="hidden lg:inline-block font-medium text-gray-300 group-hover:text-white">
                    {user?.name || "Trabajador"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl py-1 z-50 border border-gray-700/50 ${isHovered ? 'block' : 'hidden'} transition-all duration-300`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setTimeout(() => setIsHovered(false), 6000)}
                >
                  <NavLink
                    to="/trabajador/profile"
                    className="block px-4 py-2 text-gray-300 hover:bg-cyan-500/10 hover:text-white flex items-center"
                  >
                    <FaUser className="mr-2 text-cyan-400" />
                    Mi Perfil
                  </NavLink>
                  <button
                    onClick={signOut}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-cyan-500/10 hover:text-white flex items-center"
                  >
                    {isLoggingOut ? (
                      <>
                        <Spinner size="sm" color="info" className="mr-2" />
                        Saliendo...
                      </>
                    ) : (
                      <>
                        <FaSignOutAlt className="mr-2 text-cyan-400" />
                        Cerrar Sesión
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-3 w-full">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-cyan-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 text-white placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 border border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </header>

      {/* --- Menú Lateral Móvil --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-lg shadow-xl border-r border-cyan-500/20 md:hidden"
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <img src={Logo} alt="Logo" className="h-10 glow-cyan" />
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md -z-10"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    SAGG<span className="font-light">Grupal</span>
                  </span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-cyan-500/10 text-cyan-400"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <nav className="space-y-2 flex-grow">
                {navItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.to}
                    onClick={toggleMobileMenu}
                    className={({ isActive }) => `
                      flex items-center p-3 rounded-lg transition-all
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-l-4 border-cyan-400'
                        : 'hover:bg-cyan-500/10 text-gray-300 hover:text-white'}
                    `}
                  >
                    <span className="text-cyan-400 mr-3">{item.icon}</span>
                    <span>{item.text}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    signOut();
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-cyan-500/10 text-gray-300 hover:text-white"
                >
                  {isLoggingOut ? (
                    <>
                      <Spinner size="sm" color="info" className="mr-3" />
                      Saliendo...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt className="mr-3 text-cyan-400" />
                      Cerrar Sesión
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Contenido Principal --- */}
      <main className="flex-grow w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="w-full bg-gray-900/80 backdrop-blur-lg border-t border-cyan-500/20 py-6">
        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-cyan-400/70">
                © {new Date().getFullYear()} SINVHUB - Todos los derechos reservados
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                Términos
              </a>
              <a href="#" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Estilos globales para este componente */}
      <style jsx>{`
        .glow-cyan {
          filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.3));
        }
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TrabajadorLayout;