import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";



export const StudentProfile = sequelize.define("StudentProfile", {
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
});