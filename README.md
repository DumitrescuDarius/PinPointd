# Travel Spots

A modern web application for discovering and sharing interesting places around the world. Users can view locations on an interactive map, add new places, and leave reviews.

## Features

- Interactive map with location markers
- Add new locations with descriptions and photos
- View detailed information about each location
- Leave reviews and ratings
- Browse featured locations
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Mapbox account and access token

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-spots
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Mapbox access token:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Material-UI
- Mapbox GL JS
- React Router
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 