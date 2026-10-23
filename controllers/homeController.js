const Character = require('../models/Character');
const User = require('../models/User');
const Relation = require('../models/Relation');

function index(req, res) {
  const roleCounts = {};
  Character.countByRole().forEach((row) => {
    roleCounts[row.role] = row.total;
  });

  return res.render('index', {
    title: 'Inicio',
    latestCharacters: Character.list({}).slice(0, 6),
    roleCounts,
    stats: {
      characters: Character.count(),
      users: User.count(),
      relations: Relation.count()
    }
  });
}

module.exports = { index };
