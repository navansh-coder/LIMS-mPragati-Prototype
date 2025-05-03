# LIMS-mPragati

# Laboratory Information Management System (LIMS)

This project is a comprehensive Laboratory Information Management System for mPragati that helps manage sample testing requests, user authentication, and laboratory workflows.

## Project Overview

The LIMS-mPragati system consists of:

- **Backend API**: Node.js/Express server connected to MongoDB
- **Frontend UI**: React/TypeScript application with a modern UI

## Prerequisites

For non-technical users, please install the following:

1. [Node.js](https://nodejs.org/en/download/) (LTS version recommended)(v20.15.0.)
2. [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
3. Any code editor (like [Visual Studio Code](https://code.visualstudio.com/download))

## Setting Up the Project

### Backend Setup

1. Open your terminal/command prompt
2. Navigate to the backend folder:

```bash
cd path/to/LIMS-mPragati/backend
```

3. Install the required dependencies:

```bash
npm install
```

4. Set up the environment variables:

- The `backend/.env` file should already be in the backend folder
- If not, create one with the following content:

```bash
MONGO_URI="mongodb://localhost:27017/LIMS-mpragati" PORT=5000 EMAIL_SERVICE="Gmail" EMAIL_HOST=smtp.gmail.com EMAIL_PORT=587 EMAIL_USERNAME="your-email@gmail.com" EMAIL_PASSWORD="your-app-password" JWT_SECRET="your-secret-key" JWT_EXPIRES_IN=30d
```

- Replace email credentials with your own Gmail account
- For Gmail, you need to set up an [App Password](https://support.google.com/accounts/answer/185833)

### Frontend Setup

1. Navigate to the frontend folder:

```bash
cd path/to/LIMS-mPragati/frontend1
```

2. Install the required dependencies:

```bash
npm i
```

## Running the Application

### Start MongoDB

1. Make sure MongoDB is running on your system

- On Windows, it may run as a service by default
- On Mac/Linux, you might need to run `mongod` in a terminal

### Start the Backend Server

1. Open a terminal and navigate to the backend folder
2. Run the development server:

```bash
npm run dev
```

3. The server should start and display: "Server running in development mode on port 5000"

### Start the Frontend Application

1. Open a new terminal window/tab and navigate to the frontend1 folder
2. Run the development server:

```bash
npm run dev
```

3. The application should start and be available at: http://localhost:5173

## Using the Application

1. Open your browser and navigate to: http://localhost:5173
2. You'll see the login page
3. New users can register by clicking the "Register" link
4. After registration, you'll receive an OTP (One-Time Password) via email
5. Enter the OTP to verify your account
6. Once verified, you can log in and access the dashboard
