import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        allLevels: [], // 👈 store all levels here (names + ranks + links)
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>

                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
                        <table class="table" v-if="entry.verified.length > 0">
                            <tr v-for="score in entry.verified" :key="score.level">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table" v-if="entry.completed.length > 0">
                            <tr v-for="score in entry.completed" :key="score.level">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="table" v-if="entry.progressed.length > 0">
                            <tr v-for="score in entry.progressed" :key="score.level">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <!-- 👇 New Section -->
                        <h2 v-if="noProgress.length > 0">No Progress ({{ noProgress.length }})</h2>
                        <table class="table no-progress" v-if="noProgress.length > 0">
                            <tr v-for="score in noProgress" :key="score.level">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
        noProgress() {
            if (!this.entry || this.allLevels.length === 0) return [];

            // Collect all levels this player has touched
            const attempted = new Set([
                ...this.entry.verified.map(l => l.level),
                ...this.entry.completed.map(l => l.level),
                ...this.entry.progressed.map(l => l.level),
            ]);

            // Filter out all that are unattempted
            return this.allLevels.filter(l => !attempted.has(l.level));
        },
    },
    
     async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;

        // ✅ Fetch all levels so No Progress works
        try {
            const listResponse = await fetch('/data/_list.json');
            const listPaths = await listResponse.json();

            const levelPromises = listPaths.map(async (path, rank) => {
                const res = await fetch(`/data/${path}.json`);
                try {
                    const level = await res.json();
                    return {
                        level: level.name,
                        rank: rank + 1,
                        link: level.verification || '#',
                        score: 0,
                    };
                } catch {
                    console.warn(`Could not load ${path}.json`);
                    return null;
                }
            });

            const resolvedLevels = await Promise.all(levelPromises);
            this.allLevels = resolvedLevels.filter(Boolean).sort((a, b) => a.rank - b.rank);
        } catch (e) {
            console.error('Failed to load _list.json:', e);
            this.allLevels = [];
        }

        this.loading = false;
    },

    // 👇 Keep this part as is
    methods: {
        localize,
    },
};
