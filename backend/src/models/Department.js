import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";



export const Department = sequelize.define("Department", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});