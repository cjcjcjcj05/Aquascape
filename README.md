# AquaDesign - Aquascaping Design Platform

AquaDesign is an advanced aquascaping design platform that enables users to create, visualize, and share custom aquarium layouts with AI-assisted asset generation and intuitive design tools.

## Features

- Interactive drag-and-drop interface for aquascape design
- Comprehensive asset library with plants, hardscape, fish, and substrates
- User account system with saved designs
- Responsive design for desktop and mobile devices
- Advanced substrate and elevation control
- Realistic rendering of aquarium elements

## Technologies Used

- React frontend with TypeScript
- Express.js backend
- PostgreSQL database with Drizzle ORM
- Authentication with Passport.js
- Styling with TailwindCSS and shadcn/ui components
- Drag-and-drop functionality with react-dnd
- Canvas rendering with react-konva

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/aquadesign.git
   cd aquadesign
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/aquadesign
   SESSION_SECRET=your_session_secret
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Development Roadmap

- [x] Authentication system
- [x] Basic canvas and design interface
- [x] Asset library implementation
- [ ] Community sharing features
- [ ] Export designs to image/PDF
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.