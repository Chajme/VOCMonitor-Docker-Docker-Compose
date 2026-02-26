# use official lightweight python base image
FROM python:3.13.3-slim

# Set working directory inside the container
# All commands will run from it
WORKDIR /app

# Copy only requirements first
# Allows docker to cache dependency installation
# Rebuilts are thus much faster if code changes
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project file into container
COPY . .

# Prevent python from buffering stdout/stderr
# Makes logs appear immediately in docker logs
ENV PYTHONBUFFERED=1

# Default commands executed when container starts
CMD ["python", "main.py"]