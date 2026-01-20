export default {
  name: "ChangelogPage",
  data() {
    return {
      changelog: [
        {
          date: "20-01-2026",
          message: `
            • Release of the DNList v1.4.3.<br>
            • Records have been reworked once again.<br>
            • Clicking on the profile icon on a record will take you to their profile in the leaderboard.<br>
            • Now, records with video proof will have a clickable youtube icon on the right, instead of by clicking the name.<br>
          `,
          featured: true,
        },
        {
          date: "15-01-2026",
          message: `
            • Release of the DNList v1.4.2.<br>
            • Clicking on the verifier's name on a level will take you to their profile in the leaderboard.<br>
          `,
          featured: true,
        },
        {
          date: "14-01-2026",
          message: `
            • Release of the DNList v1.4.1.<br>
            • Added subtitles in all levels, which will be a selected phrase from the verifier.<br>
            • Added phrases to all records.<br>
          `,
          featured: true,
        },
        {
          date: "14-01-2026",
          message: `
            • Release of the DNList v1.4.0.<br>
            • Added a link to the discord icon.<br>
            • Added the position history to all levels.<br>
            • Set all start of position histories to 14-01-2026 with reason "Added the position history"<br>
            • Set the "Added Falling Up (#1)" to 14-01-2026 to show as an example, even if it was added on 3-01-2026.<br>
          `,
          featured: true,
        },
        {
          date: "10-01-2026",
          message: `
            • Release of the DNList v1.3.2.<br>
            • Fixed the inconsistencies between the tags page and the changelog.<br>
            • "Layout" tag has been changed to "Unrated".<br>
          `,
          featured: true,
        },
        {
          date: "3-01-2026",
          message: `
            • Falling Up has been placed at #1, above Doradura with a list requirement of 50%.<br>
          `,
          featured: true,
        },
        {
          date: "20-12-2025",
          message: `
            • Acropolis has been placed at #6, between Acu and and Future Funk II, with a list requirement of 64%.<br>
          `,
          featured: true,
        },
        {
          date: "6-11-2025",
          message: `
            • Arre Robot (2P) has been placed at #19 on the list, between One Space and Sakupen Egg, with a list requirement of 72%.<br>
            • Depressure has been placed at #25 on the list, between A Pretty Easy Demon and B, with a list requirement of 74%.<br>
          `,
          featured: true,
        },
        {
          date: "5-11-2025",
          message: `
            • Release of the DNList v1.3.0.<br>
            • Added the "Tags" page, which shows all the different tags that are displayed on the list levels. Each tag can be clicked to see a brief description and see all the levels which contain it. This can be accesed through the Tags page or clicking a tag in a level. When clicking a level in an specific tag, it will also take you to the level.<br>
            • Added the packs, which are specific tags that gives bonus points if a player has completed all levels with that tag. It can be distinguished by the name and the 🏅 emoji.<br>
            • Added the "Bonus Pack points" section in the leaderboard.<br>
            • FortnitePixelDash17 has been placed at #20 on the list, between Sakupen Egg and Verity, with a list requirement of 73%.<br>
          `,
          featured: true,
        },
        {
          date: "4-11-2025",
          message: `
            • Release of the DNList v1.2.1.<br>
            • Added "Tags" to some levels in the list<br>
          `,
          featured: true,
        },
        {
          date: "3-11-2025",
          message: `
            • Release of the DNList v1.2.0.<br>
            • Removed the "Creators" and "Password" field from levels.<br>
            • Added the "Runs" page, which will show an alternate list that only includes non beaten levels with considerable progress in it. It will also show the expected placement on the list if it were verified.<br>
            • Added runs to the list:<br>
            (#1) Moment<br>
            (#2) Bloodbath<br>
            (#3) Redeemer<br>
            (#4) Falling Up<br>
          `,
          featured: true,
        },
        {
          date: "28-10-2025",
          message: `
            • Release of the DNList v1.1.1.<br>
            • Added the "No progress" section in the leaderboard.<br>
            • After pressing the "Submit Record" button, it now redirects into sending an email to the list.
          `,
          featured: true,
        },
        {
          date: "28-10-2025",
          message: `
            • Added levels to the list:<br>
            (#17) Ultra Violence<br>
            (#18) One Space<br>
            (#19) Sakupen Egg<br>
            (#20) Verity<br>
            (#21) Celestia<br>
            (#26) Theory Of Everything 2<br>
            (#27) Swift Horizon<br>
            (#28) Printer Noises<br>
            (#29) Hell And Heaven<br>
            (#30) Hello Fitzgerald<br>
            (#31) Clubstep<br>
            This moves A Pretty Easy Demon, B, Deadlocked, and Shapes And Beats down to #22–25.<br>
            • Shapes And Beats has been swapped with Deadlocked, leaving SAB at #24 and Deadlocked at #25.
          `,
          featured: true,
        },
        {
          date: "28-10-2025",
          message: `
            • DNList's domain has been properly verified.<br>
            • All list level's qualifying percent have been tweaked. Now the required progress should be more accessible and rewarding for list points.<br>
          `,
          featured: true,
        },
        {
          date: "27-10-2025",
          message: `
            • Release of the DNList v1.1.0. Added the changelog page.<br>
            • Future Funk has been raised from #15 to #11, below Double Dash and above Multition (2P).
          `,
          featured: true,
        },
        {
          date: "27-10-2025",
          message: `
            • Added levels to the list:<br>
            (#6) Future Funk II<br>
            (#7) Game Time<br>
            (#8) Magma Bound<br>
            (#9) Stalemate<br>
            (#10) Double Dash<br>
            (#11) Multition (2P)<br>
            (#12) Nine Circles<br>
            (#13) Forsaken Neon<br>
            (#14) White Women<br>
            (#15) Future Funk<br>
            (#16) Megalovania<br>
            (#17) A Pretty Easy Demon<br>
            (#18) B<br>
            (#19) Deadlocked<br>
            (#20) Shapes And Beats
          `,
          featured: true,
        },
        {
          date: "26-10-2025",
          message: `
            • Initial release of DNList v1.0.0.<br>
            • Added levels to the list:<br>
            (#1) Doradura<br>
            (#2) Mizureta<br>
            (#3) Niwa<br>
            (#4) Troll Level<br>
            (#5) Acu
          `,
          featured: true,
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
