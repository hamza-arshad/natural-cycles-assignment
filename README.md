# Natural-Cycles-Assignment

This is a Node.js application built using TypeScript, Express.js, MongoDB, and Braintree for handling subscriptions, and payments.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Atlas)
- [Braintree Sandbox Account](https://sandbox.braintreegateway.com/) for payment processing

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install the dependencies

```bash
npm install
```

### 3. Create a .env file similar to the .example.env file

```bash
PORT=''
MONGO_URI=''
SECRET_KEY='' ## Random Secret for Express-Session
MERCHANT_ID=''
BRAINTREE_PUBLIC_KEY=''
BRAINTREE_PRIVATE_KEY=''
BRAINTREE_TOKEN=''  ## BrainTree Client Token
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Build the application for production

```bash
npm run build
npm run start
```