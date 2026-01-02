# Wolt Incident Reporter

A web application for restaurant workers to report Wolt delivery incidents and for managers to review and manage them.

## Features

### For Workers
- Simple form to submit incident reports
- Upload screenshots of Wolt chat conversations
- Password-protected access
- Worker name remembered via cookies

### For Managers
- Dashboard to view all incidents
- Filter by date range, category, and status
- Update incident status (pending, resolved, dealt with, escalation)
- View detailed incident information including screenshots

## Installation

1. Install dependencies:
```bash
npm install
```

**Note:** If you encounter DNS resolution errors (EAI_AGAIN) during installation, use:
```bash
NODE_OPTIONS="--dns-result-order=ipv4first" npm install
```

Or use the helper script:
```bash
npm run install-fix
```

2. Configure passwords in `config.js` or set environment variables:
   - `WORKER_PASSWORD` - Password for worker access
   - `MANAGER_PASSWORD` - Password for manager access
   - `SESSION_SECRET` - Secret for session management

3. Start the server:
```bash
npm start
```

4. Access the application:
   - Worker form: http://localhost:3001/worker
   - Manager dashboard: http://localhost:3001/manager

## Default Passwords

- Worker: `alon` (configured in config.js)
- Manager: `levy` (configured in config.js)

**Important:** Change these passwords in production!

## Project Structure

```
GustoWoltReporter/
├── server.js                 # Main Express server
├── config.js                 # Configuration
├── database/
│   └── init.js               # Database initialization
├── routes/
│   ├── worker.js             # Worker routes
│   ├── manager.js            # Manager routes
│   └── api.js                # API endpoints
├── middleware/
│   └── auth.js               # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css         # Styles
│   ├── js/
│   │   ├── worker.js         # Worker form logic
│   │   └── manager.js         # Manager dashboard logic
│   └── uploads/              # Uploaded screenshots
└── views/
    ├── worker-form.html      # Worker form
    ├── manager-dashboard.html # Manager dashboard
    └── login.html            # Login page
```

## Database

The application uses SQLite to store incident data. The database file is created automatically at `database/incidents.db`.

## Security Notes

- Change default passwords before deploying to production
- Use environment variables for sensitive configuration
- Consider using HTTPS in production
- Implement rate limiting for production use
- Regularly backup the database file

## License

ISC

