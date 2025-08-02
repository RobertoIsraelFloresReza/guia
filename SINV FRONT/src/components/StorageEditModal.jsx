import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosClient from '../config/http-gateway/http-client';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const StorageEditModal = ({ 
    isOpen, 
    onClose, 
    onStorageUpdated,
    storageData,
    existingStorages
}) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [responsibles, setResponsibles] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        identifier: '',
        categoryId: '',
        responsibleId: '',
        status: true
    });
    const [errors, setErrors] = useState({});

    // Cargar datos cuando se abre el modal o cambia storageData
    useEffect(() => {
        if (isOpen && storageData) {
            fetchCategories();
            fetchResponsibles();
            setFormData({
                id: storageData.id,
                identifier: storageData.identifier,
                categoryId: storageData.category?.id || '',
                responsibleId: storageData.responsible?.id || '',
                status: storageData.status
            });
        }
    }, [isOpen, storageData]);

    const fetchCategories = async () => {
        try {
            const response = await AxiosClient.get('/categories/');
            if (response.status === "OK") {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            showError('Error al cargar las categorías');
        }
    };

    const fetchResponsibles = async () => {
        try {
            const response = await AxiosClient.get('/users/');
            if (response.status === "OK") {
                // Filtrar solo usuarios con rol de responsable
                const allResponsibles = response.data.filter(user => user.role?.name === 'TRABAJADOR');

                // Filtrar solo usuarios habilitados (status = true)
                const enabledResponsibles = allResponsibles.filter(user => user.status);
                
                // Obtener IDs de responsables ya asignados (excepto el actual)
                const assignedResponsibleIds = existingStorages
                    .filter(storage => 
                        storage.responsible && 
                        storage.id !== storageData.id // Excluir el almacén actual
                    )
                    .map(storage => storage.responsible.id);
                
                // Filtrar responsables disponibles (no asignados o el actual responsable) y con status habilitado
                const availableResponsibles = enabledResponsibles.filter(user =>
                    !assignedResponsibleIds.includes(user.id) ||
                    (storageData.responsible && user.id === storageData.responsible.id)
                );
                
                setResponsibles(availableResponsibles);
            }
        } catch (error) {
            console.error("Error fetching responsibles:", error);
            showError('Error al cargar los responsables');
        }
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
        
        if (!formData.identifier.trim()) {
            newErrors.identifier = 'El identificador es requerido';
        } else if (!/^[A-Za-z0-9-]+$/.test(formData.identifier)) {
            newErrors.identifier = 'Solo letras, números y guiones';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Selecciona una categoría';
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
                id: formData.id,
                identifier: formData.identifier,
                categoryId: parseInt(formData.categoryId),
                responsibleId: formData.responsibleId ? parseInt(formData.responsibleId) : null,
                status: formData.status
            };

            const response = await AxiosClient.put(`/storage/${formData.id}`, payload);

            if (response.status === "OK") {
                // Obtener la categoría seleccionada
                const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));
                // Obtener el responsable seleccionado (si existe)
                const selectedResponsible = formData.responsibleId 
                    ? responsibles.find(r => r.id === parseInt(formData.responsibleId))
                    : null;
                
                // Crear objeto completo para actualizar el estado
                const updatedStorage = {
                    ...response.data,
                    category: selectedCategory,
                    responsible: selectedResponsible
                };

                Swal.fire({
                    icon: 'success',
                    title: '¡Almacén actualizado!',
                    text: `Almacén ${formData.identifier} actualizado correctamente`,
                    confirmButtonColor: '#00f0ff',
                    background: '#0f172a',
                    color: '#ffffff',
                });
                
                onStorageUpdated(updatedStorage);
                handleClose();
            }
        } catch (error) {
            console.error("Error updating storage:", error);
            let errorMessage = 'Error al actualizar el almacén';
            
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
            id: '',
            identifier: '',
            categoryId: '',
            responsibleId: '',
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
                                    Editar Almacén
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
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.identifier ? 'border-red-500' : 'border-cyan-500/30'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                                            placeholder="Ej: A-001"
                                            disabled={loading}
                                        />
                                        {errors.identifier && (
                                            <p className="mt-1 text-sm text-red-400">{errors.identifier}</p>
                                        )}
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-400 mb-1">
                                            Categoría *
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 rounded-lg bg-gray-800/70 border ${
                                                errors.categoryId ? 'border-red-500' : 'border-cyan-500/30'
                                            } text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                                            disabled={loading || categories.length === 0}
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && (
                                            <p className="mt-1 text-sm text-red-400">{errors.categoryId}</p>
                                        )}
                                    </div>

                                    {/* Responsable */}
                                    <div>
                                        <label className="block text-sm font-medium text-purple-400 mb-1">
                                            Responsable (Opcional)
                                        </label>
                                        {responsibles.length > 0 ? (
                                            <select
                                                name="responsibleId"
                                                value={formData.responsibleId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800/70 border border-purple-500/30 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                disabled={loading}
                                            >
                                                <option value="">Sin responsable</option>
                                                {responsibles.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.fullName} ({user.role?.name})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic">
                                                No hay responsables disponibles
                                            </div>
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
                                                {formData.status ? 'Activo' : 'Inactivo'}
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
                                                <FaSpinner className="animate-spin" /> Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Guardar Cambios
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

export default StorageEditModal;