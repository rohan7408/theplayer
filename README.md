# The Player - Modern Cinematic Streaming & Discovery Web App

A high-performance cinematic movie and TV series streaming and discovery web platform built with **Next.js 16 (App Router & Turbopack)**, **Tailwind CSS**, and **Lucide Icons**.

---

## ✨ Features

- 🎬 **Extensive Movie & TV Series Catalog**: Discover thousands of titles across Hollywood, Bollywood, South Indian cinema, and 14+ genres.
- ⚡ **Hero Carousel Billboard**: Smooth 3-second auto-play showcase with Ken Burns slow-zoom animations, touch swipe gestures, and trailer previews.
- 🍿 **Interactive Video Player**: Automated playback resume timestamp memory via local browser storage (`HTML5 LocalStorage`).
- 🔍 **Instant Search & Filter Bar**: Instant multi-criteria search modal (`Ctrl+K` / `Cmd+K`) and in-catalog filters.
- 📱 **Mobile-First Responsive Design**: Includes an ergonomic mobile bottom navigation bar and touch-friendly controls.
- 🛡️ **Intelligent Release Filtering**: Automatically filters out unreleased future titles from catalogs to guarantee smooth streaming availability.
- 🎨 **Cine-Red & Obsidian Dark Theme**: Glassmorphic styling with Google `Outfit` display typography and Lucide icons throughout.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or later
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Incroel/watchme.git
cd watchme
```

2. Install dependencies:
```bash
npm install
```

3. Configure Environment Variables:
Create a `.env.local` file in the root directory:
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19, Turbopack)
- **Styling**: Tailwind CSS v4, OKLCH Color Palette
- **Icons**: Lucide React
- **Typography**: Google Outfit & Geist Sans
- **State & Storage**: React Hook Form, HTML5 LocalStorage

---

## ⚖️ Disclaimer

The Player is developed solely as a personal, non-commercial portfolio project for educational demonstration. We do not host, store, or upload any multimedia files.
