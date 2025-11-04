import { store } from "../main.js";
import { fetchList } from "../content.js";
import tags from "../components/List/Tags.js";
import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },
    template: `
        <main v-if="loading">
            <Spinner />
        </main>
        <main v-else class="page-list">
            <h1>All Tags</h1>
            <div class="tags-overview">
                <div 
                    v-for="tag in tags" 
                    :key="tag.id" 
                    class="tag-card"
                    :style="{ backgroundColor: tag.color }"
                    @click="selectTag(tag.id)"
                >
                    <h3>{{ tag.name }}</h3>
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
        selectTag(tagId) {
            // Go to the detail view of the tag
            window.location.href = `/tags/${tagId}`;
        }
    }
};
