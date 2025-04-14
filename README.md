# 🎓 Virtual Classroom Focus Tracker Extension

This browser extension enables a virtual classroom where teachers can create meetings, students can join, and a focus tracking system monitors student engagement using MediaPipe's face mesh. It features a teacher dashboard to track student focus and a student dashboard for self-monitoring.

---

## 🧰 Features

### 👩‍🏫 Teacher Functionality:
- Create and manage virtual meetings within the browser.
- View a dashboard displaying real-time focus status of all students.

### 🧑‍🎓 Student Functionality:
- Join meetings via a shared meeting ID.
- Access a dashboard to view their video feed and focus status.

### 👁️ Focus Tracking:
- Utilizes MediaPipe's face mesh to detect facial landmarks.
- Calculates focus based on eye and iris positions using:

```javascript
const LEFT_EYE_INDICES = [33, 133, 159, 145, 153, 144, 160, 161];
const RIGHT_EYE_INDICES = [263, 362, 386, 374, 380, 373, 387, 388];
const LEFT_IRIS_INDICES = [468, 469, 470, 471];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476];
const FACE_KEY_LANDMARKS = {
  noseTip: 1,
  chin: 152,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftMouth: 61,
  rightMouth: 291,
};
```
- Sends focus data to the teacher dashboard periodically.

---

## 🧱 Tech Stack
- **Frontend:** React, WXT (WebExtension framework)
- **Backend:** Python (Flask/FastAPI), MediaPipe
- **Communication:** WebRTC (video), WebSocket (focus data)
- **Browser Support:** Chrome, Firefox, Edge

---

## 🔧 Installation

### 📦 Prerequisites:
- Node.js (v18+)
- Python (v3.8+)
- Chrome or Firefox

### 📂 Clone the Repository:
```bash
git clone https://github.com/your-repo/classroom-focus-extension.git
cd classroom-focus-extension
```

### 📁 Install Frontend Dependencies:
```bash
npm install
```

### 🐍 Install Backend Dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### ⚙️ Set Up Environment:
Create a `.env` file:
```
BACKEND_URL=http://localhost:5000
WEBSOCKET_URL=ws://localhost:5000/ws
```

Update `wxt.config.ts` with:
```json
"permissions": ["activeTab", "storage", "webNavigation"],
"host_permissions": ["<BACKEND_URL>/*"],
"optional_permissions": ["camera", "microphone"]
```

---

## 🚀 Running the App

### 🔧 Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL (v14+)
- Chrome or Firefox

### 📁 Project Structure
```
intellicode_AMUHACKS4.0/
├── backend/                # Django backend
│   ├── src/               # Source code
│   │   ├── meeting_room/  # Main app
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── serializers.py
│   │   └── config.py      # Configuration
│   └── manage.py          # Django management
├── entrypoints/           # Frontend
│   └── popup/            # React + TypeScript
│       ├── src/          # Source code
│       │   ├── components/
│       │   └── html/     # HTML templates
│       └── package.json
└── assets/               # Static assets
    └── screenshots/      # Application screenshots
```

### 🐍 Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Apply database migrations:
```bash
python manage.py migrate
```

6. Create superuser (optional):
```bash
python manage.py createsuperuser
```

7. Run the backend server:
```bash
python manage.py runserver
```

### 📦 Frontend Setup
1. Navigate to frontend directory:
```bash
cd entrypoints/popup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### ⚙️ Extension Setup
1. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `entrypoints/popup/dist` folder

2. Load the extension in Firefox:
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on" and select any file from the `entrypoints/popup/dist` folder

### 📝 Configuration
1. Backend Configuration:
   - Edit `backend/.env`:
   ```
   DEBUG=True
   SECRET_KEY=your_secret_key
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ORIGIN_WHITELIST=http://localhost:5173
   ```

2. Frontend Configuration:
   - Edit `entrypoints/popup/.env`:
   ```
   VITE_BACKEND_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   ```

### 🎯 Running in Production
1. Backend:
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

2. Frontend:
```bash
# Build for production
npm run build

# Serve the static files
python -m http.server 5173 --directory dist
```

### 🛠️ Development Tips
1. Hot Reload:
   - Backend: Use `python manage.py runserver --noreload`
   - Frontend: Use `npm run dev`

2. Debugging:
   - Backend: Use Django's built-in debugger
   - Frontend: Use Chrome DevTools

3. Testing:
   - Backend: Use Django's test framework
   - Frontend: Use Jest and React Testing Library

---

## 🧪 Testing the Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `dist/` folder.
4. Open popup and begin interacting with the extension.

---

## 🎓 Usage Guide

### 👩‍🏫 Teacher:
- Log in as a teacher via popup.
- Create a meeting to get a unique ID.
- Share the ID with students.
- Monitor all student focus scores in real-time.

### 🧑‍🎓 Student:
- Log in as a student.
- Enter the meeting ID to join.
- Monitor your own focus status on the dashboard.

---

## 👁️ Focus Calculation Logic

### 🎯 Process:
1. Captures webcam stream using `getUserMedia`.
2. Sends frames to backend.
3. MediaPipe analyzes eye and iris positions.
4. Focus score (0–100) is computed every 5 seconds based on:
   - Iris displacement (gaze direction)
   - Head orientation (nose tip, chin)
5. Score is sent via WebSocket to the teacher.

---

## 🗂️ Project Structure
```
classroom-focus-extension/
├── backend/
│   ├── app.py              # Python backend (Flask/FastAPI)
│   ├── focus.py            # Focus calculation logic
│   ├── mediapipe_utils.py  # MediaPipe integration
│   └── requirements.txt
├── src/
│   ├── components/         # React components
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── VideoStream.tsx
│   ├── entrypoints/
│   │   ├── popup.tsx       # Extension popup
│   │   └── content.ts      # Content scripts (if needed)
│   ├── assets/             # Static files (icons, styles)
│   └── utils/
│       ├── webrtc.ts       # WebRTC setup
│       └── websocket.ts    # WebSocket client
├── public/                 # WXT public assets
├── wxt.config.ts           # WXT configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## ☁️ Deployment

### 🌐 Extension:
```bash
npm run build
```
- Zip `dist/` folder for Chrome Web Store.
- Follow [WXT Publishing Guide](https://wxt.dev/docs/publish/).

### 🖥️ Backend:
- Deploy to Render, Heroku, or AWS.
- Enable HTTPS and secure WebSockets (wss://).

---

## ⚠️ Known Limitations
- Camera permissions are essential (may disrupt UX).
- MediaPipe performance may vary on low-end devices.
- Browser APIs restrict certain background processes.
- Accuracy is affected by lighting, webcam quality, and posture.

---

## 🌱 Future Improvements
- Run MediaPipe on client for performance boost.
- Add user authentication.
- Enable session analytics and historical data.
- Improve UI/UX with graphs, interactivity.

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push the branch: `git push origin feature-name`
5. Open a Pull Request 🙌
