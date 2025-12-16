const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const nflTeams = [
  { name: 'Pittsburgh Steelers', sport: 'Football', league: 'NFL', city: 'Pittsburgh', primary_color: '#FFB612', secondary_color: '#101820', record: '8-6' },
  { name: 'Philadelphia Eagles', sport: 'Football', league: 'NFL', city: 'Philadelphia', primary_color: '#004C54', secondary_color: '#A5ACAF', record: '10-4' },
  { name: 'Dallas Cowboys', sport: 'Football', league: 'NFL', city: 'Dallas', primary_color: '#041E42', secondary_color: '#869397', record: '9-5' },
  { name: 'New York Giants', sport: 'Football', league: 'NFL', city: 'New York', primary_color: '#0B2265', secondary_color: '#A71930', record: '5-9' },
  { name: 'Washington Commanders', sport: 'Football', league: 'NFL', city: 'Washington', primary_color: '#773141', secondary_color: '#FFB612', record: '7-7' },
  { name: 'Green Bay Packers', sport: 'Football', league: 'NFL', city: 'Green Bay', primary_color: '#203731', secondary_color: '#FFB612', record: '9-5' },
  { name: 'Chicago Bears', sport: 'Football', league: 'NFL', city: 'Chicago', primary_color: '#0B162A', secondary_color: '#C83803', record: '4-10' },
  { name: 'Detroit Lions', sport: 'Football', league: 'NFL', city: 'Detroit', primary_color: '#0076B6', secondary_color: '#B0B7BC', record: '11-3' },
  { name: 'Minnesota Vikings', sport: 'Football', league: 'NFL', city: 'Minneapolis', primary_color: '#4F2683', secondary_color: '#FFC62F', record: '10-4' },
  { name: 'Tampa Bay Buccaneers', sport: 'Football', league: 'NFL', city: 'Tampa Bay', primary_color: '#D50A0A', secondary_color: '#34302B', record: '7-7' },
  { name: 'New Orleans Saints', sport: 'Football', league: 'NFL', city: 'New Orleans', primary_color: '#D3BC8D', secondary_color: '#101820', record: '5-9' },
  { name: 'Atlanta Falcons', sport: 'Football', league: 'NFL', city: 'Atlanta', primary_color: '#A71930', secondary_color: '#000000', record: '7-7' },
  { name: 'Carolina Panthers', sport: 'Football', league: 'NFL', city: 'Charlotte', primary_color: '#0085CA', secondary_color: '#101820', record: '3-11' },
  { name: 'San Francisco 49ers', sport: 'Football', league: 'NFL', city: 'San Francisco', primary_color: '#AA0000', secondary_color: '#B3995D', record: '10-4' },
  { name: 'Los Angeles Rams', sport: 'Football', league: 'NFL', city: 'Los Angeles', primary_color: '#003594', secondary_color: '#FFA300', record: '7-7' },
  { name: 'Seattle Seahawks', sport: 'Football', league: 'NFL', city: 'Seattle', primary_color: '#002244', secondary_color: '#69BE28', record: '8-6' },
  { name: 'Arizona Cardinals', sport: 'Football', league: 'NFL', city: 'Phoenix', primary_color: '#97233F', secondary_color: '#000000', record: '6-8' },
  { name: 'Kansas City Chiefs', sport: 'Football', league: 'NFL', city: 'Kansas City', primary_color: '#E31837', secondary_color: '#FFB81C', record: '12-2' },
  { name: 'Las Vegas Raiders', sport: 'Football', league: 'NFL', city: 'Las Vegas', primary_color: '#000000', secondary_color: '#A5ACAF', record: '2-12' },
  { name: 'Los Angeles Chargers', sport: 'Football', league: 'NFL', city: 'Los Angeles', primary_color: '#0080C6', secondary_color: '#FFC20E', record: '8-6' },
  { name: 'Denver Broncos', sport: 'Football', league: 'NFL', city: 'Denver', primary_color: '#FB4F14', secondary_color: '#002244', record: '9-5' },
  { name: 'Buffalo Bills', sport: 'Football', league: 'NFL', city: 'Buffalo', primary_color: '#00338D', secondary_color: '#C60C30', record: '11-3' },
  { name: 'Miami Dolphins', sport: 'Football', league: 'NFL', city: 'Miami', primary_color: '#008E97', secondary_color: '#FC4C02', record: '6-8' },
  { name: 'New England Patriots', sport: 'Football', league: 'NFL', city: 'Foxborough', primary_color: '#002244', secondary_color: '#C60C30', record: '3-11' },
  { name: 'New York Jets', sport: 'Football', league: 'NFL', city: 'New York', primary_color: '#125740', secondary_color: '#000000', record: '4-10' },
  { name: 'Baltimore Ravens', sport: 'Football', league: 'NFL', city: 'Baltimore', primary_color: '#241773', secondary_color: '#000000', record: '10-4' },
  { name: 'Cincinnati Bengals', sport: 'Football', league: 'NFL', city: 'Cincinnati', primary_color: '#FB4F14', secondary_color: '#000000', record: '6-8' },
  { name: 'Cleveland Browns', sport: 'Football', league: 'NFL', city: 'Cleveland', primary_color: '#311D00', secondary_color: '#FF3C00', record: '3-11' },
  { name: 'Houston Texans', sport: 'Football', league: 'NFL', city: 'Houston', primary_color: '#03202F', secondary_color: '#A71930', record: '9-5' },
  { name: 'Indianapolis Colts', sport: 'Football', league: 'NFL', city: 'Indianapolis', primary_color: '#002C5F', secondary_color: '#A2AAAD', record: '6-8' },
  { name: 'Jacksonville Jaguars', sport: 'Football', league: 'NFL', city: 'Jacksonville', primary_color: '#006778', secondary_color: '#D7A22A', record: '3-11' },
  { name: 'Tennessee Titans', sport: 'Football', league: 'NFL', city: 'Nashville', primary_color: '#0C2340', secondary_color: '#4B92DB', record: '3-11' }
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('Starting database seeding...');

    // Seed teams
    console.log('Seeding NFL teams...');
    for (const team of nflTeams) {
      await client.query(
        `INSERT INTO teams (name, sport, league, city, primary_color, secondary_color, current_season_record)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [team.name, team.sport, team.league, team.city, team.primary_color, team.secondary_color, team.record]
      );
    }
    console.log('✅ NFL teams seeded!');

    // Create demo users
    console.log('Creating demo users...');
    const password = await bcrypt.hash('password123', 10);

    const demoUsers = [
      { username: 'steelersfan1', email: 'steelers1@example.com', hometown: 'Pittsburgh', bio: 'Die-hard Steelers fan since 1970!' },
      { username: 'eaglesfan22', email: 'eagles22@example.com', hometown: 'Philadelphia', bio: 'Bleeding green and white!' },
      { username: 'cowboysfan88', email: 'cowboys88@example.com', hometown: 'Dallas', bio: 'Americas team forever!' },
      { username: 'chiefskingdom', email: 'chiefs@example.com', hometown: 'Kansas City', bio: 'Chiefs Kingdom member!' },
      { username: 'billsmafia', email: 'bills@example.com', hometown: 'Buffalo', bio: 'Bills Mafia represent!' }
    ];

    const userIds = [];
    for (const user of demoUsers) {
      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, hometown, bio)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [user.username, user.email, password, user.hometown, user.bio]
      );
      if (result.rows.length > 0) {
        userIds.push(result.rows[0].id);
      }
    }
    console.log('✅ Demo users created!');

    // Assign favorite teams to users
    console.log('Assigning favorite teams...');
    if (userIds.length > 0) {
      const teamsResult = await client.query('SELECT id, name FROM teams LIMIT 10');
      const teams = teamsResult.rows;

      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const teamId = teams[i % teams.length].id;

        await client.query(
          `INSERT INTO user_favorite_teams (user_id, team_id, fandom_level, ranking)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [userId, teamId, 5, 1]
        );

        await client.query(
          `INSERT INTO user_reputation (user_id, team_id, quality_score, verified_status)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [userId, teamId, 100, 'fan']
        );
      }
    }
    console.log('✅ Favorite teams assigned!');

    // Create some sample posts
    console.log('Creating sample posts...');
    if (userIds.length > 0) {
      const samplePosts = [
        { content: 'What a game! Our defense was incredible today! 🔥', type: 'discussion' },
        { content: 'Prediction: We win by 2 touchdowns this Sunday!', type: 'prediction' },
        { content: 'Analysis: Our offensive line needs to improve pass protection', type: 'analysis' },
        { content: 'Just got my tickets for next week! Who else is going?', type: 'discussion' },
        { content: 'Breaking: New injury report just came out', type: 'news' }
      ];

      const teamsResult = await client.query('SELECT id FROM teams LIMIT 5');
      const teamIds = teamsResult.rows.map(t => t.id);

      for (let i = 0; i < samplePosts.length; i++) {
        const post = samplePosts[i];
        await client.query(
          `INSERT INTO posts (user_id, team_id, content, post_type, upvotes)
           VALUES ($1, $2, $3, $4, $5)`,
          [userIds[i % userIds.length], teamIds[i % teamIds.length], post.content, post.type, Math.floor(Math.random() * 50)]
        );
      }
    }
    console.log('✅ Sample posts created!');

    // Create upcoming game threads
    console.log('Creating game threads...');
    const teamsResult = await client.query('SELECT id FROM teams WHERE name IN ($1, $2, $3)',
      ['Pittsburgh Steelers', 'Baltimore Ravens', 'Philadelphia Eagles']);

    if (teamsResult.rows.length >= 2) {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() + 3); // Game in 3 days

      await client.query(
        `INSERT INTO game_threads (team_id, opponent_id, game_date, status, is_home_team)
         VALUES ($1, $2, $3, $4, $5)`,
        [teamsResult.rows[0].id, teamsResult.rows[1].id, gameDate, 'scheduled', true]
      );

      const pastGame = new Date();
      pastGame.setDate(pastGame.getDate() - 7); // Game 7 days ago

      await client.query(
        `INSERT INTO game_threads (team_id, opponent_id, game_date, status, is_home_team, home_score, away_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [teamsResult.rows[0].id, teamsResult.rows[2]?.id || teamsResult.rows[1].id, pastGame, 'completed', true, 24, 17]
      );
    }
    console.log('✅ Game threads created!');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDemo users (all with password: password123):');
    demoUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = seedDatabase;
