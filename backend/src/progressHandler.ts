
import { Router } from 'express';

const router = Router();

// stretch unlock requirements
const stretchRequirements = [
    {
        id: 'right-split-stretch',
        name: 'Right Split Stretch',
        requiredMinutes: 150,
        requiredStreakDays: 7,
        requiredMobilityLevel: 3
    },
    {
        id: 'standing-quad-stretch',
        name: 'Standing Quad Stretch',
        requiredMinutes: 30,
        requiredStreakDays: 3,
        requiredMobilityLevel: 1
    },
    {
        id: 'toe-touch-stretch',
        name: 'Butterfly Stretch',
        requiredMinutes: 60,
        requiredStreakDays: 0,
        requiredMobilityLevel: 2
    },
    {
        id: 'left-split-opener',
        name: 'Left Split Stretch',
        requiredMinutes: 150,
        requiredStreakDays: 7,
        requiredMobilityLevel: 3
    },
    {
        id: 'full-split-stretch',
        name: 'Full Split Stretch',
        requiredMinutes: 300,
        requiredStreakDays: 14,
        requiredMobilityLevel: 5
    }
];

// evaluate whether a user meets each stretch's requirements
function evaluateProgress(
    totalMinutes: number,
    streakDays: number,
    mobilityLevel: number,
    alreadyUnlocked: string[]
) {
    const eligibleStretches = stretchRequirements.filter((stretch) => { // eligibleStretches is array of requirements
        return (
            totalMinutes >= stretch.requiredMinutes &&
            streakDays >= stretch.requiredStreakDays &&
            mobilityLevel >= stretch.requiredMobilityLevel
        );
    });

    // exclude stretches the user has already unlocked
    const newlyUnlocked = eligibleStretches.filter(
        (stretch) => !alreadyUnlocked.includes(stretch.id)
    );

    return {
        eligibleStretches,
        newlyUnlocked
    };
}

// POST /api/progress/evaluate
// evaluate user progress after a stretching session
router.post('/evaluate', (req, res) => {
    const {
        totalMinutes,
        streakDays,
        mobilityLevel,
        alreadyUnlocked = []
    } = req.body ?? {};

    // Validate user progress information
    if (
        !Number.isInteger(totalMinutes) ||
        !Number.isInteger(streakDays) ||
        !Number.isInteger(mobilityLevel) ||
        totalMinutes < 0 ||
        streakDays < 0 ||
        mobilityLevel < 1 ||
        mobilityLevel > 5 ||
        !Array.isArray(alreadyUnlocked) ||
        !alreadyUnlocked.every((id: unknown) => typeof id === 'string')
    ) {
        res.status(400).json({  // 400 is Bad Message
            success: false,
            message: 'Invalid progress information.'
        });
        return;
    }

    // evaluate progress and identify new unlocks
    const { eligibleStretches, newlyUnlocked } = evaluateProgress(
        totalMinutes,
        streakDays,
        mobilityLevel,
        alreadyUnlocked
    );

    res.status(200).json({  // 200 is OK
        success: true,
        progress: {
            totalMinutes,
            streakDays,
            mobilityLevel
        },
        eligibleStretches,
        newlyUnlocked,
        message:
            newlyUnlocked.length > 0
                ? `${newlyUnlocked.length} new stretch(es) unlocked!`
                : 'No new stretches unlocked. Keep stretching!'
    });
});

// GET /api/progress/rules
// return all stretch unlock requirements
router.get('/rules', (_req, res) => {
    res.status(200).json({
        success: true,
        requirements: stretchRequirements
    });
});

export default router;