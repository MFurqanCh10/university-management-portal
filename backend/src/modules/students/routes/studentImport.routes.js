import express from "express";
import multer from "multer";
import ExcelJS from "exceljs";
import { parse } from "csv-parse/sync";
import { Op, col, fn, where } from "sequelize";
import { extname } from "node:path";

import { sequelize } from "../../../config/database.js";
import { Student } from "../../../models/Student.js";
import { StudentProfile } from "../../../models/StudentProfile.js";
import { Department } from "../../../models/Department.js";
import { Course } from "../../../models/Course.js";
import { authenticate } from "../../../middleware/authenticate.js";

const router = express.Router();

const allowedExtensions = [".csv", ".xlsx"];
function normalizeKey(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5 Mb
        files: 1,
    },
    fileFilter(req, file, callback) {
        const extension = extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            return callback(
                new Error("Please upload a CSV (.csv) or Excel (.xlsx) file.")
            );
        }

        callback(null, true);
    },
});
function uploadSingleFile(req, res, next) {
    upload.single("file")(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        next();
    });
}
function removeEmptyRows(rows) {
    return rows.filter((row) =>
        Object.values(row).some((value) => String(value ?? "").trim() !== "")
    );
}

async function readUploadedRows(file) {
    const extension = extname(file.originalname).toLowerCase();

    if (extension === ".csv") {
        const rows = parse(file.buffer, {
            bom: true,
            columns: (headers) => headers.map(normalizeKey),
            skip_empty_lines: true,
            trim: true,
        });

        return removeEmptyRows(rows);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
        throw new Error("The file is empty or has no student data rows.");
    }

    const headerRow = worksheet.getRow(1);
    const headers = [];

    for (let column = 1; column <= headerRow.cellCount; column++) {
        headers.push(normalizeKey(headerRow.getCell(column).text));
    }

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const record = {};

        headers.forEach((header, index) => {
            if (header) {
                record[header] = String(
                    row.getCell(index + 1).text ?? ""
                ).trim();
            }
        });

        rows.push(record);
    });

    return removeEmptyRows(rows);
}

function normalizeRecord(row) {

    function getValue(...aliases) {
        for (const alias of aliases) {
            const value = row[normalizeKey(alias)];

            if (value !== undefined && value !== null) {
                return String(value).trim();
            }
        }

        return "";
    }

    return {
        name: getValue("name", "student name", "full name"),
        email: getValue("email", "email address"),
        phone: getValue("phone", "phone number", "mobile"),
        address: getValue("address"),
        departmentName: getValue("department", "department name"),
        coursesText: getValue("courses", "course", "course title"),
    };
}

router.post("/",authenticate, uploadSingleFile, async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Please choose a CSV or Excel file first.",
        });
    }

    let rows;

    try {
        rows = await readUploadedRows(req.file);
    } catch {
        return res.status(400).json({
            message: "Could not read the file. Check its format and try again.",
        });
    }

    if (rows.length === 0) {
        return res.status(400).json({
            message: "The file contains no student records.",
        });
    }

    if (rows.length > 1000) {
        return res.status(400).json({
            message: "Upload a maximum of 1,000 student records per file.",
        });
    }

    try {
        const [departments, courses] = await Promise.all([
            Department.findAll(),
            Course.findAll(),
        ]);

        const departmentsByName = new Map(
            departments.map((department) => [
                String(department.name).trim().toLowerCase(),
                department,
            ])
        );

        const coursesByName = new Map(
            courses.map((course) => [
                String(course.title).trim().toLowerCase(),
                course,
            ])
        );

        const errors = [];
        const seenEmails = new Set();
        const studentsToCreate = [];

        rows.forEach((rawRow, index) => {
            const rowNumber = index + 2;
            const record = normalizeRecord(rawRow);
            const rowErrors = [];

            const name = record.name;
            const email = record.email.toLowerCase();

            if (!name) {
                rowErrors.push("Name is required.");
            }

            if (!email) {
                rowErrors.push("Email is required.");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                rowErrors.push("Email address is invalid.");
            }

            if (email && seenEmails.has(email)) {
                rowErrors.push("This email appears more than once in the file.");
            }

            if (email) {
                seenEmails.add(email);
            }

            let department = null;

            if (!record.departmentName) {
                rowErrors.push("Department is required.");
            } else {
                department = departmentsByName.get(
                    record.departmentName.toLowerCase()
                );

                if (!department) {
                    rowErrors.push(
                        `Department "${record.departmentName}" was not found.`
                    );
                }
            }

            const courseNames = record.coursesText
                .split(/[;|]/)
                .map((title) => title.trim())
                .filter(Boolean);

            if (courseNames.length === 0) {
                rowErrors.push("At least one course is required.");
            }

            const selectedCourses = [];

            for (const title of courseNames) {
                const course = coursesByName.get(title.toLowerCase());

                if (!course) {
                    rowErrors.push(`Course "${title}" was not found.`);
                } else {
                    selectedCourses.push(course);
                }
            }

            if (rowErrors.length > 0) {
                errors.push(`Row ${rowNumber}: ${rowErrors.join(" ")}`);
                return;
            }

            studentsToCreate.push({
                name,
                email,
                phone: record.phone,
                address: record.address,
                department,
                courses: selectedCourses,
            });
        });

        // Stop before writing anything if a row is invalid.
        if (errors.length > 0) {
            return res.status(400).json({
                message:
                    "No students were imported. Fix the following rows and upload again:",
                errors,

            });

        }


        const emails = studentsToCreate.map((student) => student.email);

        const existingStudents = await Student.findAll({
            attributes: ["email"],
            where: where(fn("LOWER", col("email")), {
                [Op.in]: emails,
            }),
        });

        const existingEmails = new Set(
            existingStudents.map((student) =>
                String(student.email).toLowerCase()
            )
        );

        const duplicateErrors = studentsToCreate
            .filter((student) => existingEmails.has(student.email))
            .map(
                (student) =>
                    `Email "${student.email}" already exists in the database.`
            );

        if (duplicateErrors.length > 0) {
            return res.status(409).json({
                message:
                    "No students were imported because some email addresses already exist:",
                errors: duplicateErrors,
            });
        }

        // Save the entire batch as one transaction.
        // If any database operation fails, roll back the batch.
        const transaction = await sequelize.transaction();

        try {
            for (const record of studentsToCreate) {
                const student = await Student.create(
                    {
                        name: record.name,
                        email: record.email,
                        departmentId: record.department.id,
                    },
                    { transaction }
                );

                await StudentProfile.create(
                    {
                        studentId: student.id,
                        phone: record.phone,
                        address: record.address,
                    },
                    { transaction }
                );

                await student.setCourses(
                    record.courses.map((course) => course.id),
                    { transaction }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            return next(error);
        }

        return res.status(201).json({
            message: "Students imported successfully.",
            created: studentsToCreate.length,
        });
    } catch (error) {
        next(error);
    }
});

export default router;