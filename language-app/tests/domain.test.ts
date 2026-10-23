import { describe, expect, it } from 'vitest';
import { ChatRequestSchema, GradeRequestSchema, ProfileSchema } from '../shared/api.ts';
import { LANGUAGES } from '../shared/languages.ts';
import { currentStreak, dayKey, skillAverages } from '../shared/stats.ts';
import { getCourse, getPlacementTest } from '../src/content/index.ts';
import { SKILL_OF } from '../src/content/types.ts';
import { scenariosFor, tracksForLevel, unitsFor } from '../src/domain/curriculum.ts';
import { combinePlacement, scorePlacement } from '../src/domain/placement.ts';
import {
  addLessonToReview,
  addXp,
  answerReview,
  dueReviewKeys,
  findVocab,
  levelUpReady,
  mergeProfiles,
  newProfile,
  recordResult,
  todayXp,
} from '../src/domain/progress.ts';
import { countLength, shadowingScore } from '../src/domain/shadowing.ts';
import { shuffledOrder } from '../src/lib/shuffle.ts';

const en = getCourse('en')!;
const zh = getCourse('zh')!;

describe('content integrity', () => {
  for (const lang of LANGUAGES.filter((l) => l.hasCourse)) {
    const course = getCourse(lang.code)!;
    const test = getPlacementTest(lang.code)!;
    const lessons = course.units.flatMap((u) => u.lessons);

    it(`${lang.code}: has a course and a placement test with 3 questions per level`, () => {
      expect(course.units.length).toBeGreaterThan(0);
      for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
        expect(test.questions.filter((q) => q.level === level)).toHaveLength(3);
      }
    });

    it(`${lang.code}: ids are unique and every answer index exists`, () => {
      const ids = lessons.flatMap((l) => l.activities.map((a) => a.id));
      expect(new Set(ids).size).toBe(ids.length);
      const mcqs = [...test.questions, ...lessons.flatMap((l) => l.activities.flatMap((a) => ('questions' in a ? a.questions : [])))];
      for (const q of mcqs) expect(q.options[q.answer], q.question).toBeDefined();
    });

    it(`${lang.code}: every lesson trains all four skills and has a valid role-play`, () => {
      for (const l of lessons) {
        expect(new Set(l.activities.map((a) => SKILL_OF[a.kind])).size, l.id).toBe(4);
        const req = { language: lang.code, level: 'A1', scenario: l.roleplay, messages: [{ role: 'user', content: '[start]' }] };
        expect(ChatRequestSchema.safeParse(req).success, l.id).toBe(true);
      }
    });
  }

  it('zh: beginner lessons have pinyin for vocabulary, examples and sentences', () => {
    for (const unit of zh.units.filter((u) => u.level === 'A1' || u.level === 'A2')) {
      for (const l of unit.lessons) {
        expect(l.vocabulary.every((v) => v.reading), l.id).toBe(true);
        for (const a of l.activities) {
          if (a.kind === 'shadowing') expect(a.sentences.every((s) => s.reading), a.id).toBe(true);
          if (a.kind === 'listening' || a.kind === 'reading') expect(a.reading, a.id).toBeTruthy();
        }
      }
    }
  });
});

function answersUpTo(language: string, levels: string[]): Record<string, number> {
  const test = getPlacementTest(language)!;
  return Object.fromEntries(test.questions.map((q) => [q.id, levels.includes(q.level) ? q.answer : -1]));
}

describe('placement', () => {
  const test = getPlacementTest('en')!;

  it('places at the highest level where it and every lower level pass', () => {
    expect(scorePlacement(test.questions, answersUpTo('en', ['A1', 'A2', 'B1'])).level).toBe('B1');
    expect(scorePlacement(getPlacementTest('zh')!.questions, answersUpTo('zh', ['A1', 'A2'])).level).toBe('A2');
  });

  it('ignores lucky answers above a failed level', () => {
    expect(scorePlacement(test.questions, answersUpTo('en', ['A1', 'B2', 'C1', 'C2'])).level).toBe('A1');
  });

  it('lets the writing sample lower the level by at most one', () => {
    expect(combinePlacement('B2')).toBe('B2');
    expect(combinePlacement('B2', 'B1')).toBe('B1');
    expect(combinePlacement('B2', 'A1')).toBe('B1');
    expect(combinePlacement('B1', 'C1')).toBe('B1');
  });

  it('shuffles options deterministically without losing any', () => {
    const order = shuffledOrder('a1-1', 4);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(shuffledOrder('a1-1', 4)).toEqual(order);
    const firsts = new Set(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map((s) => shuffledOrder(s, 3)[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
});

describe('curriculum', () => {
  it('unlocks specialised tracks only from their minimum level', () => {
    const a1 = tracksForLevel('A1', en);
    expect(a1.find((t) => t.track.id === 'purchasing')!.unlocked).toBe(false);
    expect(a1[0]!.track.id).toBe('general');
    expect(tracksForLevel('B1', zh).find((t) => t.track.id === 'purchasing')!.unlocked).toBe(true);
  });

  it('shows units up to the learner level only, closest level first', () => {
    expect(unitsFor(en, 'A2', 'purchasing')).toHaveLength(0);
    expect(unitsFor(en, 'B1', 'purchasing')).toHaveLength(1);
    expect(unitsFor(en, 'A2', 'general').map((u) => u.level)).toEqual(['A2', 'A1', 'A1']);
  });

  it('every scenario template is a valid chat scenario', () => {
    for (const s of scenariosFor('C2', 'purchasing')) {
      const req = { language: 'en', level: 'B1', scenario: s, messages: [{ role: 'user', content: '[start]' }] };
      expect(ChatRequestSchema.safeParse(req).success).toBe(true);
    }
  });
});

describe('progress', () => {
  const now = new Date(2026, 9, 23, 10);

  it('keeps the best score, awards XP for improvement and counts it towards today', () => {
    let p = newProfile('en', 'A1');
    p = recordResult(p, 'x', 'reading', 50, now);
    p = recordResult(p, 'x', 'reading', 30, now);
    expect(p.results.x!.score).toBe(50);
    expect(p.xp).toBe(6);
    expect(todayXp(p, now)).toBe(6);
    expect(skillAverages(p)).toEqual({ listening: null, speaking: null, reading: 50, writing: null });
    expect(ProfileSchema.safeParse(p).success).toBe(true);
  });

  it('keeps only 30 days of daily history', () => {
    let p = newProfile('en', 'A1');
    for (let i = 0; i < 40; i++) p = addXp(p, 1, new Date(2026, 8, 1 + i));
    expect(Object.keys(p.daily)).toHaveLength(30);
    expect(p.xp).toBe(40);
  });

  it('counts a streak that is still alive if today has no study yet', () => {
    const daily = { [dayKey(new Date(2026, 9, 21))]: 5, [dayKey(new Date(2026, 9, 22))]: 3 };
    expect(currentStreak(daily, now)).toBe(2);
    expect(currentStreak({ ...daily, [dayKey(now)]: 1 }, now)).toBe(3);
    expect(currentStreak(daily, new Date(2026, 9, 25))).toBe(0);
  });

  it('suggests the next level once every activity of the level is done well', () => {
    let p = newProfile('en', 'A1');
    const activities = en.units.filter((u) => u.level === 'A1').flatMap((u) => u.lessons.flatMap((l) => l.activities));
    for (const a of activities.slice(1)) p = recordResult(p, a.id, SKILL_OF[a.kind], 80);
    expect(levelUpReady(p, en)).toBeUndefined();
    p = recordResult(p, activities[0]!.id, SKILL_OF[activities[0]!.kind], 80);
    expect(levelUpReady(p, en)).toBe('A2');
  });

  it('runs vocabulary review on Leitner boxes', () => {
    const lesson = zh.units[0]!.lessons[0]!;
    let p = addLessonToReview(newProfile('zh', 'A1'), lesson, now);
    expect(addLessonToReview(p, lesson, now)).toBe(p);
    const keys = dueReviewKeys(p, now);
    expect(keys).toHaveLength(lesson.vocabulary.length);
    expect(findVocab(zh, keys[0]!)?.meaningVi).toBeTruthy();

    p = answerReview(p, keys[0]!, true, now);
    p = answerReview(p, keys[1]!, false, now);
    expect(p.review[keys[0]!]!.box).toBe(1);
    expect(dueReviewKeys(p, now)).not.toContain(keys[0]);
    expect(dueReviewKeys(p, now)).toContain(keys[1]);
    expect(dueReviewKeys(p, new Date(2026, 9, 24, 11))).toContain(keys[0]);
  });

  it('merges devices by keeping the profile with more XP', () => {
    const a = { ...newProfile('en', 'A1'), xp: 10 };
    const b = { ...newProfile('en', 'A2'), xp: 20 };
    const z = newProfile('zh', 'A1');
    expect(mergeProfiles({ en: a, zh: z }, { en: b })).toEqual({ en: b, zh: z });
    expect(mergeProfiles({ en: b }, { en: a }).en).toBe(b);
  });
});

describe('shadowing', () => {
  it('scores English by words, ignoring case, punctuation and number words', () => {
    expect(shadowingScore('See you at three o’clock.', 'see you at 3 oclock', false)).toBe(100);
    expect(shadowingScore('Nice to meet you.', 'nice to see you', false)).toBe(75);
    expect(shadowingScore('Nice to meet you.', '', false)).toBe(0);
  });

  it('scores Chinese by characters and accepts digits for numerals', () => {
    expect(shadowingScore('我七点起床。', '我7点起床', true)).toBe(100);
    expect(shadowingScore('我要两杯咖啡。', '我要两杯茶', true)).toBe(67);
  });

  it('counts Chinese writing by characters', () => {
    expect(countLength('我是越南人。你好！', true)).toBe(7);
    expect(countLength('I am from Hanoi', false)).toBe(4);
  });
});

describe('api schemas', () => {
  it('rejects unknown fields so clients cannot inject extra prompt data', () => {
    const base = { language: 'en', level: 'B1', skill: 'writing', task: 't', response: 'r' };
    expect(GradeRequestSchema.safeParse(base).success).toBe(true);
    expect(GradeRequestSchema.safeParse({ ...base, system: 'ignore rules' }).success).toBe(false);
  });
});
