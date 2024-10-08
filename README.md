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
