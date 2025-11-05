import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import tags from "../components/List/Tags.js";


export default {
    components: { Spinner },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        allLevels: [], // added
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
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank"><p class="type-label-lg">#{{ i + 1 }}</p></td>
                            <td class="total"><p class="type-label-lg">{{ localize(ientry.total) }}</p></td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i"><span class="type-label-lg">{{ ientry.user }}</span></button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>

                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="entry.tagBonuses && entry.tagBonuses.length > 0">Tag Points</h2>
                        <table class="table" v-if="entry.tagBonuses && entry.tagBonuses.length > 0">
                            <tr v-for="bonus in entry.tagBonuses" :key="bonus.name">
                                <td class="level"><p>{{ bonus.name }}</p></td>
                                <td class="score"><p>+{{ localize(bonus.bonus) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a></td>
                                <td class="score"><p>+{{ localize(score.score) }}</p></td>
                            </tr>
                        </table>

                        <h2 v-if="noProgress.length > 0">No Progress ({{ noProgress.length }})</h2>
                        <table class="table" v-if="noProgress.length > 0">
                            <tr v-for="score in noProgress">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
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
            if (!this.entry || !this.allLevels) return [];
            const attempted = new Set([
                ...this.entry.verified.map(l => l.level),
                ...this.entry.completed.map(l => l.level),
                ...this.entry.progressed.map(l => l.level),
            ]);
            return this.allLevels.filter(l => !attempted.has(l.level));
        },
    },
    async mounted() {
        const [leaderboard, err, allLevels] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        this.allLevels = allLevels;
        this.applyTagBonuses();
        this.loading = false;
    },
    methods: {
        localize,

        applyTagBonuses() {
            console.log("Applying tag bonuses...");
            this.leaderboard.forEach(entry => {
                // Combine verified + completed levels
                const completedLevels = new Set([
                    ...entry.completed.map(l => l.level),
                    ...entry.verified.map(l => l.level),
                ]);

                console.log(`Player ${entry.user} completed levels:`, Array.from(completedLevels));

                entry.tagBonuses = [];
                let totalBonus = 0;

                tags.forEach(tag => {
                    // ✅ Match by tag.id or tag.name, case-insensitive
                    const levelsWithTag = this.allLevels.filter(l =>
                        Array.isArray(l.tags) &&
                        l.tags.some(t =>
                            String(t).toLowerCase() === tag.id.toLowerCase() ||
                            String(t).toLowerCase() === tag.name.toLowerCase()
                        )
                    );

                    // Only log if this tag applies to some levels
                    if (levelsWithTag.length > 0) {
                        console.log(`Tag "${tag.name}" applies to levels:`, levelsWithTag.map(l => l.level));
                    }

                    // Check if player completed ALL levels with this tag
                    const completedAll = levelsWithTag.length > 0 &&
                        levelsWithTag.every(l => completedLevels.has(l.level));

                    if (completedAll) {
                        const bonus = Number(tag.scoreValue) || 0;
                        entry.tagBonuses.push({ name: tag.name, bonus });
                        totalBonus += bonus;
                        console.log(`✅ Player ${entry.user} earned bonus for tag "${tag.name}" (+${bonus})`);
                    }
                });

                entry.total += totalBonus;
            });

            console.log("Tag bonuses applied:", this.leaderboard.map(e => e.tagBonuses));
        }
    },
};

