import { Spinner } from "flowbite-react";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
import { customAlert } from "../../config/alert/alert";
import AxiosClient from "../../config/http-gateway/http-client";
import { useNavigate } from "react-router-dom";
import NeonLogo from "../../assets/img/log.png";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email("Ingresa un correo electrónico válido")
        .required("El correo electrónico es obligatorio"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await AxiosClient({
          url: "/users/request-password-reset",
          method: "POST",
          data: values,
        });
        
        if (!response?.data?.error) {
          navigate(`/reset-password?userId=${response.userId}`);
          customAlert(
            "Correo enviado",
            "Se ha enviado un correo electrónico para restablecer tu contraseña",
            "success"
          );
        } else {
          throw Error(response.data.message);
        }
      } catch (error) {
        customAlert(
          "Restablecer contraseña",
          "Ocurrió un error al enviar el correo electrónico",
          "error"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6 relative overflow-hidden">
      {/* Efecto de grid futurista */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px]"></div>
      </div>
      
      {/* Efectos de luz neón */}
      <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-cyan-500/10 filter blur-3xl"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-purple-500/10 filter blur-3xl"></div>
      
      {/* Tarjeta principal */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Efecto de borde neón */}
        <div className="absolute inset-0 rounded-xl border-2 border-cyan-500/30 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-xl border border-cyan-500/50 pointer-events-none animate-pulse-slow"></div>
        
        <div className="backdrop-blur-sm bg-black/50 border border-gray-800/50 rounded-xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/10 transition-all duration-500 hover:shadow-cyan-500/20">
          {/* Logo y título */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <img 
                src={NeonLogo} 
                alt="Neon Logo" 
                className="h-16 mb-4 glow-cyan" 
              />
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md -z-10"></div>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-400 text-sm">Sistema de Gestión de Inventario</p>
          </div>

          <form 
            className="space-y-6" 
            onSubmit={formik.handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSubmitting && formik.isValid) {
                formik.handleSubmit();
              }
            }}
          >
            {/* Correo electrónico */}
            <div>
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'email' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'email' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('email')}
                  value={formik.values.email}
                  type="email"
                  placeholder="Ej. usuario@ejemplo.com"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.email && formik.errors.email 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.email && !formik.errors.email 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pl-10`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{formik.errors.email}</span>
                </motion.p>
              )}
              {formik.touched.email && !formik.errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-green-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Campo válido
                </motion.p>
              )}
            </div>

            {/* Botón de envío */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isSubmitting || !formik.isValid}
                whileHover={!isSubmitting && formik.isValid ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting && formik.isValid ? { scale: 0.98 } : {}}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/50 transition-all duration-300 ${
                  (isSubmitting || !formik.isValid) ? 'opacity-70' : 'hover:shadow-lg hover:shadow-cyan-400/30'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner size="sm" color="dark" className="mr-2" />
                    <span>Enviando enlace...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Enviar enlace de recuperación</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-500">
                  ¿Recordaste tu contraseña?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3 px-4 border border-gray-800 rounded-lg text-sm font-medium text-gray-300 bg-gray-900/50 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/10 hover:text-white"
              >
                Volver al inicio de sesión
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Efectos de partículas futuristas */}
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
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() * 3 + 1}px ${Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.1
            }}
          ></div>
        ))}
      </div>

      {/* Estilos globales para este componente */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        .glow-cyan {
          filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.3));
        }
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-100px) translateX(50px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;