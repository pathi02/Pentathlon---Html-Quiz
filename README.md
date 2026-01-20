# HTML Fill-in-the-Blanks Quiz

A full-stack quiz web application built with Next.js that challenges users to fill in HTML code blanks.

## Features

- **Monaco Editor Integration**: Real code-editor feel with live preview
- **Timer**: 30-minute countdown with auto-submit
- **Live Updates**: Answers update the HTML preview in real-time
- **Check & Submit**: Check answers without locking, submit to finalize
- **Server-Side Grading**: Answers are never exposed to the client
- **Results Breakdown**: Detailed per-blank scoring and feedback

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /api
    /check/route.js      # Check answers endpoint
    /submit/route.js     # Submit quiz endpoint
  /quiz
    page.jsx             # Quiz interface with Monaco editor
    page.module.css      # Quiz styles
  page.jsx               # Start screen
  page.module.css        # Start screen styles
/lib
  quiz.js                # Quiz configuration (server-side only)
```

## How It Works

1. **Start Screen**: Enter your name (optional) and click "Start Quiz"
2. **Quiz Screen**: 
   - Left side shows HTML preview with placeholders
   - Right side has input fields for each blank
   - Timer counts down from 30 minutes
   - Use "Check" to see correctness without locking
   - Use "Submit" to finalize and lock the quiz
3. **Results**: View your score and per-blank breakdown

## Admin Features

- **Admin Login**: Click the "Login" button in the top right to access admin features
- **Default Password**: `admin123` (set via `ADMIN_PASSWORD` environment variable in production)
- **Manage Quiz**: Edit HTML template, blanks, points, and duration
- **View Scores**: See all team submissions with rankings and statistics

### Admin Dashboard

Access `/admin/login` or click the Login button to:
- View all quiz submissions with scores and rankings
- See statistics (total submissions, average score, highest score)
- Edit quiz configuration (HTML template, blanks, points, etc.)
- Update quiz settings in real-time

## Security

- Answer keys are stored only in `/lib/quiz.js` and `/data/quiz.json` (server-side)
- Client never receives correct answers
- API routes handle all grading logic
- Tokens prevent duplicate submissions
- Admin password authentication (change default in production)

## Environment Variables

- `ADMIN_PASSWORD`: Set admin login password (default: `admin123`)

## License

MIT


