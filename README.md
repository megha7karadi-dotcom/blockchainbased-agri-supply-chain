# AgriTrace — Blockchain-Based Agricultural Supply Chain

AgriTrace is a full-stack agricultural supply chain traceability platform that combines blockchain technology, AI-powered crop recommendations, and price prediction to improve transparency and support data-driven decisions.

## Features

- **Supply Chain Traceability:** Track agricultural produce through the supply chain.
- **Blockchain Integration:** Smart contracts support supply chain verification.
- **Farmer Dashboard:** Access produce information and relevant tools.
- **AI Crop Recommendation:** A Python-based service recommends crops using a trained machine learning model.
- **Price Prediction:** A Python API provides agricultural price predictions.
- **Model Performance:** View model evaluation metrics through the application.
- **Product Verification:** Verify produce information through the application.
- **Backend API:** Express and TypeScript server with authentication, product, blockchain, prediction, and model-performance routes.
- **Database Integration:** MongoDB connection with fallback handling for database connectivity issues.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Blockchain | Solidity, OpenZeppelin, ethers.js |
| AI and Machine Learning | Python, trained crop recommendation and price prediction models |
| Testing | Node.js test runner, TypeScript |
| Smart Contract Tools | solc, Ganache |

## Project Structure

```text
.
├── backend/                 # Backend routes, services, and database
├── contracts/               # Solidity smart contracts
├── crop-recommendation/     # Crop recommendation API and model
├── price-api/               # Agricultural price prediction API and models
├── public/                  # Static assets
├── scripts/                 # Contract compilation and deployment scripts
├── src/                     # React frontend
├── tests/                   # Backend and contract tests
├── server.ts                # Express and Vite server entry point
├── package.json
└── .env.example
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3
- Git
- MongoDB connection, if using database-backed functionality

## Installation

Clone the repository and install the Node.js dependencies:

```bash
git clone https://github.com/megha7karadi-dotcom/blockchainbased-agri-supply-chain.git
cd blockchainbased-agri-supply-chain
npm install
```

Create your local environment configuration from the example file:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the configuration required by your environment. Never commit real API keys, database credentials, or private keys.

## Run the Application

Start the main application in development mode:

```bash
npm run dev
```

The server is configured to use port `3000`. Open:

http://localhost:3000

## Python Services

The crop recommendation and price prediction services are maintained in separate directories:

- `crop-recommendation/`
- `price-api/`

Install each service's Python dependencies using its `requirements.txt`, and follow the configuration expected by that service's `app.py`.

Example:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Run these commands from the relevant service directory. The Python services may require their own environment variables and configuration.

## Available npm Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the frontend with Vite |
| `npm run preview` | Preview the Vite build |
| `npm run lint` | Run the TypeScript compiler checks |
| `npm run compile:contracts` | Compile the smart contracts |
| `npm run deploy:contracts` | Run the contract deployment script |
| `npm run test:contracts` | Compile contracts and run contract tests |
| `npm run test:backend` | Run backend metadata persistence tests |
| `npm test` | Run the configured contract and backend tests |

## API and Configuration

The Express server registers API routes for authentication, products, blockchain operations, price prediction, and model performance.

The server exposes a health endpoint at:

```text
GET /api/health
```

Model performance and prediction endpoints are registered by the backend. Refer to the route files in `backend/routes/` for their specific request formats and response structures.

## Model Artifacts and Datasets

The repository includes trained model artifacts, model evaluation outputs, and supporting training files.

The large historical-weather training dataset `price-api/agritrace_prices_with_historical_weather.csv` is intentionally excluded from GitHub because it exceeds GitHub's individual file size limit. Keep a local copy if required for your workflows. Obtain or transfer the dataset separately when reproducing training.

Python virtual environments and generated cache files should be created locally rather than committed.

## Security

- Keep secrets and credentials in local environment files.
- Do not commit `.env` files containing real credentials.
- Protect blockchain private keys and database connection strings.
- Validate configuration before deploying to production.

## Contributing

1. Create a branch for your changes.
2. Make and test your changes.
3. Commit the relevant source files.
4. Open a pull request for review.

## License

No license is specified in this README. Add a license file if you intend to define terms for reuse and distribution.
# AgriTrace — Blockchain-Based Agricultural Supply Chain

AgriTrace is a full-stack agricultural supply chain traceability platform designed to improve transparency, traceability, and data-driven decision-making from farm to consumer. It combines a React web application, an Express backend, blockchain smart contracts, and Python-based machine learning services.

## Features

### Farmer Workspace
- Register and manage agricultural produce batches.
- View harvest information, quantities, quality grades, and prices.
- Transfer produce through supply-chain participants.
- Access farmer transactions, notifications, trust information, and QR codes.
- View crop recommendations, agricultural price predictions, and model performance.
- Switch the farmer interface between **English, Hindi, and Kannada**.
- View profile details and compliance information.

### Supply Chain Traceability
- Maintain produce batch information across supply-chain stages.
- Support product and QR-code verification.
- Provide role-specific workspaces for farmers, distributors, retailers, consumers, and administrators.
- Support produce handovers, inventory workflows, shipment tracking, and transaction history through the application.

### Blockchain Integration
- Solidity smart contracts for supply-chain operations.
- Smart-contract compilation and deployment scripts.
- Ethers.js integration and blockchain status information in the frontend.
- Contract tests for supported supply-chain functionality.

Actual blockchain availability and transaction execution depend on the configured network, deployed contracts, and application configuration.

### AI and Machine Learning
- **Crop Recommendation:** Python service and trained model for crop recommendations.
- **Price Prediction:** Python API for agricultural price predictions.
- **Model Performance:** Application views for model evaluation metrics.
- Supporting model artifacts and training resources.

Prediction availability depends on the corresponding service, model files, and configuration.

### Authentication and Backend
- Express and TypeScript backend.
- Authentication and role-based workspace access.
- API routes for products, blockchain operations, predictions, and model performance.
- MongoDB/Mongoose integration with fallback handling for database connectivity issues.
- Health-check endpoint for backend availability.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling and Icons | Tailwind CSS, Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Blockchain | Solidity, OpenZeppelin, ethers.js |
| Contract Development | solc, Ganache |
| Machine Learning | Python, trained prediction models |
| QR Functionality | qrcode.react, html5-qrcode |
| Testing | Node.js test runner, TypeScript |

## Project Structure

```text
.
├── backend/                 # Backend routes, services, and database integration
│   ├── data/                # Local application data, where applicable
│   └── routes/              # API route handlers
├── contracts/               # Solidity smart contracts
├── crop-recommendation/     # Crop recommendation service and model
├── price-api/               # Price prediction service and models
├── public/                  # Static assets
├── scripts/                 # Contract compilation and deployment scripts
├── src/
│   ├── components/
│   │   ├── admin/            # Administrator workspace
│   │   ├── common/           # Shared UI, navigation, and profile components
│   │   ├── consumer/         # Consumer workspace
│   │   ├── distributor/      # Distributor workspace
│   │   ├── farmer/           # Farmer workspace and agricultural tools
│   │   ├── public/           # Landing, login, registration, and verification pages
│   │   └── retailer/         # Retailer workspace
│   ├── context/              # Application, wallet, and farmer-language contexts
│   └── types/                # Shared TypeScript types
├── tests/                    # Backend and smart-contract tests
├── server.ts                 # Application server entry point
├── package.json
└── .env.example              # Example environment configuration
```

The structure above describes the principal project areas; individual files and available routes may evolve as development continues.

## Prerequisites

Install the following tools before setting up the project:

- Node.js and npm
- Git
- Python 3 for the machine-learning services
- A MongoDB connection if using database-backed functionality
- A compatible blockchain network and wallet configuration if testing blockchain features

## Installation

Clone the repository and install the Node.js dependencies:

```bash
git clone https://github.com/megha7karadi-dotcom/blockchainbased-agri-supply-chain.git
cd blockchainbased-agri-supply-chain
npm install
```

Create a local environment file from the example:

**PowerShell**

```powershell
Copy-Item .env.example .env
```

Review `.env.example` and configure the values required by your local setup. Environment variable names and service-specific settings should match the relevant backend, blockchain, and Python service configuration.

Never commit real secrets, API keys, database credentials, JWT secrets, or blockchain private keys.

## Run the Application

Start the main application in development mode:

```bash
npm run dev
```

The development server is configured for port `3000`. Open:

```text
http://localhost:3000
```

If the configured port is already occupied, check the server output for the actual listening address.

## Python Machine-Learning Services

The Python services are maintained separately from the main Node.js application:

- `crop-recommendation/`
- `price-api/`

For each service:

1. Open its directory.
2. Review its `requirements.txt`, `app.py`, and configuration.
3. Create and activate a Python virtual environment.
4. Install its dependencies.
5. Configure the required model paths and environment variables.
6. Start the service using its documented entry point.

Example commands, run from the relevant service directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The services may use different dependencies, ports, environment variables, and model files. Configure the frontend/backend API URLs to match the services running in your environment.

## Available npm Scripts

Run these commands from the repository root.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the main development server |
| `npm run build` | Build the frontend with Vite |
| `npm run preview` | Preview the Vite build |
| `npm run lint` | Run TypeScript checks using `tsc --noEmit` |
| `npm run compile:contracts` | Compile the Solidity contracts |
| `npm run deploy:contracts` | Run the contract deployment script |
| `npm run test:contracts` | Compile contracts and run contract tests |
| `npm run test:backend` | Run backend metadata persistence tests |
| `npm run test:validation` | Run the configured backend validation tests |
| `npm test` | Run the contract and backend test suites |

A successful TypeScript check does not replace browser testing, API testing, smart-contract testing, or verification that external services are running.

## API and Health Check

The Express server registers routes for authentication, products, blockchain operations, price prediction, and model performance.

The health endpoint is:

```http
GET /api/health
```

For endpoint-specific request bodies, responses, and authentication requirements, consult the route handlers under `backend/routes/` and the associated service implementation.

Some features require additional configuration or external services and may not work until those dependencies are running.

## Farmer Language Support

The farmer interface supports three languages:

- **English (`en`)**
- **Hindi (`hi`)**
- **Kannada (`kn`)**

The language selection is managed by `src/context/FarmerLanguageContext.tsx` and persisted in browser local storage under `agritrace-farmer-language`.

Farmer-facing pages use the shared language context and page-level translations. The profile page also uses the selected language for farmer accounts. Coverage of dynamic values, such as crop names and workflow statuses, depends on the translations available for each value.

This language setting is intended for the farmer experience; it does not automatically translate every workspace or every API response.

## Model Artifacts and Datasets

The repository includes trained model artifacts, evaluation outputs, and supporting training resources.

The large historical-weather dataset `price-api/agritrace_prices_with_historical_weather.csv` is intentionally excluded from GitHub because it exceeds GitHub's individual file size limit. Keep a local copy if your workflow requires it, or obtain it separately before reproducing training.

Python virtual environments, generated caches, and local runtime data should remain outside version control unless explicitly intended as project fixtures.

## Security and Local Data

- Keep secrets and credentials in local environment files.
- Never commit `.env` files containing real credentials.
- Protect database connection strings, JWT secrets, and blockchain private keys.
- Keep local runtime data such as `backend/data/agritrace_db.json` out of commits unless a reviewed, sanitized fixture is intentionally required.
- Confirm `.gitignore` covers local secrets, generated artifacts, and private application data.
- Review `git status` and staged changes before every commit.
- Validate authentication, access control, and service configuration before production deployment.

## Development Workflow

Before committing code:

```powershell
npm run lint
npm run build
git status
git diff --check
```

Run the relevant test suites for the areas you changed. If you modify smart contracts, run `npm run test:contracts`; for backend metadata persistence, run `npm run test:backend`.

Recommended contribution workflow:

1. Create a branch for your change.
2. Make the smallest relevant code and documentation changes.
3. Run the appropriate checks and tests.
4. Review staged files to ensure local data and secrets are excluded.
5. Commit and push the intended changes.
6. Open a pull request when review is needed.

## License

No license is currently specified in this README. Add a license file if you intend to define terms for reuse and distribution.
