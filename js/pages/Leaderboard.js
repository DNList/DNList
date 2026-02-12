import { fetchLeaderboard } from '../content.js';
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
        chartInitialized: false, // Añade esto
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
                            <td class="rank"><p class="type-label-lg">#{{ i + 1 }}</p></td>
                            <td class="total"><p class="type-label-lg">{{ localize(ientry.total) }}</p></td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i"><span class="type-label-lg">{{ ientry.user }}</span></button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container" v-if="entry">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>

                        <div class="graph-container">
                            <canvas id="pointsChart"></canvas>
                        </div>

                        <!-- Resto de tu template igual -->
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

            const events = [
                ...(this.entry.verified || []),
                ...(this.entry.completed || []),
            ]
            .filter(e => e && e.date) // Verifica que e exista y tenga date
            .sort((a, b) => new Date(a.date) - new Date(b.date));

            let total = 0;
            return events.map(e => {
                total += (e.score || 0);
                return {
                    date: e.date,
                    total
                };
            });
        },
        noProgress() {
            if (!this.entry || !this.allLevels) return [];
            const attempted = new Set([
                ...(this.entry.verified || []).map(l => l?.level),
                ...(this.entry.completed || []).map(l => l?.level),
                ...(this.entry.progressed || []).map(l => l?.level),
            ].filter(Boolean));
            
            return this.allLevels.filter(l => !attempted.has(l.level));
        }
    },
    watch: {
        selected() {
            this.$nextTick(() => {
                if (window.Chart) {
                    this.renderChart();
                }
            });
        }
    },
    async mounted() {
        // Verifica que Chart.js esté cargado
        if (typeof window.Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            // Opcional: carga Chart.js dinámicamente
            await this.loadChartJS();
        }

        const [leaderboard, err, allLevels] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        this.allLevels = allLevels;
        this.applyTagBonuses();

        // Verifica query params
        if (this.$route?.query?.player) {
            const index = this.leaderboard.findIndex(
                entry => entry.user.toLowerCase() === this.$route.query.player.toLowerCase()
            );
            if (index !== -1) {
                this.selected = index;
            }
        }

        this.loading = false;
        this.$nextTick(() => {
            if (window.Chart) {
                this.renderChart();
            }
        });
    },
    methods: {
        localize,
        
        // Método para cargar Chart.js dinámicamente si no está disponible
        async loadChartJS() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        renderChart() {
            // Verifica que Chart esté disponible
            if (typeof window.Chart === 'undefined') {
                console.error('Chart.js no está disponible');
                return;
            }

            const canvas = document.getElementById('pointsChart');
            if (!canvas) {
                console.warn('Canvas element not found');
                return;
            }

            const pointsData = this.pointsOverTime;
            if (pointsData.length === 0) {
                // Oculta o muestra mensaje si no hay datos
                canvas.style.display = 'none';
                return;
            }

            canvas.style.display = 'block';

            if (chart) {
                chart.destroy();
            }

            try {
                chart = new window.Chart(canvas, {
                    type: 'line',
                    data: {
                        labels: pointsData.map(p => this.formatDate(p.date)),
                        datasets: [{
                            label: 'Puntos acumulados',
                            data: pointsData.map(p => p.total),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.25,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { 
                                display: false 
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        return `Puntos: ${context.parsed.y}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Fecha'
                                },
                                ticks: {
                                    maxRotation: 45,
                                    minRotation: 45
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Puntos totales'
                                },
                                ticks: {
                                    precision: 0
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error al renderizar el gráfico:', error);
            }
        },

        // Helper para formatear fechas
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('es', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric'
            });
        },

        applyTagBonuses() {
            if (!this.leaderboard || !this.allLevels) return;
            
            console.log("Applying tag bonuses...");
            this.leaderboard.forEach(entry => {
                const completedLevels = new Set([
                    ...(entry.completed || []).map(l => l?.level),
                    ...(entry.verified || []).map(l => l?.level),
                ].filter(Boolean));

                entry.tagBonuses = [];
                let totalBonus = 0;

                tags.forEach(tag => {
                    if (!tag.bonusEnabled) return;

                    const levelsWithTag = this.allLevels.filter(l =>
                        Array.isArray(l.tags) &&
                        l.tags.some(t =>
                            String(t).toLowerCase() === tag.id?.toLowerCase() ||
                            String(t).toLowerCase() === tag.name?.toLowerCase()
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
                    }
                });

                entry.total = (entry.total || 0) + totalBonus;
                entry.total = Math.round(entry.total * 1000) / 1000;
            });
        }
    }
};