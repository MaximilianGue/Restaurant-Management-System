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
DB_PORT='3306'
STRIPE_PUBLISHABLE_KEY=pk_test_51R4Y27C5t9VLsictA5mCv7SzOvXdlB2zQ8aWVfhZsBImpYC3gfWs5oSXKVfI7V4FnsXkPSa0ufPORVQFyJhC5bje00IrZiDo8k
STRIPE_SECRET_KEY=sk_test_51R4Y27C5t9VLsictp6uht1Y02Z8BHYA3Pe2xjsTUC77mudetMTWSAiqrgbTMXkIvLfyvGB748FMl5q6AHHHCNhem001zf6VlfY" > .env

# Apply database migrations:
python3 manage.py makemigrations
python3 manage.py migrate

# Start the Django development server:
python manage.py runserver
