import "dotenv/config";
import { Op } from "sequelize";

import { sequelize } from "../src/config/database.js";
import { Student } from "../src/models/Student.js";
import { StudentProfile } from "../src/models/StudentProfile.js";
import { Department } from "../src/models/Department.js";
import { Course } from "../src/models/Course.js";

// Set up the same relationships used in server.js.
Student.hasOne(StudentProfile, { foreignKey: "studentId" });
StudentProfile.belongsTo(Student, { foreignKey: "studentId" });

Department.hasMany(Student, { foreignKey: "departmentId" });
Student.belongsTo(Department, { foreignKey: "departmentId" });

Student.belongsToMany(Course, { through: "StudentCourses" });
Course.belongsToMany(Student, { through: "StudentCourses" });

const names = [
  "Ali Raza",
  "Ayesha Khan",
  "Ahmed Malik",
  "Fatima Noor",
  "Hamza Shah",
  "Hira Ahmed",
  "Usman Siddiqui",
  "Zainab Iqbal",
  "Bilal Hussain",
  "Maryam Javed",
  "Hassan Ali",
  "Sana Tariq",
  "Abdullah Farooq",
  "Iqra Nawaz",
  "Umar Sheikh",
  "Laiba Khalid",
  "Saad Qureshi",
  "Mahnoor Aslam",
  "Talha Rehman",
  "Eman Akhtar",
  "Ibrahim Butt",
  "Anaya Chaudhry",
  "Huzaifa Abbas",
  "Aleena Yousaf",
  "Daniyal Mirza",
  "Nimra Zafar",
  "Zain Haider",
  "Areeba Imran",
  "Fahad Latif",
  "Minal Rauf",
  "Arham Siddiq",
  "Dua Shabbir",
  "Sameer Bashir",
  "Kinza Azam",
  "Rayan Anwar",
  "Hafsa Nadeem",
  "Adeel Sabir",
  "Sehar Majeed",
  "Taha Amin",
  "Rabia Ashraf",
  "Musa Nawaz",
  "Maham Ilyas",
  "Shayan Asghar",
  "Saba Iftikhar",
  "Rayyan Tariq",
  "Amna Saleem",
  "Zubair Masood",
  "Komal Jamil",
  "Faris Mahmood",
  "Sidra Waheed",
];

const areas = [
  "Johar Town, Lahore",
  "Gulberg, Lahore",
  "Model Town, Lahore",
  "DHA, Lahore",
  "F-10, Islamabad",
  "G-11, Islamabad",
  "Clifton, Karachi",
  "Gulshan-e-Iqbal, Karachi",
  "Satellite Town, Rawalpindi",
  "University Road, Peshawar",
];

const sampleStudents = names.map((name, index) => ({
  name,
  email: `student${String(index + 1).padStart(3, "0")}@example.com`,
  phone: `03${String(100000000 + index)}`,
  address: `${index + 1}, ${areas[index % areas.length]}`,
}));

const defaultDepartments = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Business Administration",
  "Mathematics",
];

const defaultCourses = [
  "Database Systems",
  "Web Development",
  "Data Structures",
  "Software Engineering",
  "Computer Networks",
  "Artificial Intelligence",
];

async function seedStudents() {
  let transaction;

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    transaction = await sequelize.transaction();

    // Use existing departments. Create sample ones only if none exist.
    let departments = await Department.findAll({ transaction });

    if (departments.length === 0) {
      departments = [];

      for (const name of defaultDepartments) {
        const department = await Department.create(
          { name },
          { transaction }
        );

        departments.push(department);
      }
    }

    // Use existing courses. Create sample ones only if none exist.
    let courses = await Course.findAll({ transaction });

    if (courses.length === 0) {
      courses = [];

      for (const title of defaultCourses) {
        const course = await Course.create(
          { title },
          { transaction }
        );

        courses.push(course);
      }
    }

    // Skip the sample emails that already exist.
    const existingStudents = await Student.findAll({
      attributes: ["email"],
      where: {
        email: {
          [Op.in]: sampleStudents.map((student) => student.email),
        },
      },
      transaction,
    });

    const existingEmails = new Set(
      existingStudents.map((student) => student.email)
    );

    let added = 0;

    for (let index = 0; index < sampleStudents.length; index++) {
      const sample = sampleStudents[index];

      if (existingEmails.has(sample.email)) {
        continue;
      }

      const department = departments[index % departments.length];

      // Create the student with a valid department ID.
      const student = await Student.create(
        {
          name: sample.name,
          email: sample.email,
          departmentId: department.id,
        },
        { transaction }
      );

      // Create phone and address in StudentProfile.
      await StudentProfile.create(
        {
          studentId: student.id,
          phone: sample.phone,
          address: sample.address,
        },
        { transaction }
      );

      // Give every student one or two existing courses.
      const selectedCourses = [
        courses[index % courses.length],
      ];

      if (courses.length > 1 && index % 2 === 1) {
        selectedCourses.push(
          courses[(index + 1) % courses.length]
        );
      }

      await student.setCourses(
        selectedCourses.map((course) => course.id),
        { transaction }
      );

      existingEmails.add(sample.email);
      added++;
    }

    await transaction.commit();

    console.log(`Successfully added ${added} sample students.`);
    console.log(
      `${sampleStudents.length - added} sample students already existed.`
    );
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedStudents();
