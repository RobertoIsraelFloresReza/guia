import { Spinner } from "flowbite-react";
import { useFormik } from "formik";
import React, { useContext, useState } from "react";
import * as yup from "yup";
import AxiosClient from "../../config/http-gateway/http-client";
import AuthContext from "../../config/context/auth-context";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NeonLogo from "../../assets/img/log.png";

const SignInPage = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email("Ingrese un correo válido")
        .required("Campo obligatorio"),
      password: yup.string().required("Campo obligatorio"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await AxiosClient.post("/auth/signin", values);
        const role = response.data.roles.name;

        if (["ADMINISTRADOR", "TRABAJADOR", "USUARIO_REGULAR"].includes(role)) {
          dispatch({
            type: "SIGNIN",
            payload: response.data,
          });
          switch (role) {
            case "ADMINISTRADOR":
              navigate("/homeadmingeneral", { replace: true });
              break;
            case "TRABAJADOR":
              navigate("/homeadmingrupal", { replace: true });
              break;
            case "USUARIO_REGULAR":
              navigate("/homeusuarioregular", { replace: true });
              break;
            default:
              break;
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Acceso Denegado",
            text: "No tienes permisos para acceder a esta sección.",
            confirmButtonColor: "#00f0ff",
            background: "#0a0a0a",
            color: "#ffffff",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo iniciar sesión. Verifica tus credenciales.",
          confirmButtonColor: "#00f0ff",
          background: "#0a0a0a",
          color: "#ffffff",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGuestAccess = () => {
    navigate("/create-user", { replace: true });
  };

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
      <div className="w-full max-w-md relative z-10">
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
              SINV<span className="font-light">HUB</span>
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
            {/* Campo de email */}
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
                  onBlur={() => {
                    formik.handleBlur('email');
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('email')}
                  value={formik.values.email}
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${formik.touched.email && formik.errors.email ? 'border-red-500/50' : activeInput === 'email' ? 'border-cyan-500/50' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-gray-500 transition-all duration-300`}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Campo de contraseña */}
            <div>
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'password' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Contraseña
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'password' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={() => {
                    formik.handleBlur('password');
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('password')}
                  value={formik.values.password}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${formik.touched.password && formik.errors.password ? 'border-red-500/50' : activeInput === 'password' ? 'border-cyan-500/50' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-gray-500 transition-all duration-300 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/50 transition-all duration-300 transform ${(formik.isSubmitting || !formik.isValid) ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-0.5 hover:shadow-cyan-400/30'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {formik.isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner size="sm" color="dark" className="mr-2" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Iniciar sesión</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ml-2 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-500">
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGuestAccess}
                className="w-full flex justify-center py-3 px-4 border border-gray-800 rounded-lg text-sm font-medium text-gray-300 bg-gray-900/50 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/10 hover:text-white"
              >
                Regístrate ahora
              </button>
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

export default SignInPage;