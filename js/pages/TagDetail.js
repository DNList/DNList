import { store } from "../main.js";
import { fetchList } from "../content.js";
import tags from "../components/List/Tags.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading" class="page-tags-detail">
            <Spinner />
        </main>
        <main v-else class="page-tags-detail">
            <button @click="goBack" class="back-button">&larr; Back to Tags</button>
            <h1>{{ tag.name }}</h1>
            <p>{{ tag.description }}</p>

            <h2>Levels with this tag</h2>
            <table class="list">
                <tr v-for="level in levelsWithTag" :key="level.id">
                    <td class="level">
                        <button @click="selectLevel(level)">
                            {{ level.name }}
                        </button>
                    </td>
                    <td class="author">
                        {{ level.author }}
                    </td>
                </tr>
            </table>
        </main>
    `,
    data: () => ({
        loading: true,
        list: [],
        levelsWithTag: [],
        tag: null,
    }),
    async mounted() {
        const tagId = this.$route.params.tagId; // use Vue Router param
        this.list = await fetchList();

        this.tag = tags.find(t => t.id === tagId);

        if (this.tag) {
            this.levelsWithTag = this.list
                .filter(([level]) => level?.tags?.includes(this.tag.name))
                .map(([level]) => level);
        }

        this.loading = false;
    },
    methods: {
        goBack() {
            this.$router.push("/tags"); // SPA-friendly back
        },
        selectLevel(level) {
            this.$router.push(`/list#${level.id}`);
        }
    }
};
