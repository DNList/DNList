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

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function updatePlayerGraphs() {
    console.log('🔄 Updating player graph snapshots...\n');
    console.log(`📅 Date: ${getCurrentDate()}\n`);

    const listPath = path.join(__dirname, 'data', '_list.json');
    const list = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

    const snapshotPath = path.join(__dirname, 'data', '_point_snapshots.json');
    let snapshots = { snapshots: [] };
    
    // Cargar snapshots existentes
    if (fs.existsSync(snapshotPath)) {
        snapshots = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }

    const currentDate = getCurrentDate();
    const playerPoints = {}; // { "PlayerName": { "LevelName": points } }

    console.log('📊 Calculating current points for all players...\n');

    // Calcular puntos actuales para todos los jugadores
    for (let rank = 0; rank < list.length; rank++) {
        const levelPath = path.join(__dirname, 'data', `${list[rank]}.json`);
        
        if (!fs.existsSync(levelPath)) continue;

        const level = JSON.parse(fs.readFileSync(levelPath, 'utf-8'));
        const levelName = level.name;

        // Verificador
        if (level.verifier) {
            const verifier = level.verifier;
            playerPoints[verifier] ??= {};
            playerPoints[verifier][levelName] = {
                points: score(rank + 1, 100, level.percentToQualify || 50),
                type: 'verified'
            };
        }

        // Records
        if (level.records && Array.isArray(level.records)) {
            level.records.forEach(record => {
                const user = record.user;
                playerPoints[user] ??= {};
                playerPoints[user][levelName] = {
                    points: score(rank + 1, record.percent, level.percentToQualify || 50),
                    type: record.percent === 100 ? 'completed' : 'progressed',
                    percent: record.percent
                };
            });
        }
    }

    // Crear snapshot del día
    const newSnapshot = {
        date: currentDate,
        players: {}
    };

    // Calcular total por jugador
    for (const [player, levels] of Object.entries(playerPoints)) {
        const total = Object.values(levels).reduce((sum, data) => sum + data.points, 0);
        newSnapshot.players[player] = {
            total: round(total),
            levelCount: Object.keys(levels).length,
            levels: levels
        };
    }

    // Verificar si ya existe snapshot para hoy
    const existingIndex = snapshots.snapshots.findIndex(s => s.date === currentDate);
    if (existingIndex !== -1) {
        console.log('⚠️  Snapshot for today already exists. Replacing...\n');
        snapshots.snapshots[existingIndex] = newSnapshot;
    } else {
        snapshots.snapshots.push(newSnapshot);
    }

    // Ordenar por fecha
    snapshots.snapshots.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Guardar
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshots, null, 2), 'utf-8');

    console.log(`✅ Snapshot saved with ${Object.keys(newSnapshot.players).length} players`);
    console.log(`📊 Total snapshots: ${snapshots.snapshots.length}`);
    
    if (snapshots.snapshots.length > 1) {
        console.log(`📅 Date range: ${snapshots.snapshots[0]?.date} to ${snapshots.snapshots[snapshots.snapshots.length - 1]?.date}`);
    }
    
    console.log('\n🎉 Done!\n');
}

updatePlayerGraphs().catch(console.error);