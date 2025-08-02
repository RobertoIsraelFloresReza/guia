import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AxiosClient from '../../config/http-gateway/http-client';
import { Spinner } from 'flowbite-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaEye, FaToggleOn, FaToggleOff, FaSearch, FaUserShield, FaPlus } from 'react-icons/fa';
import UserCreateModal from '../../components/UserCreateModal';
import UserEditModal from '../../components/UserEditModal';

const Responsables = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);

    const getUsers = async () => {
        try {
            setLoading(true);
            const response = await AxiosClient({
                url: "/users/",
                method: "GET"
            });
            if (response.status === "OK") {
                const workers = response.data.filter(user => user.role.id === 2);
                setUsers(workers);
            }
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            showErrorAlert('No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

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
        getUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        `${user.fullName} ${user.email} ${user.username}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = async (user) => {
        const result = await Swal.fire({
            title: `¿Cambiar estado de ${user.fullName}?`,
            text: `El usuario quedará como ${user.status ? 'inactivo' : 'activo'}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00f0ff',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, cambiar',
            background: '#0f172a',
            color: '#ffffff',
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await AxiosClient({
                    url: `/users/${user.id}/status`,
                    method: "PATCH"
                });

                if (response.data) {
                    setUsers(prev => prev.map(u =>
                        u.id === user.id ? { ...u, status: !u.status } : u
                    ));

                    Swal.fire({
                        icon: 'success',
                        title: '¡Estado cambiado!',
                        text: `El usuario ahora está ${!user.status ? 'activo' : 'inactivo'}`,
                        confirmButtonColor: '#00f0ff',
                        background: '#0f172a',
                        color: '#ffffff',
                    });
                }
            } catch (error) {
                console.error("Error al cambiar estado:", error);
                let errorMessage = 'No se pudo cambiar el estado';

                if (error.response) {
                    errorMessage = error.response.data?.message || errorMessage;
                } else if (error.request) {
                    errorMessage = 'Error de conexión con el servidor';
                }

                showErrorAlert(errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDetailsClick = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleUserCreated = (shouldReload = false) => {
        if (shouldReload) {
            getUsers(); 
        }
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(prev => prev.map(u =>
            u.id === updatedUser.id ? updatedUser : u
        ));
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
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                            Gestión de Responsables
                        </h1>
                        <p className="text-cyan-300/80 flex items-center gap-2">
                            <FaUserShield className="text-cyan-400" /> Administra los responsables de almacén
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative w-full md:w-64"
                        >
                            <div className="absolute left-3 top-3 text-cyan-400">
                                <FaSearch className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar responsable..."
                                className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-gray-800/70 border border-cyan-500/40 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FaPlus className="h-4 w-4" /> Nuevo Responsable
                        </motion.button>
                    </div>
                </motion.div>

                {/* Tarjeta de tabla */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/30 shadow-xl shadow-cyan-500/10 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <Spinner size="xl" color="info" className="text-cyan-400" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700/50">
                                    <thead className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Correo</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/30">
                                        {filteredUsers.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-gray-800/60 transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 group-hover:text-cyan-300 transition-colors">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <span className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-300">
                                                        {user.fullName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 group-hover:text-white transition-colors">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 group-hover:text-purple-300 transition-colors">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => toggleStatus(user)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${user.status
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                                            } transition-all`}
                                                    >
                                                        {user.status ? (
                                                            <>
                                                                <FaToggleOn className="text-green-400 text-base" />
                                                                Activo
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaToggleOff className="text-red-400 text-base" />
                                                                Inactivo
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDetailsClick(user)}
                                                            className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors shadow-md shadow-cyan-500/10"
                                                            title="Ver detalles"
                                                        >
                                                            <FaEye className="h-4 w-4" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => {
                                                                setSelectedUserToEdit(user);
                                                                setShowEditModal(true);
                                                            }}
                                                            className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors shadow-md shadow-purple-500/10"
                                                            title="Editar"
                                                        >
                                                            <FaEdit className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                                        <FaUserShield className="h-10 w-10 text-cyan-400" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-medium text-gray-300">No se encontraron responsables</h3>
                                    <p className="mt-1 text-gray-500">Intenta con otro término de búsqueda</p>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>

            {/* Modal de Detalles */}
            <AnimatePresence>
                {showDetailsModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-lg rounded-xl border border-cyan-500/30 w-full max-w-md shadow-xl shadow-cyan-500/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                        Detalles del Responsable
                                    </h3>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="text-gray-400 hover:text-white transition-colors text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-6">
                                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                            {selectedUser.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-2xl font-bold text-white">
                                                {selectedUser.fullName || 'Sin nombre'}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.status
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                    {selectedUser.status ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    {selectedUser.role?.name || 'Sin rol'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-700/50">
                                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                                            <h5 className="text-sm font-medium text-cyan-400 mb-3">
                                                Información del Usuario
                                            </h5>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">Nombre completo</p>
                                                    <p className="text-gray-200 font-medium">
                                                        {selectedUser.fullName || 'No disponible'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Nombre de usuario</p>
                                                    <p className="text-gray-200 font-medium">
                                                        {selectedUser.username || 'No disponible'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Correo electrónico</p>
                                                    <p className="text-gray-200 font-medium">
                                                        {selectedUser.email || 'No disponible'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                                            <h5 className="text-sm font-medium text-purple-400 mb-3">
                                                Rol y Estado
                                            </h5>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">Rol</p>
                                                    <p className="text-gray-200 font-medium">
                                                        {selectedUser.role?.name || 'No asignado'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Estado</p>
                                                    <p className={`font-medium ${selectedUser.status ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {selectedUser.status ? 'Activo' : 'Inactivo'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700/50 flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                toggleStatus(selectedUser);
                                                setShowDetailsModal(false);
                                            }}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedUser.status
                                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                                                } transition-colors`}
                                        >
                                            {selectedUser.status ? (
                                                <>
                                                    <FaToggleOff /> Desactivar Usuario
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOn /> Activar Usuario
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modales para crear y editar */}
            <UserCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={handleUserCreated}
            />

            <UserEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUserUpdated={handleUserUpdated}
                userData={selectedUserToEdit}
            />

            {/* Estilos globales */}
            <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-30px) translateX(15px) rotate(5deg);
                    }
                    100% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Responsables;