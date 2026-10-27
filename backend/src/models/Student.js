import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Student = sequelize.define("Student", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});