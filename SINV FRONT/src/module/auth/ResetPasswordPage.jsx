import { useFormik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
import { customAlert } from "../../config/alert/alert";
import AxiosClient from "../../config/http-gateway/http-client";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import NeonLogo from "../../assets/img/log.png";
import { motion } from "framer-motion";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const userId = urlParams.get("userId");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const formik = useFormik({
    initialValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: yup.object().shape({
      token: yup.string().required("Campo obligatorio"),
      newPassword: yup.string()
        .min(8, 'Mínimo 8 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .matches(/^[^<>=()\/\\{}[\]]*$/, 'Caracteres no permitidos')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Debe contener: mayúscula, minúscula, número y carácter especial')
        .trim('No espacios al inicio/fin')
        .strict(true)
        .required('Campo obligatorio'),
      confirmPassword: yup.string()
        .oneOf([yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
        .required('Campo obligatorio'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          token: values.token,
          newPassword: values.newPassword,
          idUser: userId,
        };

        const response = await AxiosClient({
          url: "/users/reset-password",
          method: "POST",
          data: payload,
        });

        if (!response?.data?.error) {
          customAlert(
            "Contraseña restablecida",
            "Tu contraseña ha sido restablecida con éxito",
            "success"
          );
          navigate("/");
        } else {
          throw Error(response.data.message);
        }
      } catch (error) {
        customAlert(
          "Restablecer contraseña",
          "Ocurrió un error al restablecer la contraseña",
          "error"
        );
      } finally {
        setSubmitting(false);
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
              Restablecer Contraseña
            </h1>
            <p className="text-gray-400 text-sm">Sistema de Gestión de Inventario</p>
          </div>

          <form 
            className="space-y-6" 
            onSubmit={formik.handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !formik.isSubmitting && formik.isValid) {
                formik.handleSubmit();
              }
            }}
          >
            {/* Campo Token */}
            <div>
              <label 
                htmlFor="token" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'token' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Token de verificación
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'token' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="token"
                  name="token"
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('token')}
                  value={formik.values.token}
                  type="text"
                  placeholder="Ingresa el token recibido"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.token && formik.errors.token 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.token && !formik.errors.token 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pl-10`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              {formik.touched.token && formik.errors.token && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{formik.errors.token}</span>
                </motion.p>
              )}
              {formik.touched.token && !formik.errors.token && (
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

            {/* Campo Nueva Contraseña */}
            <div>
              <label 
                htmlFor="newPassword" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'newPassword' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'newPassword' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('newPassword')}
                  value={formik.values.newPassword}
                  placeholder="Ingresa tu nueva contraseña"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.newPassword && formik.errors.newPassword 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.newPassword && !formik.errors.newPassword 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pl-10 pr-10`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{formik.errors.newPassword}</span>
                </motion.p>
              )}
              {formik.touched.newPassword && !formik.errors.newPassword && (
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

            {/* Campo Confirmar Contraseña */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'confirmPassword' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'confirmPassword' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('confirmPassword')}
                  value={formik.values.confirmPassword}
                  placeholder="Confirma tu nueva contraseña"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.confirmPassword && !formik.errors.confirmPassword 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pl-10 pr-10`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{formik.errors.confirmPassword}</span>
                </motion.p>
              )}
              {formik.touched.confirmPassword && !formik.errors.confirmPassword && (
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
                disabled={formik.isSubmitting || !formik.isValid}
                whileHover={!formik.isSubmitting && formik.isValid ? { scale: 1.02 } : {}}
                whileTap={!formik.isSubmitting && formik.isValid ? { scale: 0.98 } : {}}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/50 transition-all duration-300 ${
                  (formik.isSubmitting || !formik.isValid) ? 'opacity-70' : 'hover:shadow-lg hover:shadow-cyan-400/30'
                }`}
              >
                {formik.isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner size="sm" color="dark" className="mr-2" />
                    <span>Restableciendo contraseña...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Restablecer contraseña</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

export default ResetPasswordPage;