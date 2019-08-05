const express = require('express')
const router = express.Router()
const user = require('../../models/user')
const isAdmin = require('../../services/isAdmin')
const writeLog = require('../../services/writeLog')
const context = 'Users'

router.post('/login', function (req, res) {
  if (req.body.email && req.body.password) {
    user.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        res.status(403).send('Incorrect username or password')
      } else {
        writeLog(`User ${req.body.email} has logged in.`, 'Info', context)
        if (!req.body.remember) {
          req.session.cookie.expires = false
        }
        req.session.userId = user._id
        req.session.admin = user.admin
        req.session.username = user.username
        res.status(200).send({ admin: user.admin, _id: req.session.userId })
      }
    })
  } else {
    res.status(403).send('Missing fields')
  }
})

router.delete('/logout', function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        res.sendStatus(500)
        writeLog(err, 'Error', context)
      } else {
        res.clearCookie('connect.sid', { path: '/' }).status(200).send('Cookie deleted.')
      }
    })
  }
})

router.post('/register', isAdmin, function (req, res) {
  if (req.body.email && req.body.password) {
    const userData = {
      username: req.body.email,
      password: req.body.password,
      admin: req.body.admin,
      createdBy: req.session.userId
    }
    user.create(userData, function (err, user) {
      if (err) {
        writeLog(err, 'Error', context)
        res.status(200).send('Something went wrong, maybe the user already exists...')
      } else {
        writeLog(`User account ${userData.username} has been created by ${req.session.userId}`, 'Info', context)
        res.sendStatus(201)
      }
    })
  }
})

router.get('/', isAdmin, function (req, res) {
  user.find().select('username admin').exec(function (err, results) {
    if (err) console.error(err)
    res.json(results)
  })
})

router.get('/:_id', isAdmin, function (req, res) {
  let _id = { _id: req.params._id }
  user.findOne(_id).select('username admin').exec(function (err, result) {
    if (err) console.error(err)
    res.json(result)
  })
})

router.post('/:_id', isAdmin, function (req, res) {
  const _id = req.params._id
  const parameters = {}
  parameters.editedBy = req.session.userId
  if (req.body.user.password) {
    parameters.password = req.body.user.password
  }
  if (req.body.user.username) {
    parameters.username = req.body.user.username
  }
  if (req.body.user.admin != null) {
    parameters.admin = req.body.user.admin
  }
  user.findOneAndUpdate({ _id }, { $set: parameters }, { strict: false, new: true })
    .select('username admin')
    .exec(function (err, result) {
      if (err) {
        writeLog(err, 'Error', context)
        res.sendStatus(500)
      } else {
        writeLog(`User account ${result} has been updated by ${req.session.userId}`, 'Info', context)
        res.json(result)
      }
    })
})

router.delete('/:_id', isAdmin, function (req, res) {
  user.deleteOne({ _id: req.params._id }, function (err) {
    if (err) {
      console.err(err)
      writeLog(err, 'Error', context)
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
      writeLog(`User account ${req.params._id} has been deleted by ${req.session.userId}`, 'Info', context)
    }
  })
})

module.exports = router
