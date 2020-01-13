'use strict'

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}

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
      type: Sequelize.INTEGER,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
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