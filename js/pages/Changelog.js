export default {
  name: "ChangelogPage",
  data() {
    return {
      changelog: [
        {
          date: "28-10-2025",
          message: "• DNList's domain has been property verified.<br>• All list level's qualifying percent have been tweaked. Now the required progress should be more accesible and rewarding for list points.<br>•Added levels to the list:<br>(#17) Ultra Violence<br>(#18) One Space<br>(#19) Sakupen egg<br>(#20) Verity<br>(#21) Celestia<br>(#25) Swift Horizon<br>(#26) Printer Noises<br>(#27) Hell and Heaven<br>(#28) Hello fitzgerald<br> This moves the A Pretty Easy Demon-Shapes and Beats block down to #21-24<br>• Shapes And Beats has been raised from #24 to #23, below B and above Deadlocked."
          featured: true,
        },
        {
          date: "27-10-2025",
          message: "• Release of the DNList v1.1.0. Added the changelog page.<br>• Future Funk has been raised from #15 to #11, below Double Dash and above Multition (2P).",
          featured: true,
        },
        {
          date: "27-10-2025",
          message:
            "• Added levels to the list: <br>(#6) Future Funk II<br>(#7) Game Time<br>(#8) Magma Bound<br>(#9) Stalemate<br>(#10) Double Dash<br>(#11) Multition (2P)<br>(#12) Nine Circles<br>(#13) Forsaken Neon<br>(#14) White Women<br>(#15) Future Funk<br>(#16) Megalovania<br>(#17) A Pretty Easy Demon<br>(#18) B<br>(#19) Deadlocked<br>(#20) Shapes And Beats",
          featured: true,
        },
        {
          date: "26-10-2025",
          message: "• Initial release of DNList v1.0.0.<br>• Added levels to the list:<br>(#1) Doradura<br>(#2) Mizureta<br>(#3) Niwa<br>(#4) Troll Level<br>(#5) Acu",
          featured: true
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

