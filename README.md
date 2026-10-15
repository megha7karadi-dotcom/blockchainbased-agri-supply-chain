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
