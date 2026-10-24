const Character = require('../models/Character');
const User = require('../models/User');
const Relation = require('../models/Relation');

async function index(req, res) {
  const [characters, roleCountsRows, charCount, userCount, relCount] = await Promise.all([
    Character.list({}),
    Character.countByRole(),
    Character.count(),
    User.count(),
    Relation.count ? Relation.count() : Promise.resolve(0)
  ]);

  const roleCounts = {};
  roleCountsRows.forEach((row) => {
    roleCounts[row.role] = row.total;
  });

  return res.render('index', {
    title: 'Inicio',
    latestCharacters: characters.slice(0, 6),
    roleCounts,
    stats: {
      characters: charCount,
      users: userCount,
      relations: relCount
    }
  });
}

module.exports = { index };
