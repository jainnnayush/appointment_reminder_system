# Notification-Based Appointment Reminder System (Backend)

This is a backend system designed for scheduling and notifying patients of their upcoming medical appointments. It handles user authentication, appointment management, and automated email notifications using Redis queues and BullMQ.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Redis & BullMQ](#running-redis--bullmq)
- [Starting the Application](#starting-the-application)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [License](#license)

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Next.js** (>= 14.x)
- **PostgreSQL** (Database)
- **Redis** (BullMQ)
- **A cloud SMTP service** (any SMTP-compatible email service)

---

## Installation

Follow the steps below to set up the project:

### 1. Clone the Repository

Start by cloning the project repository to your local machine:

```bash
git clone https://github.com/yourusername/appointment-reminder-system.git
cd appointment-reminder-system

### 2. Install Dependencies
Make sure you have Next.js installed. Then, install all the required packages by running:

```bash
npm install

## Environment Variables
Create a .env file in the root directory. Add the following variables and update the values as per your configuration:

# Database connection URL (PostgreSQL)
DATABASE_URL=your_postgresql_connection_url

# JWT Secret for token generation
JWT_SECRET=your_jwt_secret

# Redis configuration
REDIS_URL=redis://default:redis_password@redis_host:redis_port
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# Mail server configuration (SMTP)
MAIL_HOST=your_smtp_host
MAIL_PORT=your_smtp_port
MAIL_USER=your_smtp_user
MAIL_PASSWORD=your_smtp_password
