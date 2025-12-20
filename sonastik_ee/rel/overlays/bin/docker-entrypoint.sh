#!/bin/sh
set -e

echo "Starting Sonastik EE deployment..."

# Run database migrations
echo "Running database migrations..."
/app/bin/migrate

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "Migration failed! Aborting server startup."
  exit 1
fi

# Start the Phoenix server
echo "Starting Phoenix server..."
exec /app/bin/server
