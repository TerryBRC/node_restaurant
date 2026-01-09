import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Socket conectado:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket desconectado');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión socket:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Eventos de mesa
    joinTable(tableId) {
        if (this.socket) {
            this.socket.emit('join-table', tableId);
        }
    }

    leaveTable(tableId) {
        if (this.socket) {
            this.socket.emit('leave-table', tableId);
        }
    }

    // Escuchar eventos
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);

            // Guardar referencia para poder remover después
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }
    }

    // Remover listener específico
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);

            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        }
    }

    // Remover todos los listeners de un evento
    removeAllListeners(event) {
        if (this.socket) {
            this.socket.removeAllListeners(event);
            this.listeners.delete(event);
        }
    }

    // Emitir evento
    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

// Exportar instancia única
const socketService = new SocketService();
export default socketService;
