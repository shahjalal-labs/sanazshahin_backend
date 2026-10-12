# Sanaz Shahin Backend - Personalized Nutrition & Meal Planning API

<p align="center">
  <img src="assets/banner.svg" alt="Sanaz Shahin Backend Banner" width="100%">
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21-black?style=for-the-badge&logo=express" alt="Express"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma" alt="Prisma"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"></a>
  <a href="https://bullmq.io"><img src="https://img.shields.io/badge/BullMQ-5.x-FF4500?style=for-the-badge&logo=redis" alt="BullMQ"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Overview

**Sanaz Shahin Backend (`sanazshahin_backend`)** is an intelligent nutrition, dietary health, and meal planning RESTful API service built with Express.js, TypeScript, and Prisma ORM with MongoDB. The API enables users to track biometric fitness metrics (target weight, caloric requirements, dietary restrictions), generate personalized daily meal plans, compute nutritional macronutrients (protein, fat, fiber, carbs, kcal), schedule BullMQ reminder queues, and manage cloud culinary media.

---

## ⚡ Key Features

- **🥗 Nutrition & Biometrics Modeling:** Comprehensive user health profiles capturing height, weight, dietary restrictions, fitness targets, and daily meal plans.
- **🍳 Recipe Database & Scraper:** Rich recipe schema tracking preparation time, equipment required, caloric density, macro breakdowns, and YouTube video guides.
- **📊 Macro & Caloric Calculator:** Automated daily aggregation of essential macronutrients (fiber, fat, carb, iron, protein, kcal) for assigned meal plans.
- **⚡ BullMQ Background Jobs & Redis:** Asynchronous reminder scheduling (meal reminders, grocery alerts, weekly health summaries) and Bull-Board monitoring.
- **☁️ DigitalOcean Spaces Asset Integration:** AWS SDK v3 file upload handling for culinary imagery and video attachments.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client[Web & Mobile Clients] -->|HTTPS REST| Express[Express.js App Router]

    subgraph Pipeline ["Middleware Pipeline"]
        Express --> Auth[JWT & Role Verification]
        Auth --> Validation[Zod Request Validation]
        Validation --> Storage[DO Spaces / S3 Uploader]
    end

    subgraph Core_Services ["Nutrition Core Services"]
        Storage --> UserSvc[User & Biometrics Service]
        Storage --> MealSvc[Meal Planning & Macros Engine]
        Storage --> RecipeSvc[Recipe Catalog Service]
    end

    subgraph Background_Workers ["Background Jobs"]
        MealSvc --> Bull[BullMQ Queue]
        Bull --> Redis[(Redis)]
        Bull --> Notifications[Email & Push Reminders]
    end

    subgraph Persistence ["Persistence Layer"]
        UserSvc & MealSvc & RecipeSvc --> Prisma[Prisma ORM]
        Prisma --> MongoDB[(MongoDB Database)]
    end
```

---

## 🗂️ Project Structure

```
sanazshahin_backend/
├── assets/
│   └── banner.svg               # Architectural repository banner
├── prisma/
│   └── schema.prisma            # MongoDB schema definitions
├── src/
│   ├── app/
│   │   ├── modules/             # Auth, User, Recipe, MealPlan, Bookmark
│   │   ├── middlewares/         # Auth, validation, error handler
│   │   └── routes/              # Centralized route aggregator
│   ├── config/                  # Environment variables & DB connectors
│   ├── helpers/                 # DO Spaces, JWT, encryption
│   ├── services/                # BullMQ background workers
│   ├── app.ts                   # Express server definition
│   └── server.ts                # Application bootstrapper
├── package.json
└── tsconfig.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express 4** | Backend HTTP API runtime |
| **TypeScript 5** | Strict type definitions and interfaces |
| **Prisma ORM 6** | MongoDB object-relational mapping |
| **MongoDB** | Document datastore for health metrics, recipes, and meal plans |
| **BullMQ & Redis** | Distributed background task queue and notifications |
| **AWS SDK v3 / Spaces** | Cloud object storage for recipe media |
| **Zod** | Runtime request payload validation |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MongoDB instance (MongoDB 6+)
- Redis instance
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shahjalal-labs/sanazshahin_backend.git
   cd sanazshahin_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
