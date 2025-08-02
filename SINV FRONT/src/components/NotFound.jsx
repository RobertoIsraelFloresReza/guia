import { useNavigate } from "react-router-dom";
import { useState } from "react"; 
import NeonLogo from "../assets/img/log.png";
import { motion } from "framer-motion";
import { FaArrowLeft, FaLifeRing, FaSignOutAlt } from "react-icons/fa";
import { RiErrorWarningFill } from "react-icons/ri";
import Swal from "sweetalert2";
import { Spinner } from "flowbite-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Al ir al inicio cerrarás tu sesión actual. ¿Estás seguro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00f0ff',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#0a0a0a',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true);
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        navigate("/");
      }
    });
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      {/* Efectos de partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(168, 85, 247, 0.5)',
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Tarjeta principal */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg p-8 space-y-6 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/30 mx-2 text-center relative"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="relative mb-6">
          <div className="relative inline-block">
            <img 
              src={NeonLogo} 
              alt="Logo" 
              className="h-28 mx-auto filter drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
            />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full p-2 shadow-lg"
            >
              <RiErrorWarningFill className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Contenido */}
        <motion.div variants={itemVariants}>
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-400 mb-2">
            404
          </h1>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-semibold text-white mb-4">
            ¡Ups! Página no encontrada
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="text-cyan-400/80">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-24 w-24 mx-auto"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="text-gray-400 mb-8 px-6 text-lg">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </motion.div>

        {/* Botones */}
        <motion.div variants={itemVariants} className="w-full space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-6 rounded-lg text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            <span>Volver atrás</span>
          </button>
          
          <button
            onClick={confirmLogout}
            disabled={isLoggingOut}
            className="w-full py-3 px-6 bg-gray-800/50 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <Spinner size="sm" color="info" className="mr-2" />
                <span>Saliendo...</span>
              </>
            ) : (
              <>
                <FaSignOutAlt />
                <span>Ir al inicio (Cerrar sesión)</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Soporte */}
        <motion.div variants={itemVariants} className="pt-6 mt-6 border-t border-cyan-500/20">
          <button className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-2 mx-auto text-sm">
            <FaLifeRing />
            <span>Contactar soporte técnico</span>
          </button>
        </motion.div>
      </motion.div>

      <style jsx>{`
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

export default NotFound;