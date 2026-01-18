# 🥬 PachaMama Dashboard

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D9.0.0-blue)](https://www.npmjs.com/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4+-teal)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A modern, fully-featured dashboard management system for vegetable delivery businesses. Built with React, TypeScript, Vite, and Tailwind CSS.

**Live Demo** | [Documentation](./src/assets/private/TUTORIAL_INTEGRACION.md) | [Installation Guide](./src/assets/private/README_INSTALACION.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Available Screens](#-available-screens)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Scripts & Commands](#-scripts--commands)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)
- [Credits](#-credits)

---

## ✨ Features

### Core Functionality

- 📊 **Real-time Dashboard** - Overview with KPIs, revenue graphs, and recent orders
- 🛒 **Order Management** - Complete order handling with search, filters, and status tracking
- 👥 **Client Directory** - Customer management with contact information and history
- 🥬 **Product Inventory** - Stock management with pricing and availability
- 💰 **Financial Analytics** - Income, expenses, and profitability analysis
- ⚙️ **Configuration Panel** - System and business settings

### UI/UX Features

- ✅ Responsive sidebar navigation (mobile & desktop)
- ✅ Interactive charts and visualizations (Recharts)
- ✅ Toast notification system (Sonner)
- ✅ Advanced search and filtering capabilities
- ✅ Modern design with Tailwind CSS v4
- ✅ Beautiful icons (Lucide React)
- ✅ Accessible components (Radix UI)
- ✅ Dark mode support ready
- ✅ Keyboard navigation support

### Data & Performance

- ✅ Mock data for immediate demonstration
- ✅ Realistic sample data (24 orders, 156 clients, 20 products)
- ✅ Optimized bundle size with Vite
- ✅ Fast Refresh enabled (HMR)
- ✅ ESLint configured for code quality

---

## 🎯 Tech Stack

| Technology       | Purpose              | Version |
| ---------------- | -------------------- | ------- |
| **React**        | UI Framework         | 18+     |
| **Vite**         | Build Tool           | 5+      |
| **TypeScript**   | Type Safety          | Latest  |
| **Tailwind CSS** | Styling              | 4+      |
| **Recharts**     | Data Visualization   | Latest  |
| **Radix UI**     | Component Primitives | Latest  |
| **Lucide React** | Icons                | Latest  |
| **Sonner**       | Toast Notifications  | Latest  |
| **ESLint**       | Code Linting         | Latest  |

---

## 🔧 System Requirements

- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 9.0.0 (or yarn, pnpm)
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Operating System**: Windows, macOS, or Linux

---

## 📥 Installation

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd PachaMama-Project
```

### Step 2: Install Dependencies

#### Option A: Quick Install (Automatic Script)

**For Linux/macOS:**

```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

**For Windows (PowerShell):**

```powershell
.\install-dependencies.ps1
```

#### Option B: Manual Installation

```bash
# Install main dependencies
npm install recharts lucide-react sonner

# Install Radix UI components
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio @radix-ui/react-avatar \
  @radix-ui/react-checkbox @radix-ui/react-collapsible \
  @radix-ui/react-context-menu @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-hover-card \
  @radix-ui/react-label @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs \
  @radix-ui/react-toggle @radix-ui/react-toggle-group \
  @radix-ui/react-tooltip

# Install utility libraries
npm install class-variance-authority clsx tailwind-merge

# Install development dependencies (Tailwind CSS v4)
npm install -D @vitejs/plugin-react-swc tailwindcss@latest @tailwindcss/vite@latest
```

### Step 3: Verify Installation

```bash
npm list react vite tailwindcss
```

---

## 🚀 Quick Start

```bash
# Development server
npm run dev

# The app will be available at http://localhost:5173
```

Open your browser and navigate to the displayed URL. You'll see the dashboard with sample data ready to use.

---

## 📁 Project Structure

```
PachaMama-Project/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── screens/                    # Dashboard screens
│   │   │   │   ├── DashboardScreen.tsx     # Main dashboard with KPIs
│   │   │   │   ├── PedidosScreen.tsx       # Order management
│   │   │   │   ├── ClientesScreen.tsx      # Client directory
│   │   │   │   ├── ProductosScreen.tsx     # Product inventory
│   │   │   │   ├── FinanzasScreen.tsx      # Financial analytics
│   │   │   │   └── ConfiguracionScreen.tsx # Settings panel
│   │   │   ├── ui/                         # Reusable UI components
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   └── utils.ts
│   │   │   └── Sidebar.tsx                 # Navigation sidebar
│   │   ├── App.tsx                         # Main application component
│   │   └── styles/
│   │       ├── index.css                   # Entry styles
│   │       ├── tailwind.css                # Tailwind configuration
│   │       └── theme.css                   # Custom theme variables
│   ├── main.jsx                            # Application entry point
│   └── assets/
│       └── private/
│           ├── README_INSTALACION.md       # Spanish installation guide
│           ├── TUTORIAL_INTEGRACION.md     # Spanish integration tutorial
│           └── DEPENDENCIAS.md             # Detailed dependencies
├── public/                                 # Static assets
├── vite.config.js                          # Vite configuration
├── tailwind.config.js                      # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript configuration
├── eslint.config.js                        # ESLint configuration
└── package.json                            # Project dependencies
```

---

## 📺 Available Screens

### 1. Dashboard

- **Overview metrics** (total revenue, pending orders, clients)
- **Revenue charts** (weekly/monthly trends)
- **Recent orders feed**
- **Quick statistics widgets**

### 2. Pedidos (Orders)

- Order list with pagination
- Advanced search functionality
- Status filtering (pending, completed, cancelled)
- Order details and history
- Export capabilities

### 3. Clientes (Clients)

- Complete client directory
- Contact information management
- Order history per client
- Client statistics
- Search and sort features

### 4. Productos (Products)

- Product inventory listing
- Stock quantity management
- Pricing information
- Product categories
- Availability status

### 5. Finanzas (Finances)

- Revenue analysis
- Expense tracking
- Profit calculations
- Income vs. expense charts
- Period-based comparisons

### 6. Configuración (Settings)

- User profile management
- Business settings
- System preferences
- Theme customization
- Notification settings

---

## ⚙️ Configuration

### Vite Configuration

The project uses an optimized Vite setup with path alias support:

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Tailwind CSS v4

Tailwind CSS v4 is configured with custom theme variables in `src/styles/theme.css`:

```css
:root {
  --primary: #10b981; /* PachaMama Green */
  --background: #ffffff;
  --foreground: #030213;
  /* ... more colors */
}
```

---

## 🎨 Customization

### Changing Theme Colors

Edit `src/styles/theme.css` to customize colors:

```css
:root {
  --primary: #10b981; /* Change primary color */
  --chart-1: #10b981; /* Change chart colors */
  --destructive: #d4183d; /* Change destructive actions */
  /* ... modify other colors */
}
```

### Adding New Screens

1. Create a new component in `src/app/components/screens/YourScreen.tsx`
2. Add an import in `src/app/App.tsx`
3. Add a case in the navigation switch statement
4. Add menu item in `src/app/components/Sidebar.tsx`

Example:

```typescript
// src/app/components/screens/ReportsScreen.tsx
export function ReportsScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Reports</h1>
      {/* Your content */}
    </div>
  );
}
```

### Modifying Components

All UI components are located in `src/app/components/ui/` and can be customized to match your needs.

---

## 🔄 Scripts & Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

---

## 🚨 Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution:** Verify the alias is configured in `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

### Issue: Tailwind CSS styles not applying

**Solutions:**

1. Ensure `@tailwindcss/vite` is in the plugins array in `vite.config.js`
2. Verify `src/styles/index.css` is imported in `src/main.jsx`
3. Check that all CSS files are correctly linked in the cascade

### Issue: Components not found

**Solution:** Verify all files from `src/app/components/ui/` have been copied to your project.

### Issue: Port 5173 already in use

**Solution:** Specify a different port:

```bash
npm run dev -- --port 3000
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For detailed guides and tutorials:

- [Installation Guide](./src/assets/private/README_INSTALACION.md) (Spanish)
- [Integration Tutorial](./src/assets/private/TUTORIAL_INTEGRACION.md) (Spanish)
- [Dependencies List](./src/assets/private/DEPENDENCIAS.md) (Spanish)

For issues and questions:

- Open an issue on GitHub
- Check existing documentation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Credits & Acknowledgments

**Built with amazing technologies:**

- [React Team](https://react.dev/) - React 18
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind Labs](https://tailwindcss.com/) - Tailwind CSS v4
- [Recharts Team](https://recharts.org/) - React charting library
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

**Special thanks** to all contributors and the open-source community.

---

## 🌟 Next Steps

After setting up, consider:

1. **Connect to Backend** - Replace mock data with real API calls
2. **Implement Authentication** - Add user login/logout system
3. **Database Integration** - Connect to Supabase, Firebase, or your preferred DB
4. **WhatsApp Integration** - Enable automated delivery list sharing
5. **PDF Reports** - Generate downloadable business reports
6. **Push Notifications** - Add real-time alerts and updates
7. **Mobile Optimization** - Further improve mobile experience
8. **Performance Monitoring** - Integrate analytics and error tracking

---

**Made with 💚 for PachaMama**

🥬 Growing better business management | Delivering fresh solutions
