# Schooler

[![License](https://img.shields.io/github/license/AungS8430/schooler)](LICENSE)
[![Languages](https://img.shields.io/github/languages/top/AungS8430/schooler)](https://github.com/AungS8430/schooler)
[![Last Commit](https://img.shields.io/github/last-commit/AungS8430/schooler)](https://github.com/AungS8430/schooler/commits/main)

## Overview

**Schooler** is a web application that allows students to easily access resources and informations.

---

## Features

- **Live timetable and class schedule**
- **Downloadable academic calendar**
- **Downloadable timetables**
- **Create/view annoucements**
- **View people and get contacts**
- **Download resources**

---

## Tech Stack

- **Frontend:** NextJS with TypeScript (located in `frontend/`)
- **Backend:** FastAPI with sqlmodel (located in `backend/`)

---

## Project Structure

```
schooler/
├── backend/      # Python backend code & API
├── frontend/     # NextJS frontend source code & assets
├── LICENSE
├── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (recommended v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (recommended v3.8+)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/AungS8430/schooler.git
    cd schooler
    ```

2. **Install frontend dependencies:**
    ```bash
    cd frontend
    pnpm install
    ```

3. **Install backend dependencies:**
    ```bash
    cd ../
    pip install -r requirements.txt
    ```

### Preparations

Add data to `backend/volumes` the files include**
```
...
backend/
├── ...
├── volumes
├── ├── academicInfo.json
├── ├── info.json
├── ├── override.json
├── ├── resources.json
├── ├── slots.json
├── ├── special.json
├── ├── timetable.json
├── ...
...
```

Please view example in the respective files.

Create `.env` inside `backend` and `frontend` folders, view `.env.example` inside the respective directories.

---

## Usage

1. **Start the backend server:**
    ```bash
    cd backend
    fastapi run server.py
    ```

2. **Start the frontend development server:**
    ```bash
    cd ../frontend
    pnpm start
    ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Contributing

Contributions are welcome!  
If you have suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

Steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.  
See [LICENSE](LICENSE) for details.

---

## Contact

For questions or feedback, open an [issue](https://github.com/AungS8430/schooler/issues).
