Platform: Native iOS & Android application, with optional Web support
Framework: Expo Router + React Native

This project is a cross-platform mobile application built using modern React Native technologies.
The application is designed to run natively on both iOS and Android, while also being exportable to the web when needed.

How to Edit and Develop the Application

The application can be developed and maintained locally using your preferred development tools and workflow.

Using a Local Code Editor (Recommended)

You can work on the project locally using any modern code editor such as VS Code, Cursor, or similar tools.

Prerequisites

Before running the project, make sure the following tools are installed:

Node.js (recommended via nvm)

Bun (package manager and runtime)

Local Development Setup

Follow these steps to run the project locally:
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate into the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
bun install

# Step 4: Start the web preview (with hot reload)
bun run start-web

# Step 5: Start the mobile development server
bun run start
Once the development server is running:

You can open the app in a web browser

Or scan the QR code using Expo Go on a mobile device

On macOS, you can press i to open the iOS Simulator

Editing Directly via GitHub

You can also make quick changes directly through GitHub:

Navigate to the relevant file

Click the Edit (pencil) icon

Commit your changes

These updates will be reflected in the project immediately.

Technology Stack

This project is built using a modern, production-ready mobile development stack:

React Native – Cross-platform native mobile framework developed by Meta

Expo – A powerful platform that extends React Native with tooling, APIs, and deployment capabilities

Expo Router – File-based routing system for scalable navigation

TypeScript – Type-safe JavaScript for improved reliability and maintainability

React Query – Efficient server-state management

Modern Tooling – Fast builds, hot reload, and optimized developer experience
