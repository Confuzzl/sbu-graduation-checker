import fs from "node:fs";

/**
 * @typedef {Object} Course
 * @property {string} dep
 * @property {number} number
 * @property {string} name
 * @property {number} credits
 * @property {string[]} sbcs
 */

const NULL_COURSE = { dep: "", number: 0, name: "", credits: 0, sbcs: [] };

/**@type {Object.<string,Course>} */
const ALL_COURSES = JSON.parse(fs.readFileSync("departments/courses.json"));

/**
 * @callback SimpleCourseFunction
 * @param {Course} course
 * @returns {boolean}
 */
/**
 * @callback NameFunction
 * @returns {string}
 */
/**
 * @typedef {Object} NameCourseFunction
 * @property {NameFunction} funcName
 */
/**
 * @typedef {SimpleCourseFunction & NameCourseFunction} CourseFunction
 */

/**
 * @typedef {CourseFunction[]} RequirementGroup
 * @property {string} groupName
 */

/** @returns {CourseFunction} */
const any = () => {
    const out = /** @type {CourseFunction} */ (course) => true;
    out.funcName = () => `any course`;
    return out;
};

/**
 * @param {CourseFunction} a
 * @param {CourseFunction} b
 * @returns {CourseFunction}
 */
const and = (a, b) => {
    let af = false;
    let bf = false;
    const out =
        /** @type {CourseFunction} */
        (course) => {
            if (a(course)) af = true;
            if (b(course)) bf = true;
            return af && bf;
        };
    out.funcName = () => `${a.funcName} (${af}) and ${b.funcName} (${bf})`;
    return out;
};
/**
 * @param {CourseFunction} a
 * @param {CourseFunction} b
 * @returns {CourseFunction}
 */
const or = (a, b) => {
    let af = false;
    let bf = false;
    const out = /** @type {CourseFunction} */ (course) => {
        if (a(course)) af = true;
        if (b(course)) bf = true;
        return af || bf;
    };
    out.funcName = () => `${a.funcName} (${af}) or ${b.funcName} (${bf})`;
    return out;
};

/**
 * @param {number} num
 * @param {CourseFunction} filter
 * @returns {CourseFunction}
 */
const min_credit = (num, filter = any) => {
    let counter = 0;
    const out =
        /** @type {CourseFunction} */
        (course) => {
            if (filter(course)) counter += course.credits;
            return counter >= num;
        };
    out.funcName = () =>
        `Minimum credits: ${counter}/${num} for ${filter().funcName()}`;
    return out;
};

/** @returns {CourseFunction} */
const is_upper_division = () => {
    let fulfilled = false;
    const out = /** @type {CourseFunction} */ (course) => {
        if (course.number >= 300) fulfilled = true;
        return fulfilled;
    };
    out.funcName = () => "upper division";
    return out;
};
/**
 * @param {string} dep
 * @returns {CourseFunction}
 */
const in_department = (dep) => {
    let fulfilled = false;
    const out = /** @type {CourseFunction} */ (course) => {
        if (course.dep == dep) fulfilled = true;
        return fulfilled;
    };
    out.funcName = () => `${dep} course`;
    return out;
};
/**
 * @param {string} sbc
 * @returns {CourseFunction}
 */
const has_sbc = (sbc) => {
    let fulfilled = false;
    const out = /** @type {CourseFunction} */ (course) => {
        if (course.sbcs.includes(sbc)) fulfilled = true;
        return fulfilled;
    };
    out.funcName = () => `has ${sbc}`;
    return out;
};
/**
 * @param {string} name
 * @returns {CourseFunction}
 */
const is_course = (name) => {
    let fulfilled = false;
    const out = /** @type {CourseFunction} */ (course) => {
        if (`${course.dep} ${course.number}` == name) fulfilled = true;
        return fulfilled;
    };
    out.funcName = () => `is ${name}`;
    return out;
};

/**
 * @param {number} n
 * @param {CourseFunction[]} list
 * @returns {CourseFunction}
 */
const n_out_of_list = (n, list) => {
    let remainders = list.slice();
    let counter = 0;
    const out = /** @type {CourseFunction} */ (course) => {
        for (let i = 0; i < remainders.length; i++) {
            if (!remainders[i](course)) continue;
            counter++;
            remainders.splice(i, 1);
            i--;
        }
        return counter >= n;
    };
    out.funcName = () =>
        `${n} out of ${list.map((e) => e.funcName()).join(", ")}`;
    return out;
};

/**
 * @param {string} name
 * @param {...CourseFunction} reqs
 * @returns {RequirementGroup}
 */
const grouping = (name, ...reqs) => {
    reqs.groupName = name;
    return reqs;
};

const REQUIREMENTS = [
    grouping("Credit Hour Requirement", min_credit(120)),
    grouping(
        "Upper-Division Credit Requirement",
        min_credit(39, is_upper_division)
    ),
    grouping(
        "Mandatory Freshman Courses",
        is_course("SBU 101"),
        is_course("SBU 102")
    ),
    grouping(
        "Demonstrate Versatility",
        has_sbc("ARTS"),
        has_sbc("GLO"),
        has_sbc("HUM"),
        has_sbc("QPS"),
        has_sbc("SBS"),
        has_sbc("SNW"),
        has_sbc("TECH"),
        has_sbc("USA"),
        has_sbc("WRT")
    ),
    grouping("Explore Interconnectedness", has_sbc("STAS")),
    grouping(
        "Pursue Deeper Understanding",
        n_out_of_list(3, [
            has_sbc("EXP+"),
            has_sbc("HFA+"),
            has_sbc("SBS+"),
            has_sbc("STEM+"),
        ])
    ),
    grouping(
        "Prepare for Life-Long Learning",
        has_sbc("CER"),
        has_sbc("DIV"),
        has_sbc("ESI"),
        has_sbc("SPK"),
        has_sbc("WRTD")
    ),
];
const CSE_REQUIREMENTS = [
    grouping(
        "Required Introductory Courses",
        is_course("CSE 114"),
        is_course("CSE 214"),
        is_course("CSE 215"),
        is_course("CSE 216"),
        is_course("CSE 220")
    ),
    grouping(
        "Required Advanced Courses",
        is_course("CSE 303"),
        is_course("CSE 310"),
        is_course("CSE 316"),
        is_course("CSE 320"),
        is_course("CSE 373"),
        is_course("CSE 416")
    ),

    // 4 electives
    // and(is_upper_division(), in_department("CSE")),
    // and(is_upper_division(), in_department("CSE")),
    // and(is_upper_division(), in_department("CSE")),
    // and(is_upper_division(), in_department("CSE")),

    grouping("Applied Calculus", is_course("AMS 151"), is_course("AMS 161")),
    grouping("Linear Algebra", or(is_course("MAT 211"), is_course("AMS 210"))),
    grouping("More Math", is_course("AMS 301"), is_course("AMS 310")),
    // natural science

    grouping("Professional Ethics", is_course("CSE 312")),
    grouping("Upper-Division Writing Requirement", is_course("CSE 300")),
];

const COURSE_NAME_LIST = [
    [
        ["AMS 210", "CSE 215", "PHI 108", "SBU 101", "IAE 101", "WRT 102"],
        ["AMS 301", "AMS 310", "POL 102", " SBU 102", "CSE 214", "LIN 101"],
    ],
    [[], []],
    [[], []],
    [[], []],
];

const COURSE_LIST = COURSE_NAME_LIST.map((year) =>
    year.map((sem) => sem.map((name) => ALL_COURSES[name] ?? NULL_COURSE))
);

const ALL_REQUIREMENTS = [...REQUIREMENTS, ...CSE_REQUIREMENTS];

console.log(JSON.stringify(COURSE_LIST, null, 2));

// for (const year of COURSE_LIST) {
//     for (const sem of year) {
//         for (const course of sem) {
//             for (const group of ALL_REQUIREMENTS) {
//                 for (const pred of group) {
//                     pred(course);
//                 }
//             }
//         }
//     }
// }
// for (const group of ALL_REQUIREMENTS) {
//     console.log(group.groupName);
//     for (const pred of group) {
//         console.log(pred.funcName(), pred(NULL_COURSE));
//     }
//     console.log();
// }
