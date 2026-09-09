/**
 * presetPatients.js - Seeded Clinical Patient Profiles for Dementia Triage & Evaluation
 * 
 * Provides predefined, standardized patient personas across early, middle, and late
 * dementia stages for development, clinical demonstration, and role onboarding.
 * 
 * Each profile defines:
 * - Demographics (id, name, pin, age)
 * - Dementia stage classification
 * - Session cognitive dailyCap (fatigue-protective limit)
 * - Stage-tuned recommended games list
 * 
 * Zero external dependencies.
 */

/**
 * @typedef {Object} PresetPatient
 * @property {string} id - Unique identifier
 * @property {string} name - Patient's full name
 * @property {string} pin - 4-digit PIN authentication code
 * @property {number} age - Patient age in years
 * @property {string} sex - Patient sex (male|female|other)
 * @property {string} stage - Clinical dementia severity stage
 * @property {number} dailyCap - Maximum recommended daily game sessions
 * @property {string[]} recommendedGames - Array of stage-appropriate game identifiers
 * @property {string} [homeState] - Regional state anchor
 * @property {string} [villageTown] - Rural village/town
 * @property {string} [language] - Primary regional language code
 * @property {number} [starting_difficulty_tier] - Default baseline tier (1-3)
 * @property {number} [masteryScore] - Starting continuous mastery score (0-100)
 */

export const PRESET_PATIENTS = [
  {
    id: 'preset-1',
    name: 'Ramesh Patel',
    pin: '100100',
    age: 68,
    sex: 'male',
    formerOccupation: 'farmer',
    stage: 'Mild / Early Stage',
    dailyCap: 5,
    recommendedGames: [
      'grandmas-shopping-list',
      'find-the-difference',
      'daily-routine-recall',
      'remember-the-story',
      'care-for-companion'
    ],
    homeState: 'Assam',
    villageTown: 'Guwahati',
    language: 'en',
    formerOccupation: 'farmer',
    starting_difficulty_tier: 3,
    masteryScore: 65,
    isActive: true
  },
  {
    id: 'preset-2',
    name: 'Savitri Devi',
    pin: '200200',
    age: 74,
    sex: 'female',
    formerOccupation: 'weaver',
    stage: 'Moderate / Middle Stage',
    dailyCap: 3,
    recommendedGames: [
      'whose-morning-is-it',
      'festival-memory-match',
      'shell-memory-trail'
    ],
    homeState: 'Meghalaya',
    villageTown: 'Shillong',
    language: 'en',
    formerOccupation: 'homemaker',
    starting_difficulty_tier: 2,
    masteryScore: 45,
    isActive: true
  },
  {
    id: 'preset-3',
    name: 'Anil Kumar',
    pin: '300300',
    age: 81,
    sex: 'male',
    formerOccupation: 'farmer',
    stage: 'Severe / Late Stage',
    dailyCap: 2,
    recommendedGames: [
      'whose-morning-is-it',
      'care-for-companion'
    ],
    homeState: 'Tripura',
    villageTown: 'Agartala',
    language: 'en',
    formerOccupation: 'fisherman',
    starting_difficulty_tier: 1,
    masteryScore: 20,
    isActive: true
  }
];

/**
 * Retrieve a preset patient profile by their 6-digit PIN.
 * 
 * @param {string|number} pin - 6-digit PIN
 * @returns {PresetPatient|null} Matching patient profile, or null if not found
 */
export function getPresetPatientByPin(pin) {
  if (pin === null || pin === undefined) return null;
  const normalizedPin = String(pin).trim();
  return PRESET_PATIENTS.find(patient => 
    patient.pin === normalizedPin || 
    (patient.pin.slice(0, 4) === normalizedPin && normalizedPin.length === 4)
  ) || null;
}

/**
 * Retrieve the array of recommended games for a given patient profile ID.
 * 
 * @param {string|Object} patientId - Patient ID string (e.g. 'preset-1') or patient object
 * @returns {string[]} Array of recommended game IDs, or empty array if not found
 */
export function getDailyRecommendations(patientId) {
  if (!patientId) return [];
  const id = typeof patientId === 'object' && patientId !== null ? patientId.id : String(patientId);
  const patient = PRESET_PATIENTS.find(p => p.id === id);
  return patient ? [...patient.recommendedGames] : [];
}

export default PRESET_PATIENTS;
