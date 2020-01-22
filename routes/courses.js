'use strict'

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');

// Import sequelize model
const Course = require('../models').Course;
const User = require('../models').User;

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

const courseChecker = [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
];

// GET /api/courses 200 - course listing route
router.get('/courses', asyncHandler( async(req, res) => {
  const courses = await Course.findAll({
    attributes: ['id', 'userId', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
    }
  });
  res.json({
    courses
  });
}));

// GET /api/courses/:id 200 - particular course AND user who created it route
router.get('/courses/:id', asyncHandler( async(req, res) => {
  const course = await Course.findByPk(
    req.params.id,
    { 
      attributes: ['id', 'userId', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
      include: {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
      }
    }
    );
  res.json({
    course
  });
}));

// POST /api/courses/:id 201 - create a course route
router.post('/courses', courseChecker, authenticateUser, asyncHandler( async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMessages = errors.array().map(error => error.msg);
    return res.status(400).json({message: errorsMessages});
  } else {
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
  }

}));

// PUT /api/courses/:id 204 - update a course route
router.put('/courses/:id', courseChecker, authenticateUser, asyncHandler( async(req, res) => {
  let course = await Course.findByPk(req.params.id);
  if (course) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map(error => error.msg);
      return res.status(400).json({message: errorsMessages});
    } else {
      if (req.currentUser.id === course.userId) {
        course.title = req.body.title;
        course.description = req.body.description;
        course.estimatedTime = req.body.estimatedTime;
        course.materialsNeeded = req.body.materialsNeeded;
      
        await course.save();
        res.status(204).end();
      } else {
        res.status(403).json({message: "You can only edit your own courses :("});
      } 
    }
  } else {
    res.status(404).json({message: "Couldn't find that course :("});
  }

}));

// DELETE /api/courses/:id 204 - delete a course route
router.delete('/courses/:id', authenticateUser, asyncHandler( async(req, res) => {
  let course = await Course.findByPk(req.params.id);

  if (course) {
    if (req.currentUser.id === course.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({message: "You can only delete your own courses :("});
    }
  } else {
    res.status(404).json({message: "Couldn't find that course :("});
  }
}));

module.exports = router;