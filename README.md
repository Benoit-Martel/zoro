# Timesheet Tracker

A Vue 3 + Vite application for tracking project hours and generating invoices. Built with TypeScript, Tailwind CSS, and Supabase for backend storage.

## Features

- ✅ **Client Management**: Create and manage clients with contact information
- ✅ **Project Management**: Create and manage projects linked to clients with hourly rates
- ✅ **Time Tracking**: Log hours worked on projects with descriptions
- ✅ **Invoice Generation**: Generate invoices from logged time entries
- ✅ **Data Persistence**: All data stored in Supabase
- ✅ **Real-time Sync**: Instant updates across the application

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Package Manager**: npm

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── Header.vue      # Application header
│   └── Navigation.vue  # Navigation bar
├── pages/              # Page components
│   ├── Clients.vue     # Client management page
│   ├── Projects.vue    # Projects management page
│   ├── TimeSheet.vue   # Time entry logging page
│   └── Invoices.vue    # Invoice generation page
├── stores/             # Pinia stores
│   ├── clientStore.ts    # Client state management
│   ├── projectStore.ts   # Project state management
│   └── timeEntryStore.ts # Time entry state management
├── services/           # API services
│   └── supabase.ts     # Supabase service
├── types/              # TypeScript types
│   └── index.ts        # Shared types
├── App.vue             # Root component
├── main.ts             # Application entry point
├── style.css           # Global styles
└── vite-env.d.ts       # Vite environment types
```

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Setup Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a new project in [Supabase](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file in the root directory:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Create Database Tables**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Clients table
   CREATE TABLE zoro_clients (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255),
     phone VARCHAR(20),
     address VARCHAR(255),
     city VARCHAR(100),
     province VARCHAR(100),
     postal_code VARCHAR(20),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_clients_name ON zoro_clients(name);

   -- Contacts table
   CREATE TABLE zoro_contacts (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     client_id UUID NOT NULL REFERENCES zoro_clients(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255),
     phone VARCHAR(20),
     position VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_contacts_client_id ON zoro_contacts(client_id);

   -- Projects table
   CREATE TABLE zoro_projects (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     client_id UUID NOT NULL REFERENCES zoro_clients(id) ON DELETE RESTRICT,
     contact_id UUID REFERENCES zoro_contacts(id) ON DELETE SET NULL,
     name VARCHAR(255) NOT NULL,
     hourly_rate DECIMAL(10, 2) NOT NULL,
     status VARCHAR(50) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_projects_client_id ON zoro_projects(client_id);

   -- Project Steps table
   CREATE TABLE zoro_project_steps (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     project_id UUID NOT NULL REFERENCES zoro_projects(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     status VARCHAR(50) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_project_steps_project_id ON zoro_project_steps(project_id);

   -- Time Entries table
   CREATE TABLE zoro_time_entries (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     project_id UUID NOT NULL REFERENCES zoro_projects(id) ON DELETE CASCADE,
     step_id UUID REFERENCES zoro_project_steps(id) ON DELETE SET NULL,
     service_id UUID REFERENCES zoro_services(id) ON DELETE SET NULL,
     date DATE NOT NULL,
     hours DECIMAL(5, 2) NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_time_entries_project ON zoro_time_entries(project_id);
   CREATE INDEX idx_zoro_time_entries_date ON zoro_time_entries(date);
   CREATE INDEX idx_zoro_time_entries_service ON zoro_time_entries(service_id);

   -- Invoices table
   CREATE TABLE zoro_invoices (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     project_id UUID NOT NULL REFERENCES zoro_projects(id),
     invoice_number VARCHAR(255) NOT NULL UNIQUE,
     date DATE NOT NULL,
     total_amount DECIMAL(12, 2) NOT NULL,
     status VARCHAR(50) DEFAULT 'draft',
     items JSONB DEFAULT '[]'::jsonb,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_invoices_project ON zoro_invoices(project_id);

   -- Services table
   CREATE TABLE zoro_services (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name VARCHAR(255) NOT NULL UNIQUE,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_services_name ON zoro_services(name);

   -- Invoice Items table
   CREATE TABLE zoro_invoice_items (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     invoice_id UUID NOT NULL REFERENCES zoro_invoices(id) ON DELETE CASCADE,
     time_entry_id UUID REFERENCES zoro_time_entries(id) ON DELETE SET NULL,
     description TEXT NOT NULL,
     quantity DECIMAL(10, 2) NOT NULL,
     unit_price DECIMAL(10, 2) NOT NULL,
     subtotal DECIMAL(12, 2) NOT NULL,
     service_id UUID REFERENCES zoro_services(id) ON DELETE SET NULL,
     tax_1_name VARCHAR(100),
     tax_1_amount DECIMAL(12, 2) DEFAULT 0,
     tax_2_name VARCHAR(100),
     tax_2_amount DECIMAL(12, 2) DEFAULT 0,
     discount_amount DECIMAL(12, 2) DEFAULT 0,
     line_total DECIMAL(12, 2) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_zoro_invoice_items_invoice_id ON zoro_invoice_items(invoice_id);
   CREATE INDEX idx_zoro_invoice_items_time_entry_id ON zoro_invoice_items(time_entry_id);
   CREATE INDEX idx_zoro_invoice_items_service_id ON zoro_invoice_items(service_id);
   ```

4. **Enable RLS (Row Level Security)** (Optional but Recommended)

   For public access (development), you can skip this. For production, set up proper RLS policies.

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Managing Clients

1. Navigate to the **Clients** page (first tab)
2. Click "New Client" to create a new client
3. Enter client name and optional contact details (email, phone, address, etc.)
4. Click "Create Client"

### Managing Projects

1. Navigate to the **Projects** page
2. Click "New Project" to create a new project
3. Select a client from the dropdown (mandatory)
4. Enter project name, hourly rate, and status
5. Click "Create Project"
6. Projects are now linked to clients

### Logging Time

1. Go to the **Time Entries** page
2. Click "Log Hours" to create a new entry
3. Select a project, date, hours worked, and description
4. Click "Log Hours"
5. View all logged entries in the table below

### Generating Invoices

1. Navigate to the **Invoices** page
2. Select a project and optional date range
3. Enter an invoice number
4. Click "Generate Invoice" to preview
5. Review the invoice and click "Save Invoice" to store it
6. View all saved invoices in the table below

### Managing Invoice Details

1. Click on an invoice to view its details page
2. Track invoice status: **Draft** (Brouillon), **Sent** (Envoyée), **Paid** (Payée)
3. Update the status from the dropdown menu
4. Click **"Importer heures"** (Import Hours) to add time entries to the invoice:
   - Select a date range or import all available hours
   - Optionally exclude hours already linked to other invoices (prevents double billing)
   - Preview available entries before importing
   - Confirm to add entries to the invoice
5. Imported time entries are automatically grouped by service in the invoice display
6. Review calculations including taxes (TPS 5%, TVQ 9.975%)
7. Print or close the invoice

## Data Migration

If you're migrating from another service:

1. Export your data (projects, time entries, invoices)
2. Transform the data to match the schema above
3. Use Supabase's import tools or write a migration script
4. Verify data integrity in the application

## Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

See `.env.example` for template.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Dependencies Installation Issues

If you encounter permission errors during installation:

```bash
npm install --no-optional
```

### Supabase Connection Issues

1. Verify your API keys are correct in `.env.local`
2. Check that your Supabase project is active
3. Ensure table names match exactly
4. Check browser console for detailed error messages

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port.

## Performance Tips

- Use the project filter on the Time Entries page to reduce data loading
- The app caches project data in Pinia for faster access
- Invoices are generated on-demand and can be saved for later reference

## Contributing

To contribute improvements:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions:

- Check the troubleshooting section above
- Review your Supabase database configuration
- Check browser console for error messages

## Future Enhancements

- [ ] User authentication
- [ ] PDF invoice export
- [ ] Bulk time entry import
- [ ] Recurring invoices
- [ ] Client management
- [ ] Tax calculations
- [ ] Payment tracking
- [ ] Reports and analytics
