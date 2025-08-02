import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosClient from '../config/http-gateway/http-client';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CategoryCreateModal = ({ isOpen, onClose, onCategoryCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        status: true
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Mínimo 3 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await AxiosClient.post('/categories/', formData);

            if (response.status === "CREATED") {
                Swal.fire({
                    icon: 'success',
                    title: '¡Categoría creada!',
                    text: `Categoría ${formData.name} registrada correctamente`,
                    confirmButtonColor: '#00f0ff',
                    background: '#0f172a',
                    color: '#ffffff',
                });
                
                onCategoryCreated(response.data);
                handleClose();
            } else {
                throw new Error(response.message || 'Error al crear categoría');
            }
        } catch (error) {
            console.error("Error creating category:", error);
            let errorMessage = 'Error al crear la categoría';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const showError = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#00f0ff',
            background: '#0f172a',
            color: '#ffffff',
        });
    };

    const handleClose = () => {
        setFormData({
            name: '',
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
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Nueva Categoría
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
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.name ? 'border-red-500' : 'border-cyan-500/30'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                                            placeholder="Ej: Ropa"
                                            disabled={loading}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div className="flex items-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="status"
                                                checked={formData.status}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                                disabled={loading}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-300">
                                                {formData.status ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={handleClose}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white flex items-center gap-2 transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Creando...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Crear Categoría
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

export default CategoryCreateModal;