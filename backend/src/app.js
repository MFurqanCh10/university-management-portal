import "dotenv/config";
import express from "express";
import { Student } from "./models/Student.js";
import { StudentProfile } from "./models/StudentProfile.js";
import { Department } from "./models/Department.js";
import { Course } from "./models/Course.js";
import studentRoutes from "./modules/students/routes/student.routes.js"
import { errorHandler } from "./middleware/errorHandler.js";
import studentImportRoutes from "./modules/students/routes/studentImport.routes.js";
import cors from "cors";
import { User } from "./models/User.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/authenticate.js";




Student.hasOne(StudentProfile, { foreignKey: "studentId" });
StudentProfile.belongsTo(Student, { foreignKey: "studentId" });

Department.hasMany(Student, { foreignKey: "departmentId" });
Student.belongsTo(Department, { foreignKey: "departmentId" });

Student.belongsToMany(Course, { through: "StudentCourses" });
Course.belongsToMany(Student, { through: "StudentCourses" });




const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

// Parse cookies BEFORE registering routes
app.use(cookieParser());

// Routes
app.use("/api/students/import", studentImportRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "University API is running" });
});

// app.post("/api/students", async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and Email are required" });
//     }
//     const student = await Student.create({ name, email });
//     res.status(201).json(student);

//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create student" });

//   }

// });

// app.get("/api/students", async (req, res) => {
//   const students = await Student.findAll({
//     include: StudentProfile,
//   });
//   res.json(students);
// });

app.post("/api/students/:id/profile",authenticate, async (req,res,) => {
  try {
    const studentId = Number(req.params.id);
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { phone, address } = req.body;

    const profile = await StudentProfile.create({
      phone,
      address,
      studentId,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/students/:id",authenticate, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [StudentProfile, Department, Course],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

app.post("/api/departments",authenticate, async (req, res) => {

  try {
    const department = await Department.create({
      name: req.body.name,
    });
    res.status(201).json(department);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to create department" });

  }
});


app.put("/api/students/:id/department",authenticate, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.departmentId = req.body.departmentId;
    await student.save();

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign department" });
  }
});

app.get("/api/departments/:id",authenticate, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: Student,
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    console.error("Fetch department error:", error);
    res.status(500).json({ message: "Failed to fetch department" });
  }
});

app.post("/api/courses",authenticate, async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create course" });
  }
});

app.post("/api/students/:studentId/courses/:courseId",authenticate, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.studentId);
    const course = await Course.findByPk(req.params.courseId);

    if (!student || !course) {
      return res.status(404).json({ message: "Student or course not found" });
    }

    await student.addCourse(course);
    res.json({ message: "Student enrolled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Enrollment failed" });
  }
});

app.get("/api/students/:id/courses",authenticate, async (req, res) => {
  try {


    const student = await Student.findByPk(req.params.id, {
      include: Course,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/api/departments",authenticate, async (req, res, next) => {
  try {
    res.json(await Department.findAll());
  } catch (error) {
    next(error);
  }
});

app.get("/api/courses",authenticate, async (req, res, next) => {
  try {
    res.json(await Course.findAll());
  } catch (error) {
    next(error);
  }
});

app.put("/api/students/:id/profile",authenticate, async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    let profile = await StudentProfile.findOne({
      where: { studentId: student.id },
    });

    if (!profile) {
      profile = await StudentProfile.create({
        studentId: student.id,
        phone: req.body.phone,
        address: req.body.address,
      });
    } else {
      await profile.update({
        phone: req.body.phone,
        address: req.body.address,
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});
app.put("/api/students/:id/courses",authenticate, async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.setCourses(req.body.courseIds);
    res.json({ message: "Courses updated successfully" });
  } catch (error) {
    next(error);
  }
});
app.put("/api/departments/:id",authenticate, async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    await department.update({ name });

    res.json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
});
app.delete("/api/departments/:id",authenticate, async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const studentCount = await Student.count({
      where: { departmentId: department.id },
    });

    if (studentCount > 0) {
      return res.status(409).json({
        message: "Reassign this department's students before deleting it",
      });
    }

    await department.destroy();

    res.json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
app.put("/api/courses/:id",authenticate, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({
        message: "Course title is required",
      });
    }

    await course.update({ title });

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
});
app.delete("/api/courses/:id",authenticate, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await course.setStudents([]);

    await course.destroy();

    res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    user: req.user,
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Handle errors passed by Express
app.use(errorHandler);

export default app;
