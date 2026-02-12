const fs = require('fs');
const path = require('path');

const scale = 3;

function score(rank, percent, minPercent) {
    if (rank > 150) {
        return 0;
    }
    if (rank > 75 && percent < 100) {
        return 0;
    }

    let score = (-24.9975 * Math.pow(rank - 1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
}

function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}

function loadTags() {
    const tagsPath = path.join(__dirname, 'js', 'components', 'List', 'Tags.js');
    
    if (!fs.existsSync(tagsPath)) {
        console.warn('⚠️  Tags.js not found, tag bonuses will not be calculated');
        return [];
    }
    
    try {
        const tagsContent = fs.readFileSync(tagsPath, 'utf-8');
        const match = tagsContent.match(/export\s+default\s+(\[[\s\S]*?\]);/);
        if (match) {
            const tags = eval(match[1]);
            return tags.filter(tag => tag.bonusEnabled);
        }
    } catch (error) {
        console.warn('⚠️  Could not parse Tags.js:', error.message);
    }
    
    return [];
}

function calculateTagBonuses(playerPoints, allLevels, tags) {
    const playerBonuses = {};
    
    Object.keys(playerPoints).forEach(player => {
        const completedLevels = new Set(
            Object.keys(playerPoints[player]).filter(
                levelName => playerPoints[player][levelName].type === 'verified' ||
                             playerPoints[player][levelName].type === 'completed'
            )
        );
        
        let totalBonus = 0;
        const bonusDetails = [];
        
        tags.forEach(tag => {
            const levelsWithTag = allLevels.filter(level =>
                Array.isArray(level.tags) &&
                level.tags.some(t =>
                    String(t).toLowerCase() === tag.id.toLowerCase() ||
                    String(t).toLowerCase() === tag.name.toLowerCase()
                )
            );
            
            if (levelsWithTag.length === 0) return;
            
            const totalLevelScore = levelsWithTag.reduce((sum, level) => {
                const lvlScore = score(level.rank, 100, level.percentToQualify || 50);
                return sum + lvlScore;
            }, 0);
            
            const averageLevelScore = totalLevelScore / (levelsWithTag.length * 2);
            const bonus = round(averageLevelScore);
            
            const completedAll = levelsWithTag.every(l => completedLevels.has(l.name));
            
            if (completedAll && bonus > 0) {
                bonusDetails.push({ name: tag.name, bonus });
                totalBonus += bonus;
            }
        });
        
        if (totalBonus > 0) {
            playerBonuses[player] = {
                total: round(totalBonus),
                bonuses: bonusDetails
            };
        }
    });
    
    return playerBonuses;
}

async function generateInitialSnapshot() {
    console.log('📸 Generating initial snapshot with pointsEarned and tag bonuses...\n');

    const listPath = path.join(__dirname, 'data', '_list.json');
    const list = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

    let updatedCount = 0;
    const playerPoints = {};
    const allLevels = [];

    console.log('Step 1: Adding pointsEarned to level files...\n');

    for (let rank = 0; rank < list.length; rank++) {
        const levelPath = path.join(__dirname, 'data', `${list[rank]}.json`);
        
        if (!fs.existsSync(levelPath)) {
            console.log(`⚠️  File not found: ${list[rank]}.json`);
            continue;
        }

        const level = JSON.parse(fs.readFileSync(levelPath, 'utf-8'));
        let modified = false;

        // Store level metadata
        allLevels.push({
            name: level.name,
            rank: rank + 1,
            tags: level.tags || [],
            percentToQualify: level.percentToQualify || 50
        });

        // ✅ AGREGAR PUNTOS DE VERIFICACIÓN
        if (level.verifier && level.verificationPointsEarned === undefined) {
            const points = score(rank + 1, 100, level.percentToQualify || 50);
            level.verificationPointsEarned = points;
            modified = true;
            console.log(`  ✓ Verification points for ${level.verifier}: ${points}`);

            // Track for tag bonus calculation
            playerPoints[level.verifier] = playerPoints[level.verifier] || {};
            playerPoints[level.verifier][level.name] = {
                points: points,
                type: 'verified'
            };
        } else if (level.verifier) {
            // Track existing verification
            playerPoints[level.verifier] = playerPoints[level.verifier] || {};
            playerPoints[level.verifier][level.name] = {
                points: level.verificationPointsEarned,
                type: 'verified'
            };
        }

        // Procesar records (completions y progressed)
        if (level.records && Array.isArray(level.records)) {
            level.records.forEach(record => {
                if (record.pointsEarned === undefined) {
                    const points = score(rank + 1, record.percent, level.percentToQualify || 50);
                    record.pointsEarned = points;
                    modified = true;
                }

                // Track for tag bonus calculation
                playerPoints[record.user] = playerPoints[record.user] || {};
                playerPoints[record.user][level.name] = {
                    points: record.pointsEarned,
                    type: record.percent === 100 ? 'completed' : 'progressed',
                    percent: record.percent
                };
            });
        }

        // Guardar si hubo cambios
        if (modified) {
            fs.writeFileSync(levelPath, JSON.stringify(level, null, 4), 'utf-8');
            console.log(`✅ Updated: ${level.name} (Rank #${rank + 1}) - Verifier + ${level.records?.length || 0} records`);
            updatedCount++;
        }
    }

    console.log(`\n✅ Step 1 complete! Updated ${updatedCount} levels with pointsEarned.`);
    console.log('⚠️  IMPORTANT: Do NOT delete the "date" or "verificationDate" fields!\n');

    // Step 2: Calculate tag bonuses
    console.log('Step 2: Calculating tag bonuses...\n');
    const tags = loadTags();
    
    if (tags.length === 0) {
        console.log('⚠️  No tags with bonusEnabled found. Skipping tag bonus calculation.\n');
        console.log('🎉 Done!\n');
        return;
    }

    const tagBonuses = calculateTagBonuses(playerPoints, allLevels, tags);

    console.log(`\n📊 Tag Bonus Summary:`);
    console.log(`   Tags with bonuses enabled: ${tags.length}`);
    console.log(`   Players earning bonuses: ${Object.keys(tagBonuses).length}\n`);

    Object.entries(tagBonuses).forEach(([player, data]) => {
        console.log(`  ${player}: +${data.total} points from ${data.bonuses.length} pack(s)`);
        data.bonuses.forEach(bonus => {
            console.log(`    • ${bonus.name}: +${bonus.bonus}`);
        });
    });

    console.log('\n🎉 Done!\n');
}

generateInitialSnapshot().catch(console.error);