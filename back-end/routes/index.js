const express = require('express');
const router = express.Router();
const User = require('../models/user');

let session = [];


function isLoged(token, session) {
  return session.some((user) => user.token == token);
}

function accessControll(req, res, next) {
  console.log('test', req.url, req.cookies);
  const _isLoged = isLoged(req.cookies.token, session);

  if (_isLoged) next()
  else res.render('index', { showReg: true, _isLoged });
}

/* GET home page. */
router.get('/', (req, res, next) => { next() }, function (req, res) {
  const _isLoged = isLoged(req.cookies.token, session);
  res.render('index', { showReg: false, _isLoged });
});

router.get('/buy', function (req, res) {
  res.render('buy');
});

router.get('/card', accessControll, function (req, res) {

  const _isLoged = isLoged(req.cookies.token, session);
  console.log(_isLoged);
  res.render('card', { query: req.query, _isLoged });
});

router.get('/cabinet', accessControll, (req, res) => {
  // find user by token
  session.map(u => { if (u.token == req.cookies.token) user = u })
  res.render('cabinet', { user });
});

router.get('/welcome', accessControll, (req, res) => {
  // find user by token
  session.map(u => { if (u.token == req.cookies.token) user = u })
  res.render('welcome', { user });
});

router.all('/pay-success', (req, res) => {
  console.log('buy item', req.url, req.body);
  res.json(req.body);
})
router.all('/pay-unsuccess', (req, res) => {
  console.log('buy item', req.url, req.body);
  res.json(req.body);
})
router.all('/pay-pending', (req, res) => {
  console.log('buy item', req.url, req.body);
  res.json(req.body);
})
router.all('/pay-info', (req, res) => {
  console.log('buy item', req.url, req.body);
  res.json(req.body);
})






router.post('/api/register', async function (req, res) {
  console.log(req.body);


  const isUser = await User.findOne({ email: req.body.email });
  if (isUser) return res.json({ message: 'Пользователь с такими данными уже зарегистрирован', ok: false });

  const user = new User({
    name: req.body.name,
    pass: req.body.pass,
    email: req.body.email
  }
  );
  user
    .save()
    .then(() => {
      console.log('meow')
      res.json({ ok: true });
    })
    .catch((error) => {
      res.json({ ok: false, error });
    });

});


router.post('/api/auth', async function (req, res) {
  console.log(req.body);
  const user = await User.findOne({ name: req.body.name });

  if (user == null) res.json({ ok: false, message: ' User not found' })
  else if (user.pass == req.body.pass) {
    // res.json({ ok: true,token:'ghwgjgshjdjgshdgjfsg' });
    let token = (Math.random() * 1000000) + '';
    const user = await User.findOneAndUpdate({ name: req.body.name }, { token: token });
    user.token = token
    session.push(user);
    console.log(session);
    res.json({ ok: true, token: token })

  } else {
    res.json({ ok: false, message: 'password not correct' });
  }

});

router.get('/logout', (req, res, next) => { next() }, function (req, res) {
  session = session.filter((user) => {
    return user.token != req.cookies.token;
  })
  console.log(session, 'session');
  const _isLoged = isLoged(req.cookies.token, session);
  res.render('index', { showReg: false, _isLoged });
});





module.exports = router;
