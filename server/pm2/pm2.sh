#!/bin/bash

APP_NAME="spec-lens"

case "$1" in
  start)
    echo "🚀 Starting $APP_NAME..."
    pm2 start ecosystem.config.cjs
    ;;
  stop)
    echo "🛑 Stopping $APP_NAME..."
    pm2 stop $APP_NAME
    ;;
  restart)
    echo "🔄 Restarting $APP_NAME..."
    pm2 restart $APP_NAME
    ;;
  reload)
    echo "♻️ Reloading $APP_NAME (zero-downtime)..."
    pm2 reload $APP_NAME
    ;;
  delete)
    echo "🗑️ Deleting $APP_NAME..."
    pm2 delete $APP_NAME
    ;;
  apply)
    echo "⚙️ Applying config and restarting $APP_NAME..."
    pm2 delete $APP_NAME 2>/dev/null
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ Config applied!"
    ;;
  logs)
    pm2 logs $APP_NAME
    ;;
  status)
    pm2 status
    ;;
  setup)
    echo "⚙️ Setting up PM2 startup..."
    pm2 startup
    pm2 save
    echo "✅ PM2 will auto-start on reboot"
    ;;
  *)
    echo "Usage: ./pm2.sh {start|stop|restart|reload|apply|delete|logs|status|setup}"
    echo ""
    echo "Commands:"
    echo "  start     - Start the application"
    echo "  stop      - Stop the application"
    echo "  restart   - Restart the application"
    echo "  reload    - Zero-downtime reload"
    echo "  apply     - Apply config changes and restart"
    echo "  delete    - Remove from PM2"
    echo "  logs      - View logs"
    echo "  status    - Check status"
    echo "  setup     - Enable auto-start on reboot"
    exit 1
    ;;
esac
