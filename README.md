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

### ▶️ Start Backend:
```bash
cd backend
python app.py
```
Or if using FastAPI:
```bash
uvicorn main:app --reload
```

### ▶️ Start Frontend:
```bash
npm run dev
```

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

