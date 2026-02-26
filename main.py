from app import Config
from app.voc_monitor import VOCMonitor
from gevent import monkey
monkey.patch_all()

print(">>> CONTAINER STARTED <<<", flush=True)

voc_monitor = VOCMonitor(
    Config.MQTT_HOST,
    Config.MQTT_PORT,
    Config.WEB_SERVER_PORT
)
voc_monitor.run()
