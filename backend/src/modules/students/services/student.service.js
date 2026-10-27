import { Course } from "../../../models/Course.js";
import { Department } from "../../../models/Department.js";
import { Student } from "../../../models/Student.js";
import { StudentProfile } from "../../../models/StudentProfile.js";
import { Op } from "sequelize";




export async function getAllStudents({
    page = 1,
    limit = 5,
    search = "",
    departmentId = "all",
    sortBy = "newest",

} = {}) {
    const requestedPage = Number.parseInt(page, 10);
    const requestedLimit = Number.parseInt(limit, 10);

    const safePage =
        Number.isInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const safeLimit =
        Number.isInteger(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 100)
            : 5;

    const searchTerm = String(search).trim();

    const where = {};

    if (
        departmentId !== "all" &&
        departmentId !== "" &&
        departmentId !== undefined
    ) {
        const parsedDepartmentId = Number.parseInt(departmentId, 10);

        if (
            !Number.isInteger(parsedDepartmentId) ||
            parsedDepartmentId <= 0
        ) {
            throw new Error("Invalid department ID");
        }

        where.departmentId = parsedDepartmentId;
    }

    if (searchTerm) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { email: { [Op.iLike]: `%${searchTerm}%` } },
            { "$StudentProfile.phone$": { [Op.iLike]: `%${searchTerm}%` } },
            { "$StudentProfile.address$": { [Op.iLike]: `%${searchTerm}%` } },
            { "$Department.name$": { [Op.iLike]: `%${searchTerm}%` } },
            { "$Courses.title$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
    }

    const matchingRows = await Student.findAll({
        attributes: ["id", "name", "createdAt"],
        where,
        include: [
            { model: StudentProfile, attributes: [], required: false },
            { model: Department, attributes: [], required: false },
            { model: Course, attributes: [], required: false },
        ],
        subQuery: false,
        order: [["id", "ASC"]],
        raw: true,
    });


    const uniqueStudents = [
        ...new Map(
            matchingRows.map((student) => [
                Number(student.id),
                {
                    id: Number(student.id),
                    name: student.name,
                    createdAt: student.createdAt,
                },
            ])
        ).values(),
    ];

    const allowedSortOptions = ["name", "newest", "oldest"];

    const safeSortBy = allowedSortOptions.includes(sortBy)
        ? sortBy
        : "newest";

    uniqueStudents.sort((a, b) => {
        if (safeSortBy === "name") {
            return a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
            });
        }

        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (safeSortBy === "oldest") {
            return dateA - dateB || a.id - b.id;
        }

        return dateB - dateA || a.id - b.id;
    });

    const total = uniqueStudents.length;
    const totalPages = Math.ceil(total / safeLimit);
    const offset = (safePage - 1) * safeLimit;

    const pageIds = uniqueStudents
        .slice(offset, offset + safeLimit)
        .map((student) => student.id);


    const rows = pageIds.length
        ? await Student.findAll({
            where: {
                id: { [Op.in]: pageIds },
            },
            include: [StudentProfile, Department, Course],
            order: [["id", "ASC"]],
        })
        : [];

    return {
        data: rows,
        pagination: {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages,
        },
    };
}


// export const getAllStudents = () => {     //function to get all students
//   return Student.findAll({
//     include: [StudentProfile, Department, Course],
//   });
//     };

export const createStudent = (name, email) => {     // function to create a new students
    return Student.create({ name, email });
};

export const updateStudentById = async (id, name, email) => {
    const student = await Student.findByPk(id);

    if (!student)

        return null;

    student.name = name;
    student.email = email;

    return student.save();
};



export const deleteStudentById = async (id) => {
    const student = await Student.findByPk(id);

    if (!student) return false;
    await student.destroy();
    return true;

}
