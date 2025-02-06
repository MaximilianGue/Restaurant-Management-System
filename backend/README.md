# Backend Setup Guide

## Setting Up the Virtual Environment

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create a virtual environment:
   ```sh
   python -m venv env
   ```
3. Activate the virtual environment:
   - On macOS/Linux:
     ```sh
     source env/bin/activate
     ```
   - On Windows:
     ```sh
     env\Scripts\activate
     ```

## Installing Dependencies

4. Install required dependencies from `requirements.txt`:
   ```sh
   pip install -r requirements.txt
   ```

## Environment Variables (.env File)

- You need to create an `.env` file inside the `backend` folder.
- The required environment variables are shared in the project’s Discord for security reasons.
- Ensure the `.env` file is correctly set up before running the project.

## Running Migrations

5. Apply database migrations:
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```

## Running the Backend Server

6. Start the Django development server:
   ```sh
   python manage.py runserver
   ```

## Accessing the API

- Once the server is running, you can access the API through the Django-built web interface.
- Navigate to `http://127.0.0.1:8000/` in your browser to see available endpoints.
- You can explore the data for each URL by navigating through the API URLs.

## Navigating Through API Endpoints

Each API URL corresponds to a different dataset:

 - http://127.0.0.1:8000/cafeApi/menu-items/ → Displays all menu items.

 - http://127.0.0.1:8000/cafeApi/customers/ → Shows customer data.

 - http://127.0.0.1:8000/cafeApi/orders/ → Lists orders.


---
This setup ensures the backend runs smoothly with all required configurations. If you encounter any issues, check the Discord server for support.

