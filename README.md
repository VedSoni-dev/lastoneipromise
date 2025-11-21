# Vedant Soni - Portfolio Website

A modern, minimalist single-page portfolio website built with React and Vite. Optimized for Vercel deployment.

## 🚀 Features

- ⚡ Built with Vite for lightning-fast development
- ⚛️ React 18 single-page application
- 🎨 Clean white background with minimalist design
- 🃏 Animated CardSwap component with GSAP for showcasing projects
- 📱 Fully responsive with mobile-optimized scaling
- 🚢 Ready for Vercel deployment
- 🧩 Easy to integrate React component libraries

## 📁 Project Structure

```
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── CardSwap.jsx
│   │   └── CardSwap.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🎨 Customization

### Adding Content

Edit `src/App.jsx` to customize:
- **Headline**: Update the hero title and subtitle
- **Projects**: Add or modify `<Card>` components inside `<CardSwap>`
  - Each card can contain project name, description, images, or links
  - Cards automatically cycle through with smooth animations

### Adding React Components

You can easily add any React component library to this project:

```bash
# Example: Adding a UI library
npm install @radix-ui/react-icons
npm install lucide-react
npm install framer-motion
```

Then import and use them in your components:

```jsx
import { HomeIcon } from '@radix-ui/react-icons'

function MyComponent() {
  return <HomeIcon />
}
```

### Styling

- Global styles: `src/index.css`
- App styles: `src/App.css`
- Component-specific styles: Located next to each component/page

## 🚀 Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure everything
6. Click "Deploy"

### Option 3: Deploy with Vercel Button

Once your repo is on GitHub, you can add a deploy button to your README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)
```

## 📝 Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔧 Configuration

### Vercel Configuration

The `vercel.json` file is already configured for optimal deployment.

### Vite Configuration

The `vite.config.js` file contains the basic Vite configuration with React plugin. You can customize it further as needed.

## 🎨 Design Notes

- **Background**: Clean white (`#ffffff`)
- **Text**: Black (`#000000`)
- **Header**: VS initials in top right corner (positioned lower)
- **Layout**: Single-page with headline section and animated card stack
- **CardSwap Component**: 
  - Animated card cycling with GSAP
  - 3D perspective transforms
  - Elastic bounce animation
  - Pause on hover
  - Positioned in bottom right
- **Responsive**: Scales down appropriately on mobile devices

## 🤝 Contributing

This is a personal portfolio website. Feel free to fork and customize it for your own use!

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Next Steps

- Customize the content with your own information
- Add your projects and portfolio items
- Integrate any React component libraries you prefer
- Add animations and transitions
- Connect a contact form backend
- Add your own color scheme and branding

---

Built with ❤️ using React + Vite