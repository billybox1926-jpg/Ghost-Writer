import { clamp } from './semantic-rules.js';

export const screenShakeTuning = {
  intensityScale: 0.58,
  maxMagnitude: 12,
  durationScale: 0.9,
  maxDuration: 320,
  baseFrequency: 0.045,
  secondaryFrequency: 0.073,
  rollFrequency: 0.018,
  verticalDamping: 0.62,
  restThreshold: 0.04,
  carryoverStrength: 0.55,
  freshImpactRatio: 1.15
};

export function createScreenShakeState() {
  return {
    offset: { x: 0, y: 0 },
    vector: { x: 0, y: 0 },
    magnitude: 0,
    duration: 0,
    elapsed: 0,
    phase: 0
  };
}

export function triggerScreenShakeState(shake, magnitude = 8, duration = 240, random = Math.random) {
  const tunedMagnitude = clamp(magnitude * screenShakeTuning.intensityScale, 0, screenShakeTuning.maxMagnitude);
  const tunedDuration = Math.min(duration * screenShakeTuning.durationScale, screenShakeTuning.maxDuration);
  const isResting = shake.elapsed >= shake.duration || shake.magnitude <= 0;
  const isFreshImpact = isResting || tunedMagnitude > shake.magnitude * screenShakeTuning.freshImpactRatio;

  if (isFreshImpact) {
    const angle = random() * Math.PI * 2;
    shake.vector.x = Math.cos(angle);
    shake.vector.y = Math.sin(angle);
    shake.phase = random() * Math.PI * 2;
    shake.magnitude = Math.max(shake.magnitude, tunedMagnitude);
    shake.duration = Math.max(tunedDuration, 1);
    shake.elapsed = 0;
    return;
  }

  shake.magnitude = Math.max(shake.magnitude, tunedMagnitude * screenShakeTuning.carryoverStrength);
  shake.duration = Math.max(shake.duration, Math.min(shake.elapsed + tunedDuration * 0.45, screenShakeTuning.maxDuration));
}

export function updateScreenShakeState(shake, deltaTime) {
  if (shake.elapsed >= shake.duration || shake.magnitude <= 0) {
    shake.offset.x = 0;
    shake.offset.y = 0;
    return;
  }

  shake.elapsed = Math.min(shake.elapsed + deltaTime, shake.duration);
  const progress = shake.elapsed / shake.duration;
  const envelope = (1 - progress) ** 2;
  const primaryPulse = Math.sin(shake.elapsed * screenShakeTuning.baseFrequency + shake.phase);
  const secondaryPulse = Math.sin(shake.elapsed * screenShakeTuning.secondaryFrequency + shake.phase * 0.5) * 0.35;
  const driftAngle = Math.atan2(shake.vector.y, shake.vector.x)
    + Math.sin(shake.elapsed * screenShakeTuning.rollFrequency + shake.phase) * 0.35;
  const amplitude = shake.magnitude * envelope;

  shake.offset.x = (
    Math.cos(driftAngle) * primaryPulse
    + Math.cos(driftAngle + Math.PI / 2) * secondaryPulse
  ) * amplitude;
  shake.offset.y = (
    Math.sin(driftAngle) * primaryPulse
    + Math.sin(driftAngle + Math.PI / 2) * secondaryPulse
  ) * amplitude * screenShakeTuning.verticalDamping;

  if (shake.elapsed >= shake.duration || amplitude <= screenShakeTuning.restThreshold) {
    shake.offset.x = 0;
    shake.offset.y = 0;
    shake.magnitude = 0;
  }
}
