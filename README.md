# 📘 Frontend - Course Management System (React + Vite)

This is the **React-based frontend** for the Internship Assignment by **Application Software Centre, IIT Bombay**. It connects with the backend APIs to manage and visualize Courses and Course Instances.

---

## 🧩 Tech Stack

* React + Vite
* Material UI (MUI)
* React Router v6
* Axios
* React Query
* Formik + Yup (form validation)
* Toastify (notifications)

---

## ⚙️ Setup Instructions

### Step 1: Clone Repository

```bash
git clone <your-private-frontend-repo>
cd courses-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## 💻 User Interface Overview

### 📊 Dashboard Page

**Screenshot:** 
![localhost_5173_dashboard](https://github.com/user-attachments/assets/65e81dd0-a700-4b27-ae2a-448b999a3094)


Shows 3 summary cards:

* ✅ **Total Courses**
* 📘 **Current Semester Instances**
* 📦 **Total Instances**

Also displays **recent activities** at the bottom.

---

### 📚 Courses Page

**Screenshot:
![localhost_5173_Course](https://github.com/user-attachments/assets/6feb71ea-1a7a-4bd4-b5d9-b9fd768d9619)


* Lists all existing courses
* Shows Course ID, Title, Description, and Prerequisites
* Proper error handling (e.g., disables delete button for dependent courses)

---

### ➕ Add New Course Page

**Screenshot:** 
![localhost_5173_courses_create](https://github.com/user-attachments/assets/82d235ea-a444-40bd-b223-198bf645906e)


* Add a new course
* Fields:

  * Course ID
  * Title
  * Description
  * Select prerequisites from existing courses (multi-select dropdown)
* Validation using Formik + Yup
* Toast messages for success/error

---

### 📦 Course Instances Page

**Screenshot:** 
![CourseInstance Dashboard](https://github.com/user-attachments/assets/49111041-9f06-4e7a-abe0-ace4d59a87b0)


* Lists all course delivery instances
* Includes **Filter Section**:

  * Filter by Year
  * Filter by Semester
* Displays matched results in a grid/table

---

### ➕ Add Course Instance

**Screenshot:** 
![localhost_5173_createNewInstance](https://github.com/user-attachments/assets/b4c7dcc4-77fd-4c91-84b6-19e6b0156d0b)


* Add new course delivery
* Fields:

  * Course ID (dropdown)
  * Year
  * Semester
* Validation included

---

## 🐳 Docker Build & Push (Frontend)

```bash
docker build -t devdot021/courses-frontend:v1 .
docker push devdot021/courses-frontend:v1
```

---

## 📦 Docker Compose (Full Stack)

This image is referenced in your `docker-compose.yml` alongside backend and MySQL.

---

## ✅ Final Checklist

* ✅ Responsive UI using Material UI
* ✅ Filter & Form validations with proper error messages
* ✅ Clean and modular folder structure
* ✅ Compatible with backend as per assignment requirement

---

## 📎 Image File Path Info

Place all your images like `dash.jpg`, `courses.jpg`, `addcourse.jpg`, `newinst.jpg` etc. inside:

```
src/assets/images/
```

And link them in README using:

```
![AltText](./assets/images/filename.jpg)
```

Replace `filename.jpg` with actual image names when pushing to GitHub.
