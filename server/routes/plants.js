const router = require('express').Router();
const auth = require('../middleware/auth');
const Plant = require('../models/Plant');
router.use(auth);

router.get('/', async (req, res) => res.json(await Plant.find({ user: req.userId }).sort('nextWatering')));

router.get('/due', async (req, res) =>
  res.json(await Plant.find({ user: req.userId, nextWatering: { $lte: new Date() } })));

router.post('/', async (req, res) => {
  try { res.json(await Plant.create({ ...req.body, user: req.userId })); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  const p = await Plant.findOne({ _id: req.params.id, user: req.userId });
  if (!p) return res.status(404).json({ message: 'Not found' });
  Object.assign(p, req.body); await p.save(); res.json(p);
});

router.post('/:id/water', async (req, res) => {
  const p = await Plant.findOne({ _id: req.params.id, user: req.userId });
  if (!p) return res.status(404).json({ message: 'Not found' });
  p.lastWatered = new Date(); await p.save(); res.json(p);
});

router.delete('/:id', async (req, res) => {
  await Plant.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ ok: true });
});
module.exports = router;
