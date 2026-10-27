import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";


export const Course = sequelize.define("Course", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});