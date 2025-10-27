export default {
  name: "ChangelogPage",
  data() {
    return {
      changelog: [
        {
          date: "2025-10-27",
          message:
            "• Updated 'Calamity' to #2 on the list.<br>• Fixed incorrect record on 'Luna'.",
          featured: true,
        },
        {
          date: "2025-10-20",
          message: "• Added new level 'Spectrum'.",
        },
        {
          date: "2025-10-15",
          message: "• Fixed leaderboard loading issue.",
        },
        {
          date: "2025-10-10",
          message: "• Initial release of DNList v1.0.0.",
        },
      ],
    };
  },
  template: `
    <main class="page-changelog-container">
      <div class="page-changelog">
        <div class="changelog-container">
          <div
            v-for="(entry, index) in changelog"
            :key="index"
            :class="['changelog-entry', { featured: entry.featured }]"
          >
            <p class="type-label-lg changelog-date">{{ entry.date }}</p>
            <p class="changelog-message" v-html="entry.message"></p>
          </div>
        </div>
      </div>
    </main>
  `,
};

