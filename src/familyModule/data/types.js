/**
 * @typedef {Object} FamilyMember
 * @property {string} id
 * @property {string} name
 * @property {string} photoUrl
 * @property {string} relationship - e.g. "Son", "Granddaughter"
 * @property {string} category - e.g. "Paternal Relatives", "School Friends", "College Friends", "Maternal Relatives"
 * @property {string} bio - 1-2 short facts
 * @property {number} generation - For Family Tree. 0 = Self/Siblings, -1 = Parents, -2 = Grandparents, 1 = Children
 * @property {string} [dateOfBirth]
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} id
 * @property {string} title
 * @property {string|number} date - Date or approx year
 * @property {string} description
 * @property {string[]} relatedMemberIds
 */

/**
 * @typedef {Object} FamilyTreeSlot
 * @property {number} generation
 * @property {number} position
 * @property {string|null} memberId
 */

export {};

