import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import AxiosClient from '../../config/http-gateway/http-client';
import { useNavigate } from 'react-router-dom';
import { Spinner } from "flowbite-react";
import NeonLogo from '../../assets/img/log.png';
import { motion } from 'framer-motion';

const CreateUserPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const navigate = useNavigate();

  const obtenerUsuarios = async () => {
    try {
      const response = await AxiosClient.get('/users/');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      lastname: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[^<>$=()\/\\{}[\]*+!@#%^&]*$/, 'Caracteres no permitidos: < > $ = ( ) / \\ { } [ ] * + ! @ # % ^ &')
        .trim()
        .matches(
          /^(?![\s.-]*$)(?!.*\s{2,})[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
          'Solo letras y espacios, sin dobles espacios y no vacío'
        )
        .max(50, 'Máximo 50 caracteres')
        .required('El nombre es obligatorio'),
      lastname: Yup.string()
        .max(50, 'Máximo 50 caracteres')
        .matches(/^[^<>$=()\/\\{}[\]*+!@#%^&]*$/, 'Caracteres no permitidos: < > $ = ( ) / \\ { } [ ] * + ! @ # % ^ &')
        .trim()
        .matches(
          /^(?![\s.-]*$)(?!.*\s{2,})[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
          'Solo letras y espacios, sin dobles espacios y no vacío'
        )
        .required('Los apellidos son obligatorios'),
      email: Yup.string()
        .email('Ingresa un correo electrónico válido')
        .required('El correo electrónico es obligatorio')
        .test(
          'correo-existente',
          'Este correo ya está registrado',
          async function (value) {
            if (!value) return true;
            try {
              const usuarios = await obtenerUsuarios();
              const correoExiste = usuarios.some(user => user.email === value);
              return !correoExiste;
            } catch (error) {
              return true;
            }
          }
        ),
      phone: Yup.string()
        .matches(/^[0-9]+$/, 'Solo se permiten números')
        .matches(/^\d{10}$/, 'Debe tener exactamente 10 dígitos')
        .matches(/^[^<>$=()\/\\{}[\]*+!@#%^&]*$/, 'Caracteres no permitidos: < > $ = ( ) / \\ { } [ ] * + ! @ # % ^ &')
        .test(
          'no-8-repetidos',
          'No puede contener 8 dígitos iguales seguidos',
          (value) => !/(\d)\1{7}/.test(value)
        )
        .required('El teléfono es obligatorio'),
      password: Yup.string()
        .min(8, 'Mínimo 8 caracteres')
        .matches(/^[^<>=()\/\\{}[\]]*$/, 'Caracteres no permitidos: < > = ( ) / \\ { } [ ]')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/,
          'Debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (!@#$%^&*)'
        )
        .required('La contraseña es obligatoria'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
        .required('Debes confirmar tu contraseña'),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const result = await Swal.fire({
          title: '¿Registrar usuario?',
          text: '¿Deseas continuar con el registro?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#00f0ff',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Sí, registrar',
          cancelButtonText: 'Cancelar',
          background: '#0a0a0a',
          color: '#ffffff',
        });

        if (!result.isConfirmed) return;

        const payload = {
          username: `${values.name.toLowerCase()}.${values.lastname.toLowerCase().split(' ')[0]}`,
          fullName: `${values.name} ${values.lastname}`,
          email: values.email,
          password: values.password,
          roleId: 2, // Rol Trabajador
          status: true
        };

        const response = await AxiosClient.post('/users/', payload);

        resetForm();
        await Swal.fire({
          icon: 'success',
          title: '¡Usuario registrado!',
          text: 'El usuario ha sido creado exitosamente.',
          confirmButtonColor: '#00f0ff',
          background: '#0a0a0a',
          color: '#ffffff'
        });

        navigate('/'); // Redirige al login

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: error.response?.data?.message || 'Hubo un problema al registrar el usuario.',
          confirmButtonColor: '#00f0ff',
          background: '#0a0a0a',
          color: '#ffffff'
        });
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
              Crear Nuevo Usuario
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
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label 
                  htmlFor="name" 
                  className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'name' ? 'text-cyan-400' : 'text-gray-400'}`}
                >
                  Nombre
                </label>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'name' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                  <input
                    id="name"
                    name="name"
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setActiveInput(null);
                    }}
                    onFocus={() => setActiveInput('name')}
                    value={formik.values.name}
                    type="text"
                    placeholder="Ej. Juan"
                    className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                      formik.touched.name && formik.errors.name 
                        ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                        : formik.touched.name && !formik.errors.name 
                          ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                          : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                    } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300`}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{formik.errors.name}</span>
                  </motion.p>
                )}
                {formik.touched.name && !formik.errors.name && (
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

              {/* Apellido */}
              <div>
                <label 
                  htmlFor="lastname" 
                  className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'lastname' ? 'text-cyan-400' : 'text-gray-400'}`}
                >
                  Apellidos
                </label>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'lastname' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                  <input
                    id="lastname"
                    name="lastname"
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setActiveInput(null);
                    }}
                    onFocus={() => setActiveInput('lastname')}
                    value={formik.values.lastname}
                    type="text"
                    placeholder="Ej. Pérez López"
                    className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                      formik.touched.lastname && formik.errors.lastname 
                        ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                        : formik.touched.lastname && !formik.errors.lastname 
                          ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                          : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                    } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300`}
                  />
                </div>
                {formik.touched.lastname && formik.errors.lastname && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{formik.errors.lastname}</span>
                  </motion.p>
                )}
                {formik.touched.lastname && !formik.errors.lastname && (
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
            </div>

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
                  placeholder="Ej. juan.perez@example.com"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.email && formik.errors.email 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.email && !formik.errors.email 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300`}
                />
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

            {/* Teléfono */}
            <div>
              <label 
                htmlFor="phone" 
                className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'phone' ? 'text-cyan-400' : 'text-gray-400'}`}
              >
                Teléfono
              </label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'phone' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                <input
                  id="phone"
                  name="phone"
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setActiveInput(null);
                  }}
                  onFocus={() => setActiveInput('phone')}
                  value={formik.values.phone}
                  type="text"
                  placeholder="Ej. 5512345678"
                  className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                    formik.touched.phone && formik.errors.phone 
                      ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                      : formik.touched.phone && !formik.errors.phone 
                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                        : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                  } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300`}
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{formik.errors.phone}</span>
                </motion.p>
              )}
              {formik.touched.phone && !formik.errors.phone && (
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

            {/* Contraseña y Confirmar Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contraseña */}
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
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setActiveInput(null);
                    }}
                    onFocus={() => setActiveInput('password')}
                    value={formik.values.password}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                      formik.touched.password && formik.errors.password 
                        ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                        : formik.touched.password && !formik.errors.password 
                          ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                          : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                    } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pr-12`}
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
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{formik.errors.password}</span>
                  </motion.p>
                )}
                {formik.touched.password && !formik.errors.password && (
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

              {/* Confirmar Contraseña */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className={`block text-sm font-medium mb-2 transition-all duration-300 ${activeInput === 'confirmPassword' ? 'text-cyan-400' : 'text-gray-400'}`}
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${activeInput === 'confirmPassword' ? 'from-cyan-500/30 to-purple-500/10' : 'from-gray-800/30 to-gray-800/10'} pointer-events-none`}></div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      setActiveInput(null);
                    }}
                    onFocus={() => setActiveInput('confirmPassword')}
                    value={formik.values.confirmPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className={`block w-full px-4 py-3 bg-gray-900/50 border ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword 
                        ? 'border-red-500/70 focus:border-red-500/70 focus:ring-red-500/30' 
                        : formik.touched.confirmPassword && !formik.errors.confirmPassword 
                          ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/30' 
                          : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
                    } rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-300 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? (
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
            </div>

            {/* Resumen de errores */}
            {!formik.isValid && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/20 border border-red-700/50 rounded-lg p-4"
              >
                <h3 className="text-red-400 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Hay errores en el formulario
                </h3>
                <ul className="mt-2 text-sm text-red-300 list-disc pl-5 space-y-1">
                  {Object.keys(formik.errors).map((fieldName) => (
                    formik.touched[fieldName] && (
                      <li key={fieldName}>{formik.errors[fieldName]}</li>
                    )
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Botón de envío */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/50 transition-all duration-300 transform ${(isSubmitting || !formik.isValid) ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-0.5 hover:shadow-cyan-400/30'}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner size="sm" color="dark" className="mr-2" />
                    <span>Registrando usuario...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Registrar Usuario</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-3 px-4 border border-gray-800 rounded-lg text-sm font-medium text-gray-300 bg-gray-900/50 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/10 hover:text-white"
              >
                Iniciar sesión
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

export default CreateUserPage;