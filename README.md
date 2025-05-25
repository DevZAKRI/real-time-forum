# Real-Time Forum

A modern, real-time forum application built with Go and JavaScript, featuring live chat, post management, and user interactions.

## Features

### Authentication
- User registration with profile details
- Secure login/logout functionality
- Session management
- Password encryption

### Posts and Interactions
- Create, read posts
- Categorize posts (General, Tech, Sports, Health, Education)
- Like/dislike posts
- Comment on posts
- Filter posts by categories
- View personal posts and liked posts

### Real-Time Features
- Live chat between users
- Online/offline user status
- Real-time notifications
- WebSocket-based communication

### User Interface
- Modern, responsive design
- Dark theme
- User-friendly navigation
- Dynamic content loading
- Notification system

## Technology Stack

### Backend
- Go 1.23.5
- SQLite3 database
- Gorilla WebSocket for real-time communication
- UUID for session management
- Bcrypt for password hashing

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- WebSocket API
- Font Awesome for icons

## Project Structure

```
.
├── app/
│   ├── api/         # API endpoints
│   ├── config/      # Configuration
│   ├── handlers/    # Request handlers
│   ├── models/      # Data models
│   └── utils/       # Utility functions
├── static/
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript modules
│   └── img/         # Images
├── templates/       # HTML templates
└── logs/           # Application logs
```

## Prerequisites

- Go 1.23.5 or higher
- SQLite3
- Modern web browser with JavaScript enabled

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd real-time-forum
   ```

2. Install Go dependencies:
   ```bash
   go mod download
   ```

3. Build and run the application:
   ```bash
   go run main.go
   ```

4. Access the application:
   Open your web browser and navigate to `http://localhost:8080`

## Features in Detail

### Authentication System
- Secure password hashing using bcrypt
- Session-based authentication
- Token-based WebSocket authentication
- Form validation for registration

### Post Management
- Rich text content support
- Multi-category selection
- Post filtering system
- Pagination support

### Real-Time Chat
- Private messaging between users
- Online status indicators
- Message history
- Real-time message delivery

### User Interface
- Responsive design for all screen sizes
- Intuitive navigation
- Dynamic content loading
- Toast notifications for user feedback

## Security Features

- Password encryption
- Session management
- CSRF protection
- Input validation
- Secure WebSocket connections

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Font Awesome for icons
- Go community for excellent packages
- Contributors and testers 
- mzakri && afethi