import { store } from "../main.js";
import { fetchList } from "../content.js";
import tags from "../components/List/Tags.js";
import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },
    template: `
        <main v-if="loading" class="page-tags">
            <Spinner />
        </main>
        <main v-else class="page-tags">
            <div class="tags-header">
                <h1>All Tags</h1>
            </div>
            <div class="tags-overview">
                <div 
                    v-for="tag in tags" 
                    :key="tag.id" 
                    class="tag-card"
                    :style="{ backgroundColor: tag.color }"
                    @click="selectTag(tag.id)"
                >
                <h3 class="tag-card-title">
                    <img
                        v-if="isDemonTag(tag)"
                        :src="demonIcon(tag)"
                        class="demon-icon-sm"
                        alt=""
                    />
                    <span v-if="tag.bonusEnabled">🏅{{ tag.name }}🏅</span>
                    <span v-else>{{ tag.name }}</span>
                </h3>
                    <p>{{ tag.description }}</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: true,
        list: [],
        tags,
    }),
    async mounted() {
        this.list = await fetchList();
        this.loading = false;
    },
    methods: {
        isDemonTag(tag) {
            return tag?.id?.endsWith("_demon");
        },
        demonIcon(tag) {
            return `/assets/${tag.id}.png`;
        },
        selectTag(tagId) {
            // Use Vue Router instead of window.location
            this.$router.push(`/tags/${tagId}`);
        }
    }
};

