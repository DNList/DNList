import { fetchLeaderboard, fetchPlayerHistory } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import tags from "../components/List/Tags.js";
import { score } from '../score.js';

let chart = null;

export default {
    components: { Spinner },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        allLevels: [],
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

                        <div class="graph-container">
                            <canvas id="pointsChart"></canvas>
                        </div>


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

                        <h2 v-if="entry.tagBonuses && entry.tagBonuses.length > 0">Bonus Pack points ({{ entry.tagBonuses.length }})</h2>
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

        pointsOverTime() {
            if (!this.entry) return [];

            // Si existe historial guardado de snapshots, úsalo (muestra cambios reales)
            if (this.entry.history && this.entry.history.length > 0) {
                return this.entry.history;
            }

            // Fallback: calcular con logros individuales (para antes del primer snapshot)
            const events = [
                ...this.entry.verified,
                ...this.entry.completed,
            ]
            .filter(e => e.date)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

            const groupedByDate = {};
            let cumulativeTotal = 0;

            events.forEach(e => {
                cumulativeTotal += e.score;
                groupedByDate[e.date] = cumulativeTotal;
            });

            return Object.entries(groupedByDate).map(([date, total]) => ({
                date,
                total
            }));
        },

        noProgress() {
            if (!this.entry || !this.allLevels) return [];
            const attempted = new Set([
                ...this.entry.verified.map(l => l.level),
                ...this.entry.completed.map(l => l.level),
                ...this.entry.progressed.map(l => l.level),
            ]);
            return this.allLevels.filter(l => !attempted.has(l.level));
        }
    },

    watch: {
        selected() {
            this.$nextTick(this.renderChart);
        }
    },

    async mounted() {
        const [leaderboard, err, allLevels] = await fetchLeaderboard();
        
        // Cargar historial de snapshots para cada jugador
        for (const entry of leaderboard) {
            entry.history = await fetchPlayerHistory(entry.user);
        }
        
        this.leaderboard = leaderboard;
        this.err = err;
        this.allLevels = allLevels;
        this.applyTagBonuses();

        const playerFromQuery = this.$route.query.player;
        if (playerFromQuery) {
            const index = this.leaderboard.findIndex(
                entry => entry.user.toLowerCase() === playerFromQuery.toLowerCase()
            );
            if (index !== -1) {
                this.selected = index;
            }
        }

        this.loading = false;
        this.$nextTick(this.renderChart);
    },

    methods: {
        localize,

        renderChart() {
            const canvas = document.getElementById('pointsChart');
            if (!canvas || this.pointsOverTime.length === 0) return;

            if (chart) chart.destroy();

            chart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: this.pointsOverTime.map(p => p.date),
                    datasets: [
                        {
                            data: this.pointsOverTime.map(p => p.total),
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.25
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        },

        applyTagBonuses() {
            console.log("Applying tag bonuses...");
            this.leaderboard.forEach(entry => {
                const completedLevels = new Set([
                    ...entry.completed.map(l => l.level),
                    ...entry.verified.map(l => l.level),
                ]);

                entry.tagBonuses = [];
                let totalBonus = 0;

                tags.forEach(tag => {
                    if (!tag.bonusEnabled) return;

                    const levelsWithTag = this.allLevels.filter(l =>
                        Array.isArray(l.tags) &&
                        l.tags.some(t =>
                            String(t).toLowerCase() === tag.id.toLowerCase() ||
                            String(t).toLowerCase() === tag.name.toLowerCase()
                        )
                    );

                    if (levelsWithTag.length === 0) return;

                    const totalLevelScore = levelsWithTag.reduce((sum, level) => {
                        const lvlScore = score(level.rank, 100, level.percentToQualify || 50);
                        return sum + lvlScore;
                    }, 0);

                    const averageLevelScore = totalLevelScore / (levelsWithTag.length * 2);

                    const bonus = Math.round(averageLevelScore * 1000) / 1000;

                    const completedAll = levelsWithTag.every(l => completedLevels.has(l.level));

                    if (completedAll && bonus > 0) {
                        entry.tagBonuses.push({ name: tag.name, bonus });
                        totalBonus += bonus;
                        console.log(`✅ Player ${entry.user} earned ${bonus} bonus points for "${tag.name}"`);
                    }
                });

                entry.total += totalBonus;
                entry.total = Math.round(entry.total * 1000) / 1000;
            });
        }
    },
};