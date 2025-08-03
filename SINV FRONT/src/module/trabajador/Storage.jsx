import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosClient from '../../config/http-gateway/http-client';
import {
    FaBox, FaBoxes, FaEdit, FaTrash, FaPlus, FaSearch,
    FaSpinner, FaSave, FaTimes, FaUser, FaTag, FaBarcode,
    FaInfoCircle, FaToggleOn, FaToggleOff, FaCheck, FaSync
} from 'react-icons/fa';
import { Spinner } from 'flowbite-react';
import Swal from 'sweetalert2';
import AuthContext from '../../config/context/auth-context';

// Componente para crear artículos
const ArticleCreateModal = ({ isOpen, onClose, onArticleCreated, storage, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: true,
        categoryId: storage.category?.id || '',
        storageIds: [storage.id]
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                description: '',
                status: true,
                categoryId: storage.category?.id || '',
                storageIds: [storage.id]
            });
            setErrors({});
        }
    }, [isOpen, storage]);

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
            // Forzar la categoría del almacén por si acaso
            const dataToSend = {
                ...formData,
                categoryId: storage.category?.id || formData.categoryId,
                storageIds: [storage.id]
            };

            const response = await AxiosClient({
                url: "/articles/",
                method: "POST",
                data: dataToSend
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
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
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
                                            Nombre del Artículo *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${errors.name ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                                            placeholder="Nombre del artículo"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
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
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/70 border border-cyan-500/30 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="Descripción detallada"
                                        />
                                    </div>

                                    {/* Categoría (pre-seleccionada y deshabilitada) */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Categoría
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/30 border border-gray-600/30 text-gray-400 cursor-not-allowed"
                                            disabled
                                        >
                                            <option value={storage.category?.id || ''}>
                                                {storage.category?.name || 'Sin categoría'}
                                            </option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">La categoría del artículo debe coincidir con la del almacén</p>
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
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaCheck />
                                        )}
                                        {loading ? 'Creando...' : 'Crear Artículo'}
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

// Componente para editar artículos
const ArticleEditModal = ({ isOpen, onClose, onArticleUpdated, articleData, categories }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        status: true,
        categoryId: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && articleData) {
            setFormData({
                id: articleData.id,
                name: articleData.name,
                description: articleData.description,
                status: articleData.status,
                categoryId: articleData.category?.id || ''
            });
            setErrors({});
        }
    }, [isOpen, articleData]);

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
                url: `/articles/${formData.id}`,
                method: "PUT",
                data: {
                    id: formData.id,
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    categoryId: parseInt(formData.categoryId),
                    storageIds: articleData.storageIds || []
                }
            });

            if (response.error) {
                throw new Error(response.message || 'Error al actualizar el artículo');
            }

            // Actualizar solo si hay cambios reales en los datos
            if (JSON.stringify(response.data) !== JSON.stringify(articleData)) {
                onArticleUpdated(response.data);
            }

            onClose();

            Swal.fire({
                icon: 'success',
                title: '¡Artículo actualizado!',
                text: `El artículo "${formData.name}" ha sido actualizado exitosamente`,
                confirmButtonColor: '#00f0ff',
                background: '#0f172a',
                color: '#ffffff',
            });
        } catch (error) {
            console.error("Error updating article:", error);

            let errorMessage = 'Error al actualizar el artículo';
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
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Editar Artículo
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
                                            Nombre del Artículo *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${errors.name ? 'border-red-500' : 'border-cyan-500/30'} text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                                            placeholder="Nombre del artículo"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
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
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/70 border border-cyan-500/30 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="Descripción detallada"
                                        />
                                    </div>

                                    {/* Categoría (solo lectura) */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Categoría
                                        </label>
                                        <input
                                            type="text"
                                            value={categories.find(c => c.id === formData.categoryId)?.name || 'Sin categoría'}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/30 border border-gray-600/30 text-gray-400 cursor-not-allowed"
                                            readOnly
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500">La categoría no se puede modificar</p>
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
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaSave />
                                        )}
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
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

// Componente para editar almacén
const StorageEditModal = ({ isOpen, onClose, onStorageUpdated, storageData }) => {
    const [formData, setFormData] = useState({
        identifier: '',
        status: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && storageData) {
            setFormData({
                identifier: storageData.identifier,
                status: storageData.status,
                categoryId: storageData.category?.id || '',
                responsibleId: storageData.responsible?.id || '',
                status: storageData.status
            });
        }
    }, [isOpen, storageData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await AxiosClient({
                url: `/storage/${storageData.id}`,
                method: "PUT",
                data: {
                    id: storageData.id,
                    identifier: formData.identifier,
                    status: formData.status,
                    categoryId: parseInt(formData.categoryId),
                    responsibleId: formData.responsibleId ? parseInt(formData.responsibleId) : null,
                
                }
            });

            if (response.error) {
                throw new Error(response.message || 'Error al actualizar el almacén');
            }

            onStorageUpdated(response.data);
            onClose();

            Swal.fire({
                icon: 'success',
                title: '¡Almacén actualizado!',
                text: `El almacén "${formData.identifier}" ha sido actualizado exitosamente`,
                confirmButtonColor: '#00f0ff',
                background: '#0f172a',
                color: '#ffffff',
            });
        } catch (error) {
            console.error("Error updating storage:", error);

            let errorMessage = 'Error al actualizar el almacén';
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
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Editar Almacén
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
                                    {/* Identificador */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Identificador *
                                        </label>
                                        <input
                                            type="text"
                                            name="identifier"
                                            value={formData.identifier}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/70 border border-cyan-500/30 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="Identificador del almacén"
                                            required
                                        />
                                    </div>

                                    {/* Categoría (solo lectura) */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Categoría
                                        </label>
                                        <input
                                            type="text"
                                            value={storageData.category?.name || 'Sin categoría'}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/30 border border-gray-600/30 text-gray-400 cursor-not-allowed"
                                            readOnly
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500">La categoría no se puede modificar</p>
                                    </div>

                                    {/* Responsable (solo lectura) */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Responsable
                                        </label>
                                        <input
                                            type="text"
                                            value={storageData.responsible?.fullName || 'Sin responsable'}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800/30 border border-gray-600/30 text-gray-400 cursor-not-allowed"
                                            readOnly
                                            disabled
                                        />
                                        <p className="mt-1 text-xs text-gray-500">El responsable no se puede modificar</p>
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
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaSave />
                                        )}
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
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

// Componente principal Storage
const Storage = () => {
    const authContext = useContext(AuthContext);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [storage, setStorage] = useState(null);
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateArticleModal, setShowCreateArticleModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Obtener ID de usuario
    useEffect(() => {
        const getUserId = () => {
            try {
                if (authContext?.user?.id) {
                    return authContext.user.id;
                }

                const userString = localStorage.getItem('user');
                if (userString) {
                    const storedUser = JSON.parse(userString);
                    if (storedUser?.user?.id) {
                        return storedUser.user.id;
                    }
                }

                return null;
            } catch (error) {
                console.error('Error al obtener ID de usuario:', error);
                return null;
            }
        };

        const id = getUserId();
        setUserId(id);
    }, [authContext]);

    // Función para cargar datos
    const fetchStorageData = async () => {
        try {
            setLoading(true);
            setRefreshing(true);

            if (!userId) {
                setStorage(null);
                return;
            }

            // Obtener almacén
            const storageResponse = await AxiosClient({
                url: `/storage/responsible/${userId}`,
                method: "GET"
            });

            if (storageResponse?.status === "OK" && storageResponse.data) {
                setStorage(storageResponse.data);
                setArticles(storageResponse.data.articles || []);
            } else {
                throw new Error('No se encontró almacén');
            }

            // Obtener categorías
            const categoriesResponse = await AxiosClient({
                url: "/categories/",
                method: "GET"
            });

            if (categoriesResponse?.status === "OK") {
                setCategories(categoriesResponse.data);
            }

        } catch (error) {
            console.error('Error al cargar almacén:', error);
            setStorage(null);
            setArticles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Cargar datos del almacén
    useEffect(() => {
        if (userId) {
            fetchStorageData();
        }
    }, [userId]);

    // Memo para artículos filtrados
    const filteredArticles = useMemo(() => {
        return articles.filter(article =>
            article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.category?.name && article.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [articles, searchTerm]);

    const handleUpdateStorage = (updatedStorage) => {
        if (!updatedStorage) return;
        setStorage(updatedStorage);
        setShowEditModal(false);
    };

    const handleEditArticle = (article) => {
        setEditingArticle(article);
    };

    const handleArticleCreated = (newArticle) => {
        // Encontrar la categoría correspondiente en el estado local
        const articleCategory = categories.find(c => c.id === newArticle.categoryId);

        // Crear el artículo con la categoría completa
        const completeArticle = {
            ...newArticle,
            category: articleCategory || null
        };

        setArticles(prev => [...prev, completeArticle]);
        setShowCreateArticleModal(false);
        // hacer un refresh de los artículos
        fetchStorageData();
    };

    const handleArticleUpdated = (updatedArticle) => {
        setArticles(prev => prev.map(a =>
            a.id === updatedArticle.id ? {
                ...updatedArticle,
                category: categories.find(c => c.id === updatedArticle.categoryId) || a.category
            } : a
        ));
        setEditingArticle(null);
    };

    const handleDeleteArticle = async (articleId) => {
        const result = await Swal.fire({
            title: '¿Eliminar artículo?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00f0ff',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            background: '#0f172a',
            color: '#ffffff',
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await AxiosClient({
                    url: `/articles/${articleId}`,
                    method: "DELETE"
                });

                setArticles(prev => prev.filter(a => a.id !== articleId));
                Swal.fire({
                    icon: 'success',
                    title: '¡Artículo eliminado!',
                    confirmButtonColor: '#00f0ff',
                    background: '#0f172a',
                    color: '#ffffff',
                });
            } catch (error) {
                console.error("Error deleting article:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el artículo',
                    confirmButtonColor: '#00f0ff',
                    background: '#0f172a',
                    color: '#ffffff',
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRefresh = () => {
        fetchStorageData();
    };

    if (loading && !storage) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spinner color="info" size="xl" />
                <p className="ml-4 text-cyan-400">Cargando información del almacén...</p>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-red-500/20 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center">
                        <FaUser className="text-3xl text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Usuario no identificado</h3>
                    <p className="text-gray-400 mb-6">No se pudo obtener tu información de usuario.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-lg text-white flex items-center gap-2 mx-auto"
                    >
                        Ir a inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    if (!storage) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                        <FaBoxes className="text-3xl text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No tienes un almacén asignado</h3>
                    <p className="text-gray-400 mb-6">Contacta al administrador para que te asigne un almacén</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white flex items-center gap-2 mx-auto"
                    >
                        <FaSearch /> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black w-full relative overflow-hidden p-6">
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
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                            Gestión de Almacén
                        </h1>
                        <p className="text-cyan-300/80 flex items-center gap-2">
                            <FaBox className="text-cyan-400" /> {storage.identifier} - {storage.category?.name}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            <FaEdit /> Editar Almacén
                        </button>
                        <button
                            onClick={() => setShowCreateArticleModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            <FaPlus /> Nuevo Artículo
                        </button>
                    </div>
                </div>

                {/* Grid de 4 secciones */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sección 1: Información del almacén (25%) */}
                    <div className="lg:col-span-1 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FaInfoCircle className="text-cyan-400" /> Información
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-cyan-400 mb-1">Identificador</p>
                                <p className="text-white font-medium">{storage.identifier}</p>
                            </div>

                            <div>
                                <p className="text-sm text-cyan-400 mb-1">Categoría</p>
                                <p className="text-white font-medium">{storage.category?.name || 'Sin categoría'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-cyan-400 mb-1">Estado</p>
                                <div className="flex items-center gap-2">
                                    {storage.status ? (
                                        <>
                                            <FaToggleOn className="text-green-400 text-xl" />
                                            <span className="text-green-400">Activo</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaToggleOff className="text-red-400 text-xl" />
                                            <span className="text-red-400">Inactivo</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {storage.responsible && (
                                <div>
                                    <p className="text-sm text-cyan-400 mb-1">Responsable</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {storage.responsible.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{storage.responsible.fullName}</p>
                                            <p className="text-gray-400 text-xs">{storage.responsible.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-cyan-400 mb-1">Artículos</p>
                                <p className="text-white font-medium">{articles.length} registrados</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2-4: Artículos (75%) */}
                    <div className="lg:col-span-3 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
                        {/* Barra de búsqueda */}
                        <div className="p-6 border-b border-purple-500/20">
                            <div className="relative w-full md:w-64">
                                <div className="absolute left-3 top-3 text-purple-400">
                                    <FaSearch />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar artículos..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 border border-purple-500/30"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Lista de artículos */}
                        <div className="overflow-x-auto">
                            {filteredArticles.length > 0 ? (
                                <table className="min-w-full divide-y divide-purple-500/20">
                                    <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">Descripción</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-500/10">
                                        {filteredArticles.map((article) => (
                                            <motion.tr
                                                key={article.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-purple-500/5 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                                            <FaBox />
                                                        </div>
                                                        <span className="font-medium text-white">{article.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{article.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400">
                                                        {article.category?.name || 'Sin categoría'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEditArticle(article)}
                                                            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <FaEdit />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDeleteArticle(article.id)}
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                        <FaBoxes className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-300">No se encontraron artículos</h3>
                                    <p className="text-gray-500 mt-1">
                                        {searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega nuevos artículos para comenzar'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de edición de almacén */}
            <StorageEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onStorageUpdated={handleUpdateStorage}
                storageData={storage}
            />

            {/* Modal de creación de artículo */}
            <ArticleCreateModal
                isOpen={showCreateArticleModal}
                onClose={() => setShowCreateArticleModal(false)}
                onArticleCreated={handleArticleCreated}
                storage={storage}
                categories={categories}
            />

            {/* Modal de edición de artículo */}
            <ArticleEditModal
                isOpen={!!editingArticle}
                onClose={() => setEditingArticle(null)}
                onArticleUpdated={handleArticleUpdated}
                articleData={editingArticle}
                categories={categories}
            />

            {/* Estilos globales para este componente */}
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

export default Storage;