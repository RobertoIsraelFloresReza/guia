import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosClient from '../config/http-gateway/http-client';
import { FaTimes, FaUserPlus, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';

const UserCreateModal = ({ isOpen, onClose, onUserCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        status: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Reset form when opening
            setFormData({
                username: '',
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                status: true
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Mínimo 4 caracteres';
        }
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }
        
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            const payload = {
                username: formData.username,
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                roleId: 2,
                status: formData.status
            };

            const response = await AxiosClient({
                url: "/users/",
                method: "POST",
                data: payload
            });

            if (response.error) {
                throw new Error(response.message || 'Error al crear el usuario');
            }

            onUserCreated(response.data);
            onClose();
            
            Swal.fire({
                icon: 'success',
                title: '¡Usuario creado!',
                text: `El usuario ${formData.fullName} ha sido registrado exitosamente`,
                confirmButtonColor: '#00f0ff',
                background: '#0f172a',
                color: '#ffffff',
            });
        } catch (error) {
            console.error("Error creating user:", error);
            
            let errorMessage = 'Error al crear el usuario';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
                if (error.response.status === 400 && errorMessage.includes('correo')) {
                    errorMessage = 'El correo electrónico ya está registrado';
                }
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#00f0ff',
                background: '#0f172a',
                color: '#ffffff',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            username: '',
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            status: true
        });
        setErrors({});
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Crear Nuevo Responsable
                                </h3>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-white transition-colors text-xl"
                                    disabled={loading}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {/* Nombre de usuario */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Nombre de usuario *
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.username ? 'border-red-500/50' : 'border-cyan-500/40'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Ej: juan.perez"
                                            disabled={loading}
                                        />
                                        {errors.username && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nombre completo */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Nombre completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.fullName ? 'border-red-500/50' : 'border-cyan-500/40'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Ej: Juan Pérez López"
                                            disabled={loading}
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Correo electrónico *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.email ? 'border-red-500/50' : 'border-cyan-500/40'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Ej: juan.perez@example.com"
                                            disabled={loading}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.password ? 'border-red-500/50' : 'border-cyan-500/40'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Mínimo 6 caracteres"
                                            disabled={loading}
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Confirmar Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.confirmPassword ? 'border-red-500/50' : 'border-cyan-500/40'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Repite la contraseña"
                                            disabled={loading}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            checked={formData.status}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-cyan-500 rounded border-gray-600 bg-gray-700 focus:ring-cyan-500 focus:ring-offset-gray-800"
                                            disabled={loading}
                                        />
                                        <label htmlFor="status" className="ml-2 text-sm text-gray-300">
                                            Activo
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={handleClose}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/30 transition-colors rounded-lg"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Creando...
                                            </>
                                        ) : (
                                            <>
                                                <FaUserPlus /> Crear Responsable
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserCreateModal;