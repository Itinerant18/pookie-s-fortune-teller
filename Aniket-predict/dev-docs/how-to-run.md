# How to Run the Hybrid Prediction Application

This guide details how to start all components of the Hybrid Prediction App ecosystem: the Supabase Database, ML Engine (Python), Backend (Node.js), Web App (React), and Mobile App (React Native).

## 1. Prerequisites

Ensure you have the following installed:

- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** (or use the provided Supabase project)
- **Redis** (for ML Engine caching)
- **Expo Go** (on your physical mobile device) or an Android/iOS Emulator

---

## 2. Database Setup (Supabase)

Before starting any services, ensure your database schema is up to date.

1.  Navigate to your Supabase Project Dashboard -> SQL Editor.
2.  Open the file `c:/Aniket/supabase/schema.sql` on your local machine.
3.  Copy the **entire content** of `schema.sql`.
4.  Paste it into the Supabase SQL Editor and click **Run**.
    - _Note: The script is idempotent. If you see "Success" or "No rows returned", it is correct._

---

## 3. Start the ML Engine (Python)

The ML Engine powers the forecasting and astrology logic.

1.  Open a terminal and navigating to the ML folder:
    ```powershell
    cd c:\Aniket\ml-predicter
    ```
2.  Activate your Python virtual environment (if using one), or simply run:

    ```powershell
    # Install dependencies (only if not already installed)
    pip install -r requirements-loose.txt

    # Start the server
    # Note: We use port 8000
    python -m uvicorn src.main:app --reload --port 8000
    ```

3.  **Verify**: Open `http://localhost:8000/health` in your browser. You should see `{"status": "healthy"}`.

---

## 4. Start the Backend API (Node.js)

The Backend allows the web and mobile apps to interact with the database and ML engine securely.

1.  Open a new terminal tab and navigate to the backend:
    ```powershell
    cd c:\Aniket\backend
    ```
2.  Start the development server:

    ```powershell
    # Install dependencies (first time only)
    npm install

    # Start server
    npm run dev
    ```

3.  **Verify**: The terminal should show `Server running on port 3000`.

---

## 5. Start the Web Application (React)

The Web Dashboard for desktop users.

1.  Open a new terminal tab:
    ```powershell
    cd c:\Aniket\web
    ```
2.  Start the frontend:

    ```powershell
    # Install dependencies (first time only)
    npm install

    # Start Vite server
    npm run dev
    ```

3.  **Verify**: Click the URL shown in the terminal (usually `http://localhost:5173`) to open the app.

---

## 6. Start the Mobile Application (React Native / Expo)

The Android/iOS app for end users.

1.  Open a new terminal tab:
    ```powershell
    cd c:\Aniket\mobile
    ```
2.  Start the Expo Metro Bundler:

    ```powershell
    # Install dependencies (first time only)
    npm install

    # Start Expo
    npx expo start
    ```

3.  **Run on Device**:
    - **Physical Device**: Download the "Expo Go" app from the App Store/Play Store. Scan the QR code shown in the terminal.
    - **Emulator**: Press `a` in the terminal to open on Android Emulator, or `i` for iOS Simulator (macOS only).

---

## Troubleshooting

### "getaddrinfo failed" in ML Engine

- **Cause**: Python is unable to resolve the Supabase DB URL due to a local DNS/Network issue.
- **Fix**: This is often temporary or specific to the local network adapter (e.g., IPv6 disabled). the app handles this gracefully, but DB writes might fail. Ensure your internet connection is stable.

### "Policy already exists" in Database

- **Cause**: You tried to run an old version of the schema script.
- **Fix**: Always use the _latest_ `c:/Aniket/supabase/schema.sql` which includes `DROP POLICY IF EXISTS` commands to handle re-runs safely.

### Mobile App can't connect to localhost

- **Cause**: Physical phones cannot see `localhost` on your computer.
- **Fix**: Ensure your phone and computer are on the **same Wi-Fi**. Update `.env` or config files to use your computer's local IP address (e.g., `192.168.1.5`) instead of `localhost`.
