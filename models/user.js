'use strict'

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}

  User.init({
    id : {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"First Name" is required'
        } 
      }
    },
    lastName: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Last Name" is required'
        } 
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Email" is required'
        } 
      }},
    password: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Password" is required'
        } 
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    // Add (One to Many) association to Course model
    User.hasMany(models.Course, {
      as: 'author',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      },
    });
  };

  return User;
};