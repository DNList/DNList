export default {
  name: "ChangelogPage",
  data() {
    return {
      changelog: [
        {
          date: "2025-10-27",
          message: "• Updated 'Calamity' to #2 on the list.\n• Fixed incorrect record on 'Luna'.",
          featured: true
        },
        {
          date: "2025-10-20",
          message: "• Added new level 'Spectrum'."
        },
        {
          date: "2025-10-15",
          message: "• Fixed leaderboard loading issue."
        },
        {
          date: "2025-10-10",
          message: "• Initial release of DNList v1.0.0."
        }
      ]
    };
  },
  template: `
    <div class="page-changelog-container">
      <div class="page-changelog">
        <div class="changelog-container">
          <div
            v-for="(entry, index) in changelog"
            :key="index"
            :class="['changelog-entry', { featured: entry.featured }]"
          >
            <div class="date">{{ entry.date }}</div>
            <div class="message" v-html="entry.message.replace(/\\n/g, '<br>')"></div>
          </div>
        </div>
      </div>
    </div>
  `
};

