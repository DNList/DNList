import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function generateInitialSnapshot() {
    console.log('📸 Generating initial snapshot with pointsEarned...\n');

    const listPath = path.join(__dirname, 'data', '_list.json');
    const list = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

    let updatedCount = 0;

    for (let rank = 0; rank < list.length; rank++) {
        const levelPath = path.join(__dirname, 'data', `${list[rank]}.json`);
        
        if (!fs.existsSync(levelPath)) {
            console.log(`⚠️  File not found: ${list[rank]}.json`);
            continue;
        }

        const level = JSON.parse(fs.readFileSync(levelPath, 'utf-8'));
        let modified = false;

        // ✅ AGREGAR PUNTOS DE VERIFICACIÓN
        if (level.verifier && level.verificationPointsEarned === undefined) {
            const points = score(rank + 1, 100, level.percentToQualify || 50);
            level.verificationPointsEarned = points;
            modified = true;
            console.log(`  ✓ Verification points for ${level.verifier}: ${points}`);
        }

        // Procesar records (completions y progressed)
        if (level.records && Array.isArray(level.records)) {
            level.records.forEach(record => {
                if (record.pointsEarned === undefined) {
                    const points = score(rank + 1, record.percent, level.percentToQualify || 50);
                    record.pointsEarned = points;
                    modified = true;
                }
            });
        }

        // Guardar si hubo cambios
        if (modified) {
            fs.writeFileSync(levelPath, JSON.stringify(level, null, 4), 'utf-8');
            console.log(`✅ Updated: ${level.name} (Rank #${rank + 1}) - Verifier + ${level.records?.length || 0} records`);
            updatedCount++;
        }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} levels with pointsEarned.`);
    console.log('⚠️  IMPORTANT: Do NOT delete the "date" or "verificationDate" fields!');
}

generateInitialSnapshot().catch(console.error);