'use strict'

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');

// Import sequelize model
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

// GET /api/users 200 - return current user route
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;
  res.json({
    // just `user` ??
    username: user.emailAddress
  });
});

// POST /api/users 201 - create a user route
router.post('/users', [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
], asyncHandler( async(req, res) => {

  const errors =  validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);

    return res.status(400).json({ errors: errorMessages });
  }

  const user = await req.body;

  user.password = bcryptjs.hashSync(user.password);

  await User.create(req.body);

  res.status(201).end();
}));

module.exports = router;