import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

type AlertHandler = (message: string) => void;

/**
 * One Socket.IO connection for the whole app.
 *
 * Mirrors modules/socket.js: listen for the server's `alert` event and hand the
 * message to the caller. The handler is kept in a ref so a changing callback
 * does not tear down and recreate the connection.
 */
export function useSocket(onAlert: AlertHandler): void {
  const handlerRef = useRef(onAlert);
  handlerRef.current = onAlert;

  useEffect(() => {
    // No URL -> same origin. In dev the Vite proxy forwards /socket.io to Flask.
    const socket = io();

    socket.on("alert", (data: { message: string }) => {
      handlerRef.current(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
