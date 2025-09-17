# Lead Nexus - A Next.js CRM Starter

This is a starter application for a lead management CRM built with Next.js, ShadCN, Tailwind CSS, and Genkit for AI features.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

First, install the project dependencies using npm:

```bash
npm install
```

### Running the Development Server

Once the dependencies are installed, you can start the development server:

```bash
npm run dev
```

This will start the Next.js application in development mode with Turbopack for faster performance.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app also includes Genkit for AI-powered features. To run the Genkit flows in development, use the following command in a separate terminal:

```bash
npm run genkit:watch
```

This will start the Genkit development server and watch for any changes to your flows.

### Building for Production

To create a production build, run:

```bash
npm run build
```

And to start the production server:

```bash
npm run start
```
