import React, { useState, useEffect } from 'react';
import { 
  FiBox, FiLayers, FiUsers, FiUser, FiArchive, FiPieChart, 
  FiAlertCircle, FiCheckCircle, FiHome, FiTruck 
} from 'react-icons/fi';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
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
import { Spinner } from 'flowbite-react';
import AxiosClient from '../../config/http-gateway/http-client';
import Swal from 'sweetalert2';

// Registramos componentes de ChartJS
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

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalCategories: 0,
    totalStorages: 0,
    totalUsers: 0,
    articlesPerCategory: [],
    storagesPerCategory: [],
    usersPerRole: [],
    recentArticles: [],
    emptyStorages: 0,
    assignedStorages: 0
  });

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
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all APIs using AxiosClient
        const [articlesRes, categoriesRes, storagesRes, usersRes] = await Promise.all([
          AxiosClient({ url: "/articles/", method: "GET" }),
          AxiosClient({ url: "/categories/", method: "GET" }),
          AxiosClient({ url: "/storage/", method: "GET" }),
          AxiosClient({ url: "/users/", method: "GET" })
        ]);

        // Process data
        const articles = articlesRes.data || [];
        const categories = categoriesRes.data || [];
        const storages = storagesRes.data || [];
        const users = usersRes.data || [];

        // Calculate articles per category
        const articlesByCategory = categories.map(category => ({
          name: category.name,
          count: articles.filter(article => article.category?.id === category.id).length
        }));

        // Calculate storages per category
        const storagesByCategory = categories.map(category => ({
          name: category.name,
          count: storages.filter(storage => storage.category?.id === category.id).length
        }));

        // Calculate users per role
        const usersByRole = {};
        users.forEach(user => {
          const roleName = user.role?.name || 'Sin rol';
          usersByRole[roleName] = (usersByRole[roleName] || 0) + 1;
        });

        // Calculate empty storages
        const emptyStorages = storages.filter(storage => storage.articles?.length === 0).length;

        // Calculate assigned storages
        const assignedStorages = storages.filter(storage => storage.responsible !== null).length;

        // Get recent articles (last 5)
        const recentArticles = [...articles]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);

        setStats({
          totalArticles: articles.length,
          totalCategories: categories.length,
          totalStorages: storages.length,
          totalUsers: users.length,
          articlesPerCategory: articlesByCategory,
          storagesPerCategory: storagesByCategory,
          usersPerRole: Object.entries(usersByRole).map(([name, count]) => ({ name, count })),
          recentArticles,
          emptyStorages,
          assignedStorages
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        let errorMessage = 'Error al cargar los datos del dashboard';
        
        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
          errorMessage = 'Error de conexión con el servidor';
        }
        
        showErrorAlert(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Datos para gráficas (igual que antes)
  const articlesByCategoryChart = {
    labels: stats.articlesPerCategory.map(item => item.name),
    datasets: [
      {
        label: 'Artículos por categoría',
        data: stats.articlesPerCategory.map(item => item.count),
        backgroundColor: [
          'rgba(0, 240, 255, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const storagesByCategoryChart = {
    labels: stats.storagesPerCategory.map(item => item.name),
    datasets: [
      {
        label: 'Almacenes por categoría',
        data: stats.storagesPerCategory.map(item => item.count),
        backgroundColor: [
          'rgba(0, 240, 255, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(16, 185, 129, 0.6)'
        ],
        borderWidth: 0
      }
    ]
  };

  const usersByRoleChart = {
    labels: stats.usersPerRole.map(item => item.name),
    datasets: [
      {
        label: 'Usuarios por rol',
        data: stats.usersPerRole.map(item => item.count),
        backgroundColor: [
          'rgba(0, 240, 255, 0.7)',
          'rgba(168, 85, 247, 0.7)'
        ],
        borderWidth: 0
      }
    ]
  };

  const storageStatusChart = {
    labels: ['Asignados', 'No asignados', 'Vacíos'],
    datasets: [
      {
        data: [
          stats.assignedStorages,
          stats.totalStorages - stats.assignedStorages,
          stats.emptyStorages
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  // Métricas clave
  const metrics = [
    { 
      title: 'Total de Artículos', 
      value: stats.totalArticles, 
      icon: <FiBox className="text-2xl" />, 
      color: 'text-cyan-400' 
    },
    { 
      title: 'Total de Categorías', 
      value: stats.totalCategories, 
      icon: <FiLayers className="text-2xl" />, 
      color: 'text-purple-400' 
    },
    { 
      title: 'Almacenes Totales', 
      value: stats.totalStorages, 
      icon: <FiArchive className="text-2xl" />, 
      color: 'text-pink-400' 
    },
    { 
      title: 'Usuarios Registrados', 
      value: stats.totalUsers, 
      icon: <FiUsers className="text-2xl" />, 
      color: 'text-green-400' 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner color="info" size="xl" />
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

      {/* Header */}
      <div className="mb-8 relative">
        <h1 className="text-3xl font-bold text-white">Dashboard de Administración</h1>
        <p className="text-cyan-400">Resumen general del sistema de almacenes</p>
        <div className="absolute -bottom-4 left-0 h-0.5 w-20 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative">
        {/* Artículos por categoría */}
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Artículos por Categoría</h2>
            <div className="flex items-center text-sm text-cyan-400">
              <FiPieChart className="mr-1" />
              Distribución
            </div>
          </div>
          <div className="h-80">
            <Pie 
              data={articlesByCategoryChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#fff'
                    },
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Almacenes por categoría */}
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Almacenes por Categoría</h2>
            <div className="flex items-center text-sm text-purple-400">
              <FiHome className="mr-1" />
              Distribución
            </div>
          </div>
          <div className="h-80">
            <Doughnut 
              data={storagesByCategoryChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#fff'
                    },
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {/* Estado de almacenes */}
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Estado de Almacenes</h2>
          <div className="h-64">
            <Pie 
              data={storageStatusChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#fff'
                    },
                    position: 'right',
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-300">Asignados: {stats.assignedStorages}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-gray-300">No asignados: {stats.totalStorages - stats.assignedStorages}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-300">Vacíos: {stats.emptyStorages}</span>
            </div>
          </div>
        </div>

        {/* Usuarios por rol */}
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Usuarios por Rol</h2>
          <div className="h-64">
            <Bar 
              data={usersByRoleChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                      color: '#fff'
                    }
                  },
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                      color: '#fff',
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Últimos artículos */}
        <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Últimos Artículos</h2>
          <div className="space-y-3">
            {stats.recentArticles.map((article, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className={`p-2 rounded-full mr-3 ${index % 2 === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  <FiBox />
                </div>
                <div>
                  <p className="text-white font-medium">{article.name}</p>
                  <p className="text-gray-400 text-sm">{article.category?.name || 'Sin categoría'}</p>
                </div>
              </div>
            ))}
            {stats.recentArticles.length === 0 && (
              <p className="text-gray-400 text-center py-4">No hay artículos recientes</p>
            )}
          </div>
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

export default Home;