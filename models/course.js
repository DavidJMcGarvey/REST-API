'use strict'

const Sequelize = require('sequelize');

// Create and export User model
module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  // Initialize Course model
  Course.init({
    id : {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Title" is required'
        } 
      }
    },
    description: {
      type: Sequelize.TEXT,
      validate: {
        notEmpty: {
          msg: '"Description" is required'
        } 
      }
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  }, { sequelize });

  Course.associate = (models) => {
    // Add (Many to One) association to User model
    Course.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      },
    });
  };

  return Course;
};