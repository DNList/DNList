export default {
  name: "ChangelogPage",
  data() {
    return {
      changelog: [],
      error: null
    };
  },
  async created() {
    try {
      const response = await fetch("/api/changelog");
      if (!response.ok) throw new Error("Failed to fetch changelog.");
      this.changelog = await response.json();
    } catch (err) {
      this.error = err.message;
    }
  },
  template: `
    <div class="page-changelog-container">
      <div class="page-changelog">
        <div v-if="error" class="error-container">
          <div class="error">{{ error }}</div>
        </div>

        <div class="changelog-container">
          <p v-if="!error && changelog.length === 0">Loading changelog entries...</p>

          <div
            v-for="(entry, index) in changelog"
            :key="index"
            :class="['changelog-entry', { featured: entry.featured }]"
          >
            <div class="date">{{ entry.date }}</div>
            <div class="message">{{ entry.message }}</div>
          </div>
        </div>
      </div>
    </div>
  `
};
