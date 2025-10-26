export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        status: {
            type: string,
            required: true,
        },
        firstvictor: {
            type: String,
            required: true,
        },
    },
    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Status</div>
                <p class="type-body">
                    <span>{{ status }}</span>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ firstvictor }}</span>
                </p>
            </template>
            <div class="type-title-sm">Publisher</div>
            <p class="type-body">
                <span>{{ author }}</span>
            </p>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.status === this.firstvictor;
        },
    },
};
