'use strict'

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Import sequelize models
const User = require('./models').User;
const Course = require('./models').Course;

// Handler function to wrap each route.
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// GET return current user route
router.get('/users', asyncHandler( async(req, res) => {
  const users = await User.findAll();
  users.map(user => console.log(user));
  // res.json({

  // });
}));

// GET course listing route
router.get('/courses', asyncHandler( async(req, res) => {
  const courses = await Course.findAll();
  courses.map(course => console.log(course));
  // res.json({

  // });
}));

// GET particular course AND user who created it
router.get('/courses/:id', asyncHandler( async(req, res) => {
  const course = await Course.findByPk(req.params.id);

  // res.json({

  // });
}));

// POST create a user route
router.post('/users', asyncHandler( async(req, res) => {

  // res.json({

  // });
}));

// POST create a course route
router.post('/courses', asyncHandler( async(req, res) => {

  // res.json({

  // });
}));

// PUT update a course route
router.put('/courses/:id', asyncHandler( async(req, res) => {

  // res.json({

  // });
}));

// DELETE delete a course route
router.delete('/courses/:id', asyncHandler( async(req, res) => {

  // res.json({

  // });
}));

module.exports = router;