const fs = require('fs');
const path = require('path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      strict: true,
    },
  });

  module._compile(output.outputText, filename);
};

const { analyzeRunPoints } = require(path.join(__dirname, '../lib/runAnalysis.ts'));

const METERS_PER_LATITUDE_DEGREE = 111320;

function createRandom(seed) {
  return function nextRandom() {
    let next = (seed += 0x6d2b79f5);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random, min, max) {
  return min + random() * (max - min);
}

function metersToPoint(base, northMeters, eastMeters, extra = {}) {
  const latitude = base.latitude + northMeters / METERS_PER_LATITUDE_DEGREE;
  const longitude =
    base.longitude +
    eastMeters / (METERS_PER_LATITUDE_DEGREE * Math.cos((base.latitude * Math.PI) / 180));

  return {
    latitude,
    longitude,
    altitude: extra.altitude ?? null,
    accuracy: extra.accuracy ?? 6,
    speed: extra.speed ?? null,
    heading: extra.heading ?? 0,
    timestamp: extra.timestamp,
  };
}

function makeTrack({
  random,
  distanceMeters,
  durationSeconds,
  pointCount,
  jitterMeters = 0,
  accuracyMeters = 6,
  outlierIndexes = [],
  poorAccuracyIndexes = [],
  pauseStartIndex = null,
  pauseEndIndex = null,
  altitudeGainMeters = 0,
}) {
  const base = { latitude: 51.5074, longitude: -0.1278 };
  const points = [];
  const intervalSeconds = durationSeconds / Math.max(1, pointCount - 1);

  for (let index = 0; index < pointCount; index += 1) {
    let progress = index / Math.max(1, pointCount - 1);

    if (pauseStartIndex !== null && pauseEndIndex !== null) {
      if (index >= pauseStartIndex && index <= pauseEndIndex) {
        progress = pauseStartIndex / Math.max(1, pointCount - 1);
      } else if (index > pauseEndIndex) {
        const pauseProgress = pauseStartIndex / Math.max(1, pointCount - 1);
        const remainingProgress =
          (index - pauseEndIndex) / Math.max(1, pointCount - pauseEndIndex - 1);
        progress = pauseProgress + (1 - pauseProgress) * remainingProgress;
      }
    }

    const jitterNorth = randomBetween(random, -jitterMeters, jitterMeters);
    const jitterEast = randomBetween(random, -jitterMeters, jitterMeters);
    const isOutlier = outlierIndexes.includes(index);
    const isPoorAccuracy = poorAccuracyIndexes.includes(index);
    const northMeters = progress * distanceMeters + jitterNorth + (isOutlier ? 500 : 0);
    const eastMeters = jitterEast + (isOutlier ? 500 : 0);
    const timestamp = 1700000000000 + index * intervalSeconds * 1000;

    points.push(
      metersToPoint(base, northMeters, eastMeters, {
        altitude: progress * altitudeGainMeters + randomBetween(random, -0.5, 0.5),
        accuracy: isPoorAccuracy ? 95 : accuracyMeters,
        timestamp,
      }),
    );
  }

  return points;
}

function assertScenario(name, actual, predicate, details) {
  if (!predicate(actual)) {
    throw new Error(`${name} failed: ${details(actual)}`);
  }
}

function distanceErrorRatio(actual, expected) {
  return Math.abs(actual - expected) / Math.max(1, expected);
}

function run() {
  const random = createRandom(20260509);
  const scenarios = [];

  for (let index = 0; index < 30; index += 1) {
    const distanceMeters = randomBetween(random, 150, 5000);
    const speed = randomBetween(random, 2.2, 4.8);
    const durationSeconds = distanceMeters / speed;
    scenarios.push({
      name: `clean-run-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount: Math.ceil(durationSeconds / 5) + 1,
        jitterMeters: randomBetween(random, 0, 1.5),
      }),
      predicate: (analysis) => distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.08,
    });
  }

  for (let index = 0; index < 20; index += 1) {
    const distanceMeters = randomBetween(random, 300, 4200);
    const speed = randomBetween(random, 2, 4);
    const durationSeconds = distanceMeters / speed;
    scenarios.push({
      name: `jittery-run-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount: Math.ceil(durationSeconds / 4) + 1,
        jitterMeters: randomBetween(random, 2, 6),
        accuracyMeters: randomBetween(random, 8, 18),
      }),
      predicate: (analysis) => distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.2,
    });
  }

  for (let index = 0; index < 15; index += 1) {
    const distanceMeters = randomBetween(random, 500, 5000);
    const speed = randomBetween(random, 2.4, 4.5);
    const durationSeconds = distanceMeters / speed;
    const pointCount = Math.ceil(durationSeconds / 5) + 1;
    scenarios.push({
      name: `outlier-rejection-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount,
        jitterMeters: 2,
        outlierIndexes: [Math.floor(pointCount * 0.3), Math.floor(pointCount * 0.7)],
      }),
      predicate: (analysis) =>
        analysis.rejectedPoints >= 2 && distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.18,
    });
  }

  for (let index = 0; index < 10; index += 1) {
    const distanceMeters = randomBetween(random, 400, 3200);
    const speed = randomBetween(random, 2.2, 4);
    const durationSeconds = distanceMeters / speed;
    const pointCount = Math.ceil(durationSeconds / 4) + 1;
    scenarios.push({
      name: `poor-accuracy-filter-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount,
        jitterMeters: 2,
        poorAccuracyIndexes: [
          Math.floor(pointCount * 0.25),
          Math.floor(pointCount * 0.5),
          Math.floor(pointCount * 0.75),
        ],
      }),
      predicate: (analysis) =>
        analysis.rejectedPoints >= 3 && distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.2,
    });
  }

  for (let index = 0; index < 10; index += 1) {
    const distanceMeters = randomBetween(random, 600, 3600);
    const movingSpeed = randomBetween(random, 2.1, 4);
    const movingSeconds = distanceMeters / movingSpeed;
    const pauseSeconds = randomBetween(random, 30, 120);
    const durationSeconds = movingSeconds + pauseSeconds;
    const pointCount = Math.ceil(durationSeconds / 5) + 1;
    scenarios.push({
      name: `pause-detection-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount,
        jitterMeters: 1.5,
        pauseStartIndex: Math.floor(pointCount * 0.4),
        pauseEndIndex: Math.floor(pointCount * 0.4) + Math.ceil(pauseSeconds / 5),
      }),
      predicate: (analysis) =>
        analysis.pauseSeconds >= pauseSeconds * 0.45 &&
        distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.18,
    });
  }

  for (let index = 0; index < 10; index += 1) {
    scenarios.push({
      name: `stationary-jitter-${index + 1}`,
      expectedDistanceMeters: 0,
      points: makeTrack({
        random,
        distanceMeters: 0,
        durationSeconds: 120,
        pointCount: 31,
        jitterMeters: randomBetween(random, 0.5, 2),
      }),
      predicate: (analysis) =>
        analysis.distanceMeters < 15 && analysis.averagePaceSecondsPerKm === null,
    });
  }

  for (let index = 0; index < 5; index += 1) {
    const distanceMeters = randomBetween(random, 700, 2500);
    const speed = randomBetween(random, 2, 4);
    const durationSeconds = distanceMeters / speed;
    const altitudeGainMeters = randomBetween(random, 20, 80);
    scenarios.push({
      name: `elevation-correction-${index + 1}`,
      expectedDistanceMeters: distanceMeters,
      points: makeTrack({
        random,
        distanceMeters,
        durationSeconds,
        pointCount: Math.ceil(durationSeconds / 5) + 1,
        jitterMeters: 1,
        altitudeGainMeters,
      }),
      predicate: (analysis) =>
        analysis.elevationGainMeters > altitudeGainMeters * 0.4 &&
        distanceErrorRatio(analysis.distanceMeters, distanceMeters) < 0.12,
    });
  }

  if (scenarios.length !== 100) {
    throw new Error(`Expected 100 scenarios but built ${scenarios.length}`);
  }

  const results = scenarios.map((scenario) => {
    const analysis = analyzeRunPoints(scenario.points);
    assertScenario(
      scenario.name,
      analysis,
      scenario.predicate,
      (failedAnalysis) =>
        `distance=${failedAnalysis.distanceMeters.toFixed(1)}m expected=${scenario.expectedDistanceMeters.toFixed(
          1,
        )}m rejected=${failedAnalysis.rejectedPoints} pause=${failedAnalysis.pauseSeconds.toFixed(
          1,
        )}s elevationGain=${failedAnalysis.elevationGainMeters.toFixed(1)}m`,
    );
    return analysis;
  });

  const averageDistanceError =
    scenarios.reduce((total, scenario, index) => {
      if (scenario.expectedDistanceMeters <= 0) {
        return total;
      }

      return total + distanceErrorRatio(results[index].distanceMeters, scenario.expectedDistanceMeters);
    }, 0) / scenarios.filter((scenario) => scenario.expectedDistanceMeters > 0).length;

  const totalRejectedPoints = results.reduce(
    (total, analysis) => total + analysis.rejectedPoints,
    0,
  );

  console.log(`Passed ${scenarios.length}/100 tracking simulation scenarios.`);
  console.log(`Average distance error across moving scenarios: ${(averageDistanceError * 100).toFixed(2)}%`);
  console.log(`Rejected noisy/bad points: ${totalRejectedPoints}`);
  console.log('Map matching note: no road/trail network is bundled, so tests validate GPS cleanup and smoothing only.');
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
