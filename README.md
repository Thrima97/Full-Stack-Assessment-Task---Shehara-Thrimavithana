# 🧩 Workspace Management System

## 🌐 Live Demo

The Workspace Management System is currently deployed for testing purposes at:

🔗 [Live Demo](https://workspace-management-system-main-xozttq.laravel.cloud/)

> Deployed via [Laravel Cloud](https://laravel.com/cloud).

### 🧪 Test Credentials

You can use the following test accounts to explore the system:

**Admin User**  
Email: `admin@admin.com`  
Password: `adminadmin`

**Regular User**  
Email: `user@user.com`  
Password: `useruser`

---

## 🏢 Workspace Management System — Laravel 12 + React Full-Stack Platform

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

 ---

## ✅ Feature Tests

This project includes 7 feature tests to ensure all core booking functionalities are working as expected:

- `AdminAddNicDetailsTest.php` – Upload NIC details for bookings
- `AdminUpdateBookingStatusTest.php` – Accept/reject booking requests
- `AdminUploadContractTest.php` – Upload signed booking contracts
- `CreateBookingTest.php` – Create new workspace bookings
- `ExtendBookingTest.php` – Extend existing bookings
- `FetchBookingHistoryTest.php` – Retrieve user booking history
- `FetchPackagesTest.php` – List available workspace packages

All test files are located in the `tests/Feature/` directory.

---

## 📬 API Testing with Postman

A Postman collection is included to help you test and explore the API endpoints.

📁 File: `postman/api_collection.json`  
🔐 Auth: Uses Laravel Sanctum with Bearer Token

### 📌 Includes:
- User authentication
- Package listing
- Booking creation & history
- Booking extension
- Admin: approve/reject, upload NIC & contracts

To get started:
1. Import the collection into Postman
2. Set `base_url` (e.g., `http://localhost:8000`)
3. Run `Authenticate` to get your `auth_token`
4. Use other endpoints with `{{auth_token}}` prefilled

