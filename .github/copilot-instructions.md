<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project: Vite + Vue 3 Timesheet Application

This is a timesheet tracking and invoice generation application built with Vite, Vue 3, and Supabase.

### Key Technologies:

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Package Manager**: npm

### Data Structure (from existing migration):

- **Clients**: id, name, email, phone, address, city, province, postal_code (mandatory for projects)
- **Projects**: id, client_id, name, hourly_rate, status
- **TimeEntries**: id, project_id, date, hours, description
- **Invoices**: id, project_id, invoice_number, date, total_amount, items (time entries)

### Development Setup Checklist:

- [x] Create .github/copilot-instructions.md
- [x] Scaffold Vite + Vue 3 project
- [x] Install dependencies (npm install) - Ready, run from terminal
- [x] Set up Supabase integration - Environment variables configured
- [x] Create project structure (pages, components, stores)
- [x] Build and test configuration
- [x] Create development task (.vscode/tasks.json)

### Build and Run Commands:

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

### Project Structure:

```
src/
├── components/      # Reusable Vue components
├── pages/          # Page components
├── stores/         # Pinia state management
├── services/       # API and Supabase services
├── types/          # TypeScript types
├── App.vue         # Root component
└── main.ts         # Entry point
```

### Supabase Tables:

- `zoro_clients` - Client information
- `zoro_projects` - Project information linked to clients
- `zoro_time_entries` - Time tracking records
- `zoro_invoices` - Generated invoices

### Quick Start:

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a `.env.local` file from `.env.example`
   - Add your Supabase URL and anon key
   - Create the database tables (see README.md for SQL)

3. **Start Development Server**
   - Run the "npm run dev" task from VS Code
   - Open http://localhost:5173 in your browser

4. **Features Available**
   - Clients: Create and manage clients with contact information
   - Projects: Create and manage projects linked to clients
   - Time Entries: Log hours worked on projects
   - Invoices: Generate and save invoices from time entries

### Key Files:

- `src/main.ts` - Application entry point
- `src/App.vue` - Root component
- `src/services/supabase.ts` - Supabase service and API calls
- `src/stores/` - Pinia state management
- `src/pages/` - Page components (Projects, TimeSheet, Invoices)
- `.env.local` - Environment variables (create from .env.example)
