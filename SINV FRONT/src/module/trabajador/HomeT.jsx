import React, { useState, useEffect } from "react";
import { FiBox, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import AxiosClient from '../../config/http-gateway/http-client';
import Spinner from '../../components/Spinner';
import Swal from 'sweetalert2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const HomeAdminG = () => {
    const [loading, setLoading] = useState(true);
    const [storageData, setStorageData] = useState([]);
    const [metrics, setMetrics] = useState({
        totalStorages: 0,
        activeStorages: 0,
        totalArticles: 0,
        categoriesDistribution: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await AxiosClient.get('/storage/');
                const storages = response.data || [];

                const categoriesResponse = await AxiosClient.get('/categories/');
                const categories = categoriesResponse.data || [];

                const totalArticles = storages.reduce((sum, storage) =>
                    sum + (storage.articles?.length || 0), 0);

                const activeStorages = storages.filter(s => s.status).length;

                const categoryCount = {};
                storages.forEach(storage => {
                    const categoryName = storage.category?.name || 'Sin categoría';
                    categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
                });

                const categoriesDistribution = categories.map(category => ({
                    name: category.name,
                    count: categoryCount[category.name] || 0
                }));

                categoriesDistribution.sort((a, b) => b.count - a.count);
                const topCategories = categoriesDistribution.slice(0, 20);

                setStorageData(storages);
                setMetrics({
                    totalStorages: storages.length,
                    activeStorages,
                    totalArticles,
                    categoriesDistribution: topCategories
                });

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los datos del dashboard',
                    confirmButtonColor: '#00f0ff',
                    background: '#0f172a',
                    color: '#ffffff',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Configuración de gráficas con estilo futurista
    const storageStatusData = {
        labels: ['Activos', 'Inactivos'],
        datasets: [
            {
                label: 'Estado de Almacenes',
                data: [metrics.activeStorages, metrics.totalStorages - metrics.activeStorages],
                backgroundColor: ['rgba(0, 240, 255, 0.7)', 'rgba(168, 85, 247, 0.7)'],
                borderColor: ['#00f0ff', '#a855f7'],
                borderWidth: 1
            }
        ]
    };

    const categoriesData = {
        labels: metrics.categoriesDistribution.map(c => c.name),
        datasets: [
            {
                label: 'Almacenes por Categoría',
                data: metrics.categoriesDistribution.map(c => c.count),
                backgroundColor: [
                    'rgba(0, 240, 255, 0.7)',
                    'rgba(110, 231, 183, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(249, 168, 212, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(129, 140, 248, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',
                    'rgba(167, 139, 250, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 113, 133, 0.7)',



                ],
                borderColor: [
                    '#00f0ff',
                    '#6ee7b7',
                    '#a855f7',
                    '#ec4899',
                    '#f9a8d4', 
                    '#3b82f6',
                    '#818cf8',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',          
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',  
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                    '#f87171',
                    '#a78bfa',
                    '#f59e0b',
                    '#22c55e',
                ],
                borderWidth: 1
            }
        ]
    };

    const monthlyData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
            {
                label: 'Artículos agregados',
                data: [15, 25, 18, 30, 22, 35],
                borderColor: '#00f0ff',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#a855f7',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2
            }
        ]
    };

    // Opciones comunes para gráficas
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e2e8f0',
                    font: {
                        family: 'Inter, sans-serif'
                    }
                }
            },
            title: {
                display: true,
                color: '#e2e8f0',
                font: {
                    family: 'Inter, sans-serif',
                    size: 16
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spinner color="info" size="xl" />
                <p className="ml-4 text-cyan-400">Cargando dashboard...</p>
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
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8"
                >
                    Dashboard de Almacenes
                </motion.h1>

                {/* Resumen de métricas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20">
                                <FiBox className="text-cyan-400 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-cyan-400">Almacenes</h2>
                                <p className="text-2xl font-bold text-white">{metrics.totalStorages}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                                <FiActivity className="text-purple-400 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-purple-400">Activos</h2>
                                <p className="text-2xl font-bold text-white">
                                    {metrics.activeStorages} <span className="text-sm font-normal text-gray-400">({Math.round((metrics.activeStorages / metrics.totalStorages) * 100)}%)</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-pink-500/20 p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20">
                                <FiBox className="text-pink-400 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-pink-400">Artículos</h2>
                                <p className="text-2xl font-bold text-white">{metrics.totalArticles}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                Estado de Almacenes
                            </span>
                        </h2>
                        <div className="h-64">
                            <Pie
                                data={storageStatusData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Distribución por estado'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Almacenes por Categoría
                            </span>
                        </h2>
                        <div className="h-64">
                            <Bar
                                data={categoriesData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Top 20 categorías'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-pink-500/20 p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                                Artículos Mensuales
                            </span>
                        </h2>
                        <div className="h-64">
                            <Line
                                data={monthlyData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Tendencia de artículos'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-blue-500/20 p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                Distribución por Categoría
                            </span>
                        </h2>
                        <div className="h-64">
                            <Pie
                                data={categoriesData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Distribución porcentual'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

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

export default HomeAdminG;