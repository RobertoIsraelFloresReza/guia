import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { FaEyeSlash, FaEye, FaUserEdit, FaEnvelope, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { motion } from 'framer-motion';
import NeonLogo from "../../assets/img/log.png";
import AxiosClient from '../../config/http-gateway/http-client';
import { Spinner } from 'flowbite-react';

// Funciones de sanitización
const sanitizeInput = (input) => {
    if (!input) return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
};

function Profile() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const getUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const storedUser = JSON.parse(userString);
                const currentUserId = storedUser.user.id;
                setUserId(currentUserId);
                
                try {
                    const response = await AxiosClient({ 
                        url: `/users/${currentUserId}`, 
                        method: "GET" 
                    });
                    
                    setUserData({
                        data: response.data.data || storedUser.user,
                        status: "OK",
                        error: false,
                        message: null
                    });
                } catch (error) {
                    console.error('Error al obtener datos del usuario', error);
                    setUserData({
                        data: storedUser.user,
                        status: "OK",
                        error: false,
                        message: null
                    });
                }
            } else {
                console.error('Clave "user" no encontrada en localStorage.');
                showErrorAlert('No se encontró información del usuario en el almacenamiento local.');
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            showErrorAlert('Ocurrió un error al cargar los datos del usuario.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const showErrorAlert = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#00f0ff',
            background: '#0f172a',
            color: '#ffffff',
        });
    };

    useEffect(() => {
        getUserData();
    }, [getUserData, refreshKey]);

    const updateFormik = useFormik({
        initialValues: {
            email: '',
            fullName: '',
        },
        validationSchema: yup.object({
            email: yup.string()
                .email('Correo electrónico inválido')
                .required('Campo requerido')
                .matches(
                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    'Correo electrónico inválido'
                ),
            fullName: yup.string()
                .required('Campo requerido')
                .matches(
                    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    'Solo se permiten letras y espacios'
                )
                .max(100, 'Máximo 100 caracteres'),
        }),
        onSubmit: async (values) => {
            const errors = await updateFormik.validateForm();
            if (Object.keys(errors).length > 0) {
                updateFormik.setTouched({
                    email: true,
                    fullName: true
                });
                return;
            }

            const confirmSave = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Deseas actualizar tu información de perfil?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#00f0ff',
                cancelButtonColor: '#64748b',
                background: '#0f172a',
                color: '#ffffff',
            });

            if (confirmSave.isConfirmed) {
                try {
                    const payload = {
                        id: userId,
                        email: sanitizeInput(values.email),
                        fullName: sanitizeInput(values.fullName),
                    };

                    await AxiosClient({
                        url: `/users/${userId}`,
                        method: 'PUT',
                        data: payload,
                    });

                    // Actualizar localStorage
                    const userString = localStorage.getItem('user');
                    if (userString) {
                        const storedUser = JSON.parse(userString);
                        const updatedUser = {
                            ...storedUser,
                            user: {
                                ...storedUser.user,
                                email: values.email,
                                fullName: values.fullName
                            }
                        };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }

                    // Forzar actualización del estado
                    setRefreshKey(prev => prev + 1);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Perfil actualizado!',
                        text: 'Tu información de perfil se ha guardado correctamente.',
                        confirmButtonColor: '#00f0ff',
                        background: '#0f172a',
                        color: '#ffffff',
                    });
                } catch (error) {
                    console.error('Error completo:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar perfil',
                        text: error.response?.data?.message || 'Hubo un error al actualizar tu información de perfil.',
                        confirmButtonColor: '#00f0ff',
                        background: '#0f172a',
                        color: '#ffffff',
                    });
                }
            }
        },
    });

    useEffect(() => {
        if (userData?.data) {
            updateFormik.setValues({
                email: userData.data.email,
                fullName: userData.data.fullName
            });
        }
    }, [userData]);

    const changePasswordFormik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
            currentPassword: '',
        },
        validationSchema: yup.object({
            newPassword: yup.string()
                .min(8, 'La contraseña debe tener al menos 8 caracteres')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                    'Debe contener al menos una mayúscula, una minúscula y un número'
                )
                .required('Campo requerido'),
            confirmPassword: yup.string()
                .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
                .required('Campo requerido'),
            currentPassword: yup.string().required('Campo requerido'),
        }),
        onSubmit: async (values) => {
            const errors = await changePasswordFormik.validateForm();
            if (Object.keys(errors).length > 0) {
                changePasswordFormik.setTouched({
                    newPassword: true,
                    confirmPassword: true,
                    currentPassword: true
                });
                return;
            }

            const confirmSave = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Deseas cambiar la contraseña?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#00f0ff',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, cambiar contraseña',
                cancelButtonText: 'Cancelar',
                background: '#0f172a',
                color: '#ffffff',
            });

            if (confirmSave.isConfirmed) {
                try {
                    const verifyResponse = await AxiosClient({
                        url: '/users/verify-password',
                        method: 'POST',
                        data: {
                            userId: userId,
                            password: values.currentPassword
                        }
                    });

                    if (!verifyResponse.valid) {
                        throw new Error(verifyResponse.message || 'Contraseña actual incorrecta');
                    }

                    const updatePayload = {
                        id: userId,
                        password: values.newPassword,
                        email: userData.data?.email,
                        status: userData.data?.status,
                    };

                    await AxiosClient({
                        url: `/users/${userId}`,
                        method: 'PUT',
                        data: updatePayload
                    });

                    Swal.fire({
                        icon: 'success',
                        title: '¡Contraseña cambiada!',
                        text: 'La contraseña se actualizó correctamente.',
                        confirmButtonColor: '#00f0ff',
                        background: '#0f172a',
                        color: '#ffffff',
                    });
                    changePasswordFormik.resetForm();
                } catch (error) {
                    console.error("Error:", error);
                    let errorMessage = 'Hubo un error al cambiar la contraseña.';
                    if (error.response) {
                        errorMessage = error.response.data?.message || errorMessage;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cambiar contraseña',
                        text: errorMessage,
                        confirmButtonColor: '#00f0ff',
                        background: '#0f172a',
                        color: '#ffffff',
                    });
                }
            }
        },
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        Object.keys(updateFormik.values).forEach(key => {
            updateFormik.setFieldTouched(key, true, false);
        });

        updateFormik.validateForm().then(errors => {
            if (Object.keys(errors).length === 0) {
                updateFormik.handleSubmit();
            }
        });
    };

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "¿Estás seguro que deseas salir de tu cuenta?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00f0ff',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: '#0f172a',
            color: '#ffffff',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = '/';
            }
        });
    };

    return (
        <div className="min-h-screen bg-black w-full relative overflow-hidden">
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

            {/* Contenido principal */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Encabezado del Perfil */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <div className="relative">
                                    <img 
                                        src={NeonLogo} 
                                        alt="Logo" 
                                        className="rounded-full border-4 border-cyan-500/30 w-24 h-24 md:w-32 md:h-32 object-cover glow-cyan" 
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full p-2 shadow-lg">
                                        <FaUserEdit className="text-white text-lg" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                                        {userData?.data?.fullName || 'Usuario'}
                                    </h1>
                                    <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-4 mt-3">
                                        <p className="text-cyan-300 flex items-center justify-center md:justify-start">
                                            <FaEnvelope className="mr-2 text-cyan-400" />
                                            {userData?.data?.email || 'No registrado'}
                                        </p>
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                                {userData?.data?.role?.name || 'ROL'}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${userData?.data?.status ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                {userData?.data?.status ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mt-4 md:mt-0"
                            >
                                <FaSignOutAlt />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Sección de Información Personal */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 overflow-hidden shadow-lg">
                        <div className="w-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 p-4 border-b border-cyan-500/20">
                            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                                <FaUserEdit className="text-cyan-400" />
                                Información Personal
                            </h2>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Spinner size="xl" color="info" />
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-cyan-400">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="text"
                                            id="email"
                                            disabled
                                            value={updateFormik.values.email}
                                            className="bg-gray-800/50 border border-cyan-500/30 text-gray-300 text-sm rounded-lg block w-full p-3 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-cyan-400">
                                            Nombre Completo
                                            <span className="text-red-400 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            value={updateFormik.values.fullName}
                                            onChange={(e) => {
                                                updateFormik.setFieldValue('fullName', e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''));
                                            }}
                                            onBlur={updateFormik.handleBlur}
                                            className={`bg-gray-800/50 border ${updateFormik.touched.fullName && updateFormik.errors.fullName ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3`}
                                        />
                                        {updateFormik.touched.fullName && updateFormik.errors.fullName && (
                                            <div className="text-red-400 text-sm mt-1">
                                                {updateFormik.errors.fullName}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button 
                                        type="submit" 
                                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner size="sm" color="info" className="mr-2" />
                                                Procesando...
                                            </>
                                        ) : (
                                            'Actualizar Información'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Sección de Cambio de Contraseña */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 overflow-hidden shadow-lg">
                        <div className="w-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 p-4 border-b border-cyan-500/20">
                            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                                <FaUserShield className="text-cyan-400" />
                                Cambiar Contraseña
                            </h2>
                        </div>
                        
                        <form onSubmit={changePasswordFormik.handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-cyan-400">
                                        Contraseña Actual
                                        <span className="text-red-400 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            id="currentPassword"
                                            {...changePasswordFormik.getFieldProps('currentPassword')}
                                            className={`bg-gray-800/50 border ${changePasswordFormik.touched.currentPassword && changePasswordFormik.errors.currentPassword ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300"
                                        >
                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {changePasswordFormik.touched.currentPassword && changePasswordFormik.errors.currentPassword && (
                                        <div className="text-red-400 text-sm mt-1">
                                            {changePasswordFormik.errors.currentPassword}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-cyan-400">
                                        Nueva Contraseña
                                        <span className="text-red-400 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            id="newPassword"
                                            {...changePasswordFormik.getFieldProps('newPassword')}
                                            className={`bg-gray-800/50 border ${changePasswordFormik.touched.newPassword && changePasswordFormik.errors.newPassword ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3`}
                                            placeholder="Mínimo 8 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300"
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {changePasswordFormik.touched.newPassword && changePasswordFormik.errors.newPassword && (
                                        <div className="text-red-400 text-sm mt-1">
                                            {changePasswordFormik.errors.newPassword}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-cyan-400">
                                        Confirmar Contraseña
                                        <span className="text-red-400 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            {...changePasswordFormik.getFieldProps('confirmPassword')}
                                            className={`bg-gray-800/50 border ${changePasswordFormik.touched.confirmPassword && changePasswordFormik.errors.confirmPassword ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3`}
                                            placeholder="Repite tu contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {changePasswordFormik.touched.confirmPassword && changePasswordFormik.errors.confirmPassword && (
                                        <div className="text-red-400 text-sm mt-1">
                                            {changePasswordFormik.errors.confirmPassword}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner size="sm" color="info" className="mr-2" />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Cambiar Contraseña'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>

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
}

export default Profile;