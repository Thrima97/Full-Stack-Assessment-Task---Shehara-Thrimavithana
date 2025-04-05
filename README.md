# 🧩 Workspace Booking Management System

A full-stack workspace booking management platform built with *Laravel 12* and *React*, supporting:

- Admin & user dashboards
- Booking approval & conflict handling
- Extendable bookings (daily → yearly)
- Seat/package management
- Dockerized local development

---

## 🚀 Tech Stack

- *Backend*: Laravel 12 (PHP 8.3)
- *Frontend*: React + Inertia.js
- *Auth*: Laravel Breeze (React preset)
- *Database*: MySQL (via Docker)
- *Dev Environment*: Docker + Makefile
- *Shell*: /bin/sh

---

## ⚙️ Local Development Setup

> Docker and Make are required.

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:Thrima97/Full-Stack-Assessment-Task---Shehara-Thrimavithana.git
```

```bash
cd Full-Stack-Assessment-Task---Shehara-Thrimavithana
```

### 2️⃣ Start the Docker Containers

   *(Run this command inside the project folder terminal.)*

### The project is successfully up, run the following command to enter the system shell

```bash
cp .env.example .env
```

```bash
make up
```


### 3️⃣ Install Dependencies (Inside Container)



```bash
make shell
composer install
php artisan key:generate
```

Go to [http://localhost:8001](http://localhost:8001) to access the database manager and create a database using the given database name.

### Run the following command to create the database tables

```bash
php artisan migrate
```
### Install NPM dependencies using

```bash
npm install
```

Compile the frontend assets (CSS and JS) using:

```bash
npm run dev
```

Now you can see the project running in [http://localhost:8000](http://localhost:8000).

Now you can see the mailhog running in [http://localhost:8025](http://localhost:8025).

### Shutdown main system docker containers.
```bash
make down
```
 *(Run this command inside the project folder terminal.)*


  **Email Sending added to queue if your queue connection in database plese run queue work**

## Promote Admin

```bash
php artisan user:promote {email}
```

 **promote admin using shell**
