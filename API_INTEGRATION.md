# API Integration Guide

This guide provides instructions for frontend developers on how to integrate with the backend API.

## Directory Structure

To maintain a clean and organized codebase, please follow these conventions for making API requests.

1.  **Create an `api` directory:** In your frontend project's `src` folder, create a new directory named `api`.

    ```
    src/
    └── api/
    ```

2.  **Create files based on units:** Inside the `api` directory, create separate files for different modules or units of your application. This helps in organizing the API requests and makes the code easier to maintain.

    For example, you can have the following files:

    *   `src/api/auth.js`: For authentication-related API requests (login, logout, etc.).
    *   `src/api/posts.js`: For post-related API requests (create, read, update, delete).
    *   `src/api/users.js`: For user-related API requests.
    *   `src/api/jobs.js`: For job-related API requests.

    Each file will contain functions that make the actual API calls using a library like `axios` or the native `fetch` API.

## Example API Request

Here is an example of how you can structure an API request function in `src/api/auth.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1'; // Your backend URL

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

## Available API Endpoints

The base path for all the API endpoints is `http://localhost:5001/api/v1`.

### Alumni (`/alumni`)

-   **Get all alumni**
    ```bash
    curl -X GET http://localhost:5001/api/v1/alumni
    ```

-   **Get alumni by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/alumni/:id
    ```

-   **Update alumni**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/alumni/:id -H "Content-Type: application/json" -d '{"name": "John Doe"}'
    ```

### Auth (`/auth`)

-   **Register a new alumni**
    ```bash
    curl -X POST http://localhost:5001/api/v1/auth/register/alumni -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john.doe@example.com", "password": "yoursecurepassword", "graduationYear": 2020, "degreeUrl": "http://example.com/degree.pdf"}'
    ```

-   **Login a user**
    ```bash
    curl -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email": "john.doe@example.com", "password": "yoursecurepassword"}'
    ```

-   **Verify an alumni**
    ```bash
    curl -X POST http://localhost:5001/api/v1/auth/verify/alumni
    ```

### Chat (`/chat`)

-   **Create a new chat**
    ```bash
    curl -X POST http://localhost:5001/api/v1/chat -H "Content-Type: application/json" -d '{"name": "New Chat"}'
    ```

-   **Get all chats**
    ```bash
    curl -X GET http://localhost:5001/api/v1/chat
    ```

-   **Get chat by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/chat/:id
    ```

-   **Update a chat**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/chat/:id -H "Content-Type: application/json" -d '{"name": "Updated Chat"}'
    ```

-   **Delete a chat**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/chat/:id
    ```

### Connection (`/connection`)

-   **Send a connection request**
    ```bash
    curl -X POST http://localhost:5001/api/v1/connections/send-request -H "Content-Type: application/json" -d '{"alumniId": "60d0fe4f5311236168a109ca"}'
    ```

-   **Accept a connection request**
    ```bash
    curl -X POST http://localhost:5001/api/v1/connections/accept-request -H "Content-Type: application/json" -d '{"connectionId": "60d0fe4f5311236168a109cb"}'
    ```

-   **Reject a connection request**
    ```bash
    curl -X POST http://localhost:5001/api/v1/connections/reject-request -H "Content-Type: application/json" -d '{"connectionId": "60d0fe4f5311236168a109cb"}'
    ```

-   **Get all connections**
    ```bash
    curl -X GET http://localhost:5001/api/v1/connections
    ```

### Event (`/event`)

-   **Create a new event**
    ```bash
    curl -X POST http://localhost:5001/api/v1/events -H "Content-Type: application/json" -d '{"name": "New Event", "date": "2025-12-01T12:00:00.000Z"}'
    ```

-   **Get all events**
    ```bash
    curl -X GET http://localhost:5001/api/v1/events
    ```

-   **Get event by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/events/:id
    ```

-   **Update an event**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/events/:id -H "Content-Type: application/json" -d '{"name": "Updated Event"}'
    ```

-   **Delete an event**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/events/:id
    ```

### Job (`/job`)

-   **Create a new job**
    ```bash
    curl -X POST http://localhost:5001/api/v1/jobs -H "Content-Type: application/json" -d '{"title": "Software Engineer", "description": "Job description"}'
    ```

-   **Get all jobs**
    ```bash
    curl -X GET http://localhost:5001/api/v1/jobs
    ```

-   **Get job by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/jobs/:id
    ```

-   **Update a job**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/jobs/:id -H "Content-Type: application/json" -d '{"title": "Senior Software Engineer"}'
    ```

-   **Delete a job**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/jobs/:id
    ```

-   **Apply to a job**
    ```bash
    curl -X POST http://localhost:5001/api/v1/jobs/:id/apply
    ```

### Message (`/message`)

-   **Create a new message**
    ```bash
    curl -X POST http://localhost:5001/api/v1/messages -H "Content-Type: application/json" -d '{"text": "Hello, world!"}'
    ```

-   **Get all messages**
    ```bash
    curl -X GET http://localhost:5001/api/v1/messages
    ```

-   **Get message by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/messages/:id
    ```

-   **Update a message**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/messages/:id -H "Content-Type: application/json" -d '{"text": "Updated message"}'
    ```

-   **Delete a message**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/messages/:id
    ```

### Post (`/post`)

-   **Create a new post**
    ```bash
    curl -X POST http://localhost:5001/api/v1/posts -H "Content-Type: application/json" -d '{"title": "New Post", "content": "Post content"}'
    ```

-   **Get all posts**
    ```bash
    curl -X GET http://localhost:5001/api/v1/posts
    ```

-   **Get post by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/posts/:id
    ```

-   **Update a post**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/posts/:id -H "Content-Type: application/json" -d '{"title": "Updated Post"}'
    ```

-   **Delete a post**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/posts/:id
    ```

-   **Like a post**
    ```bash
    curl -X POST http://localhost:5001/api/v1/posts/:id/like
    ```

-   **Comment on a post**
    ```bash
    curl -X POST http://localhost:5001/api/v1/posts/:id/comment -H "Content-Type: application/json" -d '{"text": "Nice post!"}'
    ```

### Student (`/student`)

-   **Create a student**
    ```bash
    curl -X POST http://localhost:5001/api/v1/students -H "Content-Type: application/json" -d '{"name": "Student 1"}'
    ```

### User (`/user`)

-   **Create a new user**
    ```bash
    curl -X POST http://localhost:5001/api/v1/users -H "Content-Type: application/json" -d '{"name": "New User", "email": "user@example.com"}'
    ```

-   **Get all users**
    ```bash
    curl -X GET http://localhost:5001/api/v1/users
    ```

-   **Get user by ID**
    ```bash
    curl -X GET http://localhost:5001/api/v1/users/:id
    ```

-   **Update a user**
    ```bash
    curl -X PUT http://localhost:5001/api/v1/users/:id -H "Content-Type: application/json" -d '{"name": "Updated User"}'
    ```

-   **Delete a user**
    ```bash
    curl -X DELETE http://localhost:5001/api/v1/users/:id
    ```