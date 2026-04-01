# Miyar Platform 

A robust, containerized full-stack performance management platform designed for scalability and seamless integration.

##  Tech Stack

* **Frontend:** React, Vite, Ant Design (TypeScript/JavaScript)
* **Backend:** Django, Django REST Framework (Python)
* **DevOps & Infrastructure:** Docker, Docker Compose (Monorepo Architecture)

##  Architecture

This project follows a Monorepo structure, separating concerns while maintaining a unified deployment pipeline. 

```text
Miyar-Platform/
├── frontend/        # React UI application
├── backend/         # Django REST API
└── docker-compose.yml # Orchestration configuration