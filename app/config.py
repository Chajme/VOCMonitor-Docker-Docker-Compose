import os

def get_env(name, default=None, cast=None, required=True):
    value = os.getenv(name, default)

    if required and value is None:
        raise RuntimeError(f"Missing required environment variable '{name}'")

    if cast and value is not None:
        return cast(value)

    return value

class Config:
    # Flask
    DEBUG = get_env("DEBUG", "0", int)

    #MQTT
    MQTT_HOST = get_env("MQTT_HOST", "192.168.0.101")
    MQTT_PORT = get_env("MQTT_PORT", "1883", int)
    MQTT_USERNAME = get_env("MQTT_USERNAME", "root", str)
    MQTT_PASSWORD = get_env("MQTT_PASSWORD", "", str)

    # Flask-Mail
    MAIL_SERVER = get_env("MAIL_SERVER", "smtp.gmail.com", str)
    MAIL_PORT = get_env("MAIL_PORT", 465)
    MAIL_USE_TLS = get_env("MAIL_USE_TLS", "0") == "1"
    MAIL_USE_SSL = get_env("MAIL_USE_SSL", "1") == "1"
    MAIL_USERNAME = get_env("MAIL_USERNAME", "vocmonitorsystem@gmail.com", str)
    MAIL_PASSWORD = get_env("MAIL_PASSWORD", "gtwp oxki yona tcld", str)
    MAIL_DEFAULT_SENDER = get_env("MAIL_DEFAULT_SENDER", "vocmonitorsystem@gmail.com")

    # Socket.IO
    SOCKETIO_ASYNC_MODE = get_env("SOCKETIO_ASYNC_MODE", "gevent")

    # Web-Server
    WEB_SERVER_PORT = get_env("WEB_SERVER_PORT", 5000, int)