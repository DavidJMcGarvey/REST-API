'use strict'

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');

// Import sequelize model
const Course = require('../models').Course;

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

// Authenication middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  if (credentials) {
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name,
      },
    });

    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);

      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);
        req.currentUser = user;

      } else {
        message = `Authentication failure for username: ${user.username}`;
      } 
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = `Auth header not found`;
  }
  
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

// GET /api/courses 200 - course listing route
router.get('/courses', asyncHandler( async(req, res) => {
  const courses = await Course.findAll();
  res.json({
    courses
  });
}));

// GET /api/courses/:id 200 - particular course AND user who created it route
router.get('/courses/:id', asyncHandler( async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  res.json({
    course
  });
}));

// POST /api/courses/:id 201 - create a course route
router.post('/courses', [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
  check('estimatedTime')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "estimatedTime"'),
  check('materialsNeeded')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "materialsNeeded"'),
], asyncHandler( async(req, res) => {

  await Course.create(req.body);

  res.status(201).end();

}));

// PUT /api/courses/:id 204 - update a course route
router.put('/courses/:id', asyncHandler( async(req, res) => {
  let course = await Course.findByPk(req.params.id);

  if (course) {
    course.title = req.body.title;
    course.description = req.body.description;
    course.estimatedTime = req.body.estimatedTime;
    course.materialsNeeded = req.body.materialsNeeded;
  
    await course.save();
    res.status(204).end();
  } else {
    res.status(404).json({message: "Couldn't find that course :("});
  }

}));

// DELETE /api/courses/:id 204 - delete a course route
router.delete('/courses/:id', asyncHandler( async(req, res) => {
  let course = await Course.findByPk(req.params.id);

  if (course) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({message: "Couldn't find that course :("});
  }
}));

module.exports = router;