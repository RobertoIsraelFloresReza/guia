import React, { useState } from 'react';
import '../index.css'; // Asegúrate de que el CSS esté importado correctamente

const Notificaciones = () => {
  // Estado inicial de notificaciones
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nuevo mensaje',
      message: 'Tienes un nuevo mensaje de Juan',
      read: false,
      date: '2023-05-15 10:30'
    },
    {
      id: 2,
      title: 'Recordatorio',
      message: 'Reunión a las 3:00 PM hoy',
      read: false,
      date: '2023-05-15 09:15'
    },
    {
      id: 3,
      title: 'Tarea completada',
      message: 'La tarea "Diseño UI" ha sido completada',
      read: true,
      date: '2023-05-14 16:45'
    }
  ]);

  // Marcar notificación como leída
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notificaciones</h2>
        <button onClick={markAllAsRead} className="mark-all-btn">
          Marcar todas como leídas
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No hay notificaciones</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-date">{notification.date}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notificaciones;