import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AxiosClient from '../config/http-gateway/http-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBox, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const ArticleCreateModal = ({ isOpen, onClose, onArticleCreated, existingArticles }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: true,
        categoryId: '',
        storageIds: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [storages, setStorages] = useState([]);
    const [filteredStorages, setFilteredStorages] = useState([]);

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                name: '',
                description: '',
                status: true,
                categoryId: '',
                storageIds: []
            });
            setErrors({});
            fetchCategories();
            fetchStorages();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await AxiosClient({
                url: "/categories/",
                method: "GET"
            });
            if (response.status === "OK") {
                setCategories(response.data.filter(cat => cat.status));
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchStorages = async () => {
        try {
            const response = await AxiosClient({
                url: "/storage/",
                method: "GET"
            });
            if (response.status === "OK") {
                setStorages(response.data.filter(storage => storage.status));
                setFilteredStorages(response.data.filter(storage => storage.status));
            }
        } catch (error) {
            console.error("Error fetching storages:", error);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData(prev => ({
            ...prev,
            categoryId,
            storageIds: [] // Reset storages when category changes
        }));

        // Filter storages by selected category
        if (categoryId) {
            setFilteredStorages(storages.filter(storage => 
                storage.category?.id === parseInt(categoryId)
            ));
        } else {
            setFilteredStorages(storages);
        }
    };

    const handleStorageToggle = (storageId) => {
        setFormData(prev => {
            const newStorageIds = prev.storageIds.includes(storageId)
                ? prev.storageIds.filter(id => id !== storageId)
                : [...prev.storageIds, storageId];
            
            return {
                ...prev,
                storageIds: newStorageIds
            };
        });
    };

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
        } else if (existingArticles.some(article => 
            article.name.toLowerCase() === formData.name.toLowerCase()
        )) {
            newErrors.name = 'Ya existe un artículo con este nombre';
        }
        
        if (!formData.categoryId) {
            newErrors.categoryId = 'Debes seleccionar una categoría';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            const response = await AxiosClient({
                url: "/articles/",
                method: "POST",
                data: formData
            });

            if (response.error) {
                throw new Error(response.message || 'Error al crear el artículo');
            }

            onArticleCreated(response.data);
            onClose();
            
            Swal.fire({
                icon: 'success',
                title: '¡Artículo creado!',
                text: `El artículo "${formData.name}" ha sido creado exitosamente`,
                confirmButtonColor: '#00f0ff',
                background: '#0f172a',
                color: '#ffffff',
            });
        } catch (error) {
            console.error("Error creating article:", error);
            
            let errorMessage = 'Error al crear el artículo';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-lg rounded-xl border border-cyan-500/30 w-full max-w-2xl shadow-xl shadow-cyan-500/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Crear Nuevo Artículo
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors text-xl"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Nombre del Artículo
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-gray-800/70 border ${errors.name ? 'border-red-500/50' : 'border-cyan-500/40'} text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                            placeholder="Ej. Teclado mecánico RGB"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800/70 border border-cyan-500/40 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                            placeholder="Descripción detallada del artículo"
                                        />
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Categoría
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleCategoryChange}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-gray-800/70 border ${errors.categoryId ? 'border-red-500/50' : 'border-cyan-500/40'} text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all`}
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <FaExclamationTriangle className="h-3 w-3" /> {errors.categoryId}
                                            </p>
                                        )}
                                    </div>

                                    {/* Almacenes (solo si hay categoría seleccionada) */}
                                    {formData.categoryId && (
                                        <div>
                                            <label className="block text-sm font-medium text-cyan-400 mb-1">
                                                Asignar a Almacenes
                                            </label>
                                            <div className="space-y-2">
                                                {filteredStorages.length > 0 ? (
                                                    filteredStorages.map(storage => (
                                                        <div key={storage.id} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`storage-${storage.id}`}
                                                                checked={formData.storageIds.includes(storage.id)}
                                                                onChange={() => handleStorageToggle(storage.id)}
                                                                className="h-4 w-4 text-cyan-500 rounded border-gray-600 bg-gray-700 focus:ring-cyan-500 focus:ring-offset-gray-800"
                                                            />
                                                            <label htmlFor={`storage-${storage.id}`} className="ml-2 text-sm text-gray-300">
                                                                {storage.identifier} - {storage.category?.name}
                                                            </label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">
                                                        No hay almacenes disponibles para esta categoría
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Estado */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            checked={formData.status}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-cyan-500 rounded border-gray-600 bg-gray-700 focus:ring-cyan-500 focus:ring-offset-gray-800"
                                        />
                                        <label htmlFor="status" className="ml-2 text-sm text-gray-300">
                                            Activo
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-700/50 flex justify-end gap-3">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/30 transition-colors"
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={loading}
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? (
                                            'Creando...'
                                        ) : (
                                            <>
                                                <FaCheck className="h-4 w-4" /> Crear Artículo
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

export default ArticleCreateModal;