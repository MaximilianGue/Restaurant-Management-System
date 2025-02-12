# Create and activate a virtual environment
python -m venv env
.\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with necessary configurations
echo SECRET_KEY=0Kb2He1bzlM1I6nCKAJm8vLxyKmVYOSrZQSFyVorf_q2T8V1T9rQn-J2yfyUcrz-MDw > .env
echo # Database Configuration >> .env
echo DB_NAME='Cafe-Database' >> .env
echo DB_USER='myuser' >> .env
echo DB_PASSWORD='NewStrongPassword' >> .env
echo DB_HOST='34.89.89.22' >> .env
echo DB_PORT='3306' >> .env

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Start the Django development server
python manage.py runserver

