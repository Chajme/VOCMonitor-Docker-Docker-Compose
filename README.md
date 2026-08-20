# VOCMonitor

VOCMonitor is a Python/Flask web application for real-time indoor air quality monitoring. It continuously subscribes to MQTT topics, receives **temperature**, **humidity**, and **VOC index** readings published by sensors (e.g. ESP devices) on the local network, stores the data in SQLite, and visualizes it on a live web dashboard with charts and configurable alerts.

The project is fully containerized with Docker Compose, bundling the Flask app together with a Mosquitto MQTT broker.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting Started with Docker](#getting-started-with-docker)
- [Configuration (.env)](#configuration-env)
- [MQTT Message Format](#mqtt-message-format)
- [Web Pages & API Endpoints](#web-pages--api-endpoints)
- [Notifications & Alerts](#notifications--alerts)
- [HTTPS with nginx](#https-with-nginx)
- [Local Development (without Docker)](#local-development-without-docker)
- [Project Structure](#project-structure)
- [Database](#database)
- [Architecture Diagram](#architecture-diagram)
- [Warning](#warning)
- [Author](#author)

## Features

- **Real-time MQTT ingestion** — subscribes to multiple device topics using paho-mqtt (MQTT v5).
- **Live dashboard** — readings are pushed to the browser in real time via Flask-SocketIO.
- **Historical charts** — sensor data visualization with averages over 24h, 72h, and 7 days, plus min/max values.
- **Device management** — add, remove, and switch between devices/topics directly from the web UI.
- **Notifications & alerts**:
  - In-app browser alerts via Socket.IO
  - Email notifications (Flask-Mail, SMTP)
  - ESP hardware alarm triggered over MQTT
  - Temperature and humidity threshold alerts
- **Customizable settings** — thresholds, cooldown periods, notification messages, and advice text configurable in the UI.
- **SQLite persistence** — readings, devices, notifications, and user settings stored locally.
- **Dockerized deployment** — one-command setup with Docker Compose (app + Mosquitto).
- **Optional HTTPS** — nginx reverse proxy configuration included.

## Architecture

The system follows a publish/subscribe data flow:

```
 ESP Sensor  ──(MQTT)──▶  Mosquitto Broker  ──(MQTT)──▶  MQTTManager
                                                              │
                                                              ▼
                                                        SQLite (DatabaseManager)
                                                              │
                                                              ▼
                                              Flask + Socket.IO (VOCMonitor/Routes)
                                                              │
                                                              ▼
                                                        Web Browser (charts)
```

1. Sensors publish CSV messages to an MQTT broker (Mosquitto) on the local network.
2. `MQTTManager` subscribes to the configured topics and receives the messages.
3. Every 5 readings, an average VOC value is stored together with temperature and humidity in SQLite by `DatabaseManager`.
4. `Routes` (Flask blueprints) expose the stored data as JSON and render the web pages.
5. The browser updates live through Socket.IO and displays charts via the frontend JS modules.

The main application classes are `VOCMonitor`, `MQTTManager`, `DatabaseManager`, `Routes`, `NotificationManager`, and `Config`.

## Requirements

**Recommended: Docker + Docker Compose** (no manual dependency setup needed).

For running without Docker:

- Python 3.13.3
- SQLite3
- Flask 3.1.3
- Flask-SocketIO 5.6.0
- Flask-Mail
- paho-mqtt
- gevent
- Mosquitto MQTT broker

Dependencies are listed in [`requirements.txt`](requirements.txt).

## Getting Started with Docker

### 1. Clone the repository

```bash
git clone https://github.com/your-username/VOCMonitor-Docker-Docker-Compose.git
cd VOCMonitor-Docker-Docker-Compose
```

### 2. Configure the environment

Copy/adjust the `.env` file with your own settings (see [Configuration](#configuration-env)).

### 3. Build and start the containers

```bash
docker compose up --build
```

This starts two services:

| Service | Container name | Port |
|---------|----------------|------|
| `app` | `vocmonitor_app` | `5000` (web UI) |
| `mosquitto` | `vocmonitor_mqtt` | `1883` (MQTT) |

### 4. Access the dashboard

Open [http://localhost:5000](http://localhost:5000) in your browser. From another device on the same LAN, use `http://<host-ip>:5000`.

## Configuration (.env)

The application is configured through environment variables defined in `.env` (loaded into the container via `env_file`). The `Config` class in `app/config.py` reads these values.

| Variable | Default | Description |
|----------|---------|-------------|
| `MQTT_HOST` | `192.168.0.101` | Hostname/IP of the MQTT broker (`mosquitto` inside Docker). |
| `MQTT_PORT` | `1883` | Port of the MQTT broker. |
| `MQTT_USERNAME` | `root` | MQTT username. |
| `MQTT_PASSWORD` | *(empty)* | MQTT password. |
| `MAIL_SERVER` | `smtp.gmail.com` | SMTP server used by Flask-Mail. |
| `MAIL_PORT` | `465` | SMTP port (SSL). |
| `MAIL_USE_TLS` | `0` | Enable/disable TLS. |
| `MAIL_USE_SSL` | `1` | Enable/disable SSL. |
| `MAIL_USERNAME` | *(gmail address)* | Sender email account. |
| `MAIL_PASSWORD` | *(gmail app password)* | App password for the sender account. |
| `MAIL_DEFAULT_SENDER` | *(gmail address)* | Default sender shown in outgoing emails. |
| `SOCKETIO_ASYNC_MODE` | `gevent` | Async mode for Flask-SocketIO. |
| `WEB_SERVER_PORT` | `5000` | Port the web server listens on. |

## MQTT Message Format

Sensors publish messages to their subscribed topics as comma-separated values:

```
temperature,humidity,voc_index
```

Example:

```
23.5,45.2,180
```

Handling rules (`mqtt_manager.py`):

- Messages with fewer than 3 parts are rejected as invalid.
- Every **5 received messages** per device are averaged (VOC) and one row is written to the database with the current timestamp.
- Invalid or malformed messages are logged and ignored.

## Web Pages & API Endpoints

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `index.html` | Main dashboard showing the selected device's live data. |
| `/compact` | `compact.html` | Compact view of the current sensor readings. |
| `/chart` | `chart.html` | Full chart view with historical data. |
| `/devices` | `devices.html` | Manage devices and MQTT topics. |
| `/settings` | `settings.html` | Configure thresholds, notifications, and advice messages. |

### API endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/all-data` | GET | All stored data for the selected device. |
| `/data` | GET | Latest data row for the selected device (also checks notifications). |
| `/avg` | GET | Average VOC for 24h, 72h, and 7 days. |
| `/minmax` | GET | Min/max VOC for 24h and 72h. |
| `/update_settings` | POST | Persist user settings. |
| `/get_settings` | GET | Retrieve current user settings. |
| `/default_settings` | POST | Reset settings to defaults. |
| `/notification_history` | GET | List all recorded notifications. |
| `/notification_clear` | POST | Clear all notifications. |
| `/delete_notification` | POST | Delete a single notification by id. |
| `/devices_list` | GET | List all registered devices. |
| `/new_device` | POST | Register a new device and subscribe to its topic. |
| `/devices_clear` | POST | Remove all devices. |
| `/delete_device` | POST | Delete a single device and unsubscribe. |
| `/select_device` | POST | Set the currently selected device. |
| `/current_device` | GET | Return the currently selected device. |

## Notifications & Alerts

VOCMonitor supports four notification channels. Thresholds and cooldown periods are configured on the **Settings** page (or via `/update_settings`).

| Type | Trigger | Delivery |
|------|---------|----------|
| **In-app alert** | VOC exceeds threshold | Socket.IO `alert` event to the browser |
| **Email** | VOC exceeds threshold | Email via SMTP (Gmail) |
| **ESP alarm** | VOC exceeds threshold | MQTT publish to `alert/testing` (`"on"`/`"off"`) |
| **Temperature/Humidity** | Value exceeds threshold | Socket.IO `alert` event |

Email notifications require a valid Gmail account configured in `.env` (see [Warning](#warning)). The ESP alarm publishes an `"on"` payload when a threshold is exceeded and `"off"` after the configured alarm duration.

## HTTPS with nginx

The repository includes an nginx reverse proxy configuration in [`nginx/nginx.conf`](nginx/nginx.conf). It forwards requests to the Flask app and enables the WebSocket upgrade headers needed by Socket.IO. Run nginx on top of the Docker Compose stack to serve the dashboard over HTTPS on port 443.

## Local Development (without Docker)

### 1. Install dependencies

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/macOS

pip install -r requirements.txt
```

### 2. Run the application

```bash
python main.py
```

This starts the MQTT client in a background thread and launches the production web server on port `5000`. A Mosquitto broker must be reachable at `MQTT_HOST`/`MQTT_PORT`.

## Project Structure

```
.
├── app/                          # Flask application
│   ├── config.py                 # Reads environment configuration
│   ├── notification_manager.py   # Notification/alarm logic
│   ├── routes.py                 # Web routes & API endpoints
│   ├── voc_monitor.py            # Main class: wires everything together
│   ├── static/                   # CSS, JS modules, images
│   └── templates/                # HTML pages (index, compact, chart, devices, settings)
├── database/
│   ├── db_manager.py             # SQLite queries and connection handling
│   └── database.db               # SQLite database file
├── mosquitto/
│   └── config/mosquitto.conf     # Mosquitto broker configuration
├── nginx/
│   └── nginx.conf                # Reverse proxy for HTTPS
├── .env                          # Environment variables (MQTT, mail, ports)
├── docker-compose.yml            # Compose stack (app + mosquitto)
├── Dockerfile                    # Container image for the app
├── main.py                       # Entry point (production)
├── mqtt_manager.py               # MQTT client, subscriptions, message handling
├── requirements.txt              # Python dependencies
└── vocmonitor.puml               # PlantUML class diagram
```

## Database

Data is stored in a SQLite database at `database/database.db`. It contains:

| Table | Purpose |
|-------|---------|
| `devices` | Registered devices (name + MQTT topic). |
| `<device_name>` | Sensor readings per device (timestamp, temperature, humidity, voc). |
| `notifications` | Notification history (timestamp, message, voc). |
| `user_settings` | User-configured thresholds, cooldowns, and advice messages. |

## Architecture Diagram

A PlantUML class diagram of the main components is provided in [`vocmonitor.puml`](vocmonitor.puml).

## Warning

In order to use email notifications for exceeded data thresholds, a Gmail account is required. Update `MAIL_USERNAME` and `MAIL_PASSWORD` (an app password, not your regular password) in the `.env` file with your own credentials.

## Author

Molitoris Erik