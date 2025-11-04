import { store } from "../main.js";
import { fetchList } from "../content.js";
import tags from "../components/List/Tags.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading" class="page-tag-detail-container">
            <Spinner />
        </main>

        <main v-else class="page-tag-detail-container">
            <div class="page-tag-detail" :style="{ backgroundColor: tag?.color || 'var(--color-primary)' }">
                <button @click="goBack" class="back-button">&larr; Back</button>
                
                <h1 class="tag-title">{{ tag?.name }}</h1>
                
                <!-- NEW: Wrapper div for description and score cards -->
                <div class="tag-info-cards">
                    <p class="tag-desc">• {{ tag?.description }}</p>
                    <p class="tag-score">• Score: {{ tag?.scoreValue }}</p>
                </div>

                <section class="levels-container">
                    <h2>Levels with this tag</h2>
                    <table class="list tag-detail-list">
                        <tbody>
                            <tr v-for="level in levelsWithTag" :key="level.id">
                                <td class="level">
                                    <button @click="selectLevel(level)" class="list-level-btn">
                                        {{ level.name }} by {{ level.author }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    `,
    data: () => ({
        loading: true,
        list: [],
        levelsWithTag: [],
        tag: null,
    }),
    async mounted() {
        const tagId = this.$route.params.tagId;
        this.list = await fetchList();

        this.tag = tags.find(t =>
            t.id.toLowerCase() === String(tagId).toLowerCase() ||
            t.name.toLowerCase() === String(tagId).toLowerCase()
        );

        if (this.tag && this.list) {
            this.levelsWithTag = this.list
                .map(([level]) => level)
                .filter(level =>
                    Array.isArray(level.tags) && level.tags.some(t =>
                        String(t).toLowerCase() === this.tag.id.toLowerCase() ||
                        String(t).toLowerCase() === this.tag.name.toLowerCase()
                    )
                );
        } else {
            this.levelsWithTag = [];
        }

        this.loading = false;
    },

    methods: {
        goBack() {
            this.$router.push("/tags");
        },
        selectLevel(level) {
            this.$router.push(`/list#${level.id}`);
        }
    }
};