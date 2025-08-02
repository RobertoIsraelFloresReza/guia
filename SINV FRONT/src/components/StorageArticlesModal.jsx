import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaBoxes, FaTimes } from 'react-icons/fa';

const StorageArticlesModal = ({ isOpen, onClose, storage }) => {
  if (!storage) return null;

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
                  Artículos del Almacén {storage.identifier}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                {storage.articles && storage.articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storage.articles.map((article) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 hover:border-cyan-500/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-cyan-500/10 p-3 rounded-lg text-cyan-400">
                            <FaBoxOpen className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{article.name}</h4>
                            <p className="text-sm text-gray-400">{article.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full">
                                {article.category?.name || 'Sin categoría'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${article.status 
                                ? 'bg-green-500/10 text-green-400' 
                                : 'bg-red-500/10 text-red-400'}`}>
                                {article.status ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                      <FaBoxes className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">No hay artículos en este almacén</h3>
                    <p className="mt-1 text-gray-500">Este almacén está vacío</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition-colors"
                >
                  Cerrar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StorageArticlesModal;