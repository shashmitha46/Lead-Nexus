# Lead Nexus 

Lead Nexus is a powerful, modern, and AI-enhanced starter application for a lead management CRM. Built with a cutting-edge tech stack, it provides a solid foundation for managing buyer leads, tracking their progress through the sales funnel, and leveraging AI to streamline workflows.

## Features

- **Lead Management**: Create, view, edit, and manage buyer leads with a clean and intuitive interface.
- **Advanced Filtering & Searching**: Easily find leads with powerful search and filtering capabilities.
- **AI-Powered Tagging**: Automatically get tag suggestions for your leads based on your notes, powered by Genkit.
- **Bulk Import/Export**: Import leads from a CSV file and export your lead data with customizable fields.
- **Lead History**: Track all changes made to a lead, providing a clear audit trail.
- **Responsive Design**: A fully responsive UI that works seamlessly on desktop and mobile devices.
- **Modern Tech Stack**: Built with Next.js App Router, React Server Components, ShadCN UI, and Tailwind CSS.
- **Collapsible Sidebar**: A sleek, collapsible navigation to maximize screen real estate.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install the project dependencies:**
    ```bash
    npm install
    ```

### Running the Development Server

The application consists of two main parts: the Next.js frontend and the Genkit AI flows. You'll need to run both concurrently in separate terminal windows.

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application in development mode with Turbopack. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

2.  **Start the Genkit development server:**
    In a new terminal window, run the following command:
    ```bash
    npm run genkit:watch
    ```
    This starts the Genkit development server and watches for any changes to your AI flows, making them available to the frontend.

## Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors and style issues.
- `npm run genkit:watch`: Starts the Genkit development server in watch mode.

## Building for Production

To create a production build, run:
```bash
npm run build
```

And to start the production server:
```bash
npm run start
```
