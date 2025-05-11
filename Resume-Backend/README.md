# Resume Builder Backend

This is the backend API for the Resume Builder application. It generates PDF resumes from JSON data using LaTeX.

## Configuration

The application uses AWS Secrets Manager for managing sensitive configuration values. The following secrets are required:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- APP_DOMAIN
- AWS_ACCOUNT_ID

## Prerequisites

- Python 3.7+
- pdflatex (LaTeX compiler)
- Dependencies listed in requirements.txt

## Installation

1. Install LaTeX (if not already installed):

   ```bash
   # For macOS (using Homebrew)
   brew install --cask mactex-no-gui

   # For Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python app.py
```

The server will run on http://localhost:5001

## API Endpoints

- `GET /`: Health check endpoint
- `GET /api/sample-data`: Get sample resume data
- `POST /api/generate-pdf`: Generate PDF resume from JSON data

## Example Usage

To generate a PDF:

```bash
curl -X POST -H "Content-Type: application/json" -d @sample_data.json http://localhost:5001/api/generate-pdf --output resume.pdf
```

Where `sample_data.json` contains the resume data.

## Running Tests

The backend includes comprehensive tests using pytest. To run the tests:

```bash
# Make sure you're in the virtual environment
source venv-new/bin/activate

# Run tests with coverage report
./run_tests.sh
```

This will:
1. Run all the tests with coverage reporting
2. Generate an HTML coverage report in the `htmlcov` directory
3. Show a summary of test coverage

### Test Structure

- `tests/test_app.py` - Tests for Flask routes and utility functions
- `tests/test_pdf_generation.py` - Tests for PDF generation functionality
- `tests/test_main.py` - Tests for main entry point
- `tests/conftest.py` - Common fixtures and setup

### Running Individual Tests

```bash
# Run a specific test file
python -m pytest tests/test_app.py

# Run a specific test function
python -m pytest tests/test_app.py::test_home_route
```

## Coverage

The tests achieve over 97% code coverage, ensuring the reliability of the backend functionality.

## Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run tests:
```bash
pytest tests/
```

3. Run the application:
```bash
python app.py
```

## Deployment

The application is deployed using GitHub Actions and AWS ECS. The deployment process is automated and includes:

1. Running tests
2. Building Docker image
3. Pushing to ECR
4. Deploying with Terraform

For more details, see the GitHub Actions workflow configuration.
