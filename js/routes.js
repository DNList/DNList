import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Changelog from './pages/Changelog.js';
import Runs from './pages/Runs.js';

export default [
    { path: '/', component: List },
    { path: '/runs', component: Runs },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/changelog', component: Changelog },
];
