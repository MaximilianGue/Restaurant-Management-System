# Create a virtual environment and activate it
python3 -m venv env
source env/bin/activate

# install dependencies
pip install -r requirments.txt

# .env file creation

touch .env
echo "SECRET_KEY=0Kb2He1bzlM1I6nCKAJm8vLxyKmVYOSrZQSFyVorf_q2T8V1T9rQn-J2yfyUcrz-MDw
# Database Configuration
DB_NAME='Cafe-Database'
DB_USER='myuser'
DB_PASSWORD='NewStrongPassword'
DB_HOST='34.89.89.22'
DB_PORT='3306'" > .env

# Apply database migrations:
python3 manage.py makemigrations
python3 manage.py migrate

# Start the Django development server:
python manage.py runserver
