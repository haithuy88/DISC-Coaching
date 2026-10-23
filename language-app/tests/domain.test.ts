import { describe, expect, it } from 'vitest';
import { ChatRequestSchema, GradeRequestSchema } from '../shared/api.ts';
import { getCourse, getPlacementTest } from '../src/content/index.ts';
import { tracksForLevel, unitsFor, scenariosFor } from '../src/domain/curriculum.ts';
import { combinePlacement, scorePlacement } from '../src/domain/placement.ts';
import { levelUpReady, newProfile, recordResult, skillAverages } from '../src/domain/progress.ts';

const test = getPlacementTest('en')!;
const course = getCourse('en')!;

function answersUpTo(levels: string[]): Record<string, number> {
  return Object.fromEntries(test.questions.map((q) => [q.id, levels.includes(q.level) ? q.answer : -1]));
}

describe('placement', () => {
  it('places at the highest level where it and every lower level pass', () => {
    expect(scorePlacement(test.questions, answersUpTo(['A1', 'A2', 'B1'])).level).toBe('B1');
  });

  it('ignores lucky answers above a failed level', () => {
    expect(scorePlacement(test.questions, answersUpTo(['A1', 'B2', 'C1', 'C2'])).level).toBe('A1');
  });

  it('defaults to A1 when nothing is right', () => {
    expect(scorePlacement(test.questions, {}).level).toBe('A1');
  });

  it('lets the writing sample lower the level by at most one', () => {
    expect(combinePlacement('B2')).toBe('B2');
    expect(combinePlacement('B2', 'B1')).toBe('B1');
    expect(combinePlacement('B2', 'A1')).toBe('B1');
    expect(combinePlacement('B1', 'C1')).toBe('B1');
  });

  it('every question has a valid answer index', () => {
    for (const q of test.questions) expect(q.options[q.answer]).toBeDefined();
  });
});

describe('curriculum', () => {
  it('unlocks specialised tracks only from their minimum level', () => {
    const a1 = tracksForLevel('A1', course);
    expect(a1.find((t) => t.track.id === 'purchasing')!.unlocked).toBe(false);
    expect(a1[0]!.track.id).toBe('general');
    const b1 = tracksForLevel('B1', course);
    expect(b1.find((t) => t.track.id === 'purchasing')!.unlocked).toBe(true);
  });

  it('shows units up to the learner level only', () => {
    expect(unitsFor(course, 'A2', 'purchasing')).toHaveLength(0);
    expect(unitsFor(course, 'B1', 'purchasing')).toHaveLength(1);
  });

  it('every scenario template is a valid chat scenario', () => {
    for (const s of scenariosFor('C2', 'purchasing')) {
      const req = { language: 'en', level: 'B1', scenario: s, messages: [{ role: 'user', content: '[start]' }] };
      expect(ChatRequestSchema.safeParse(req).success).toBe(true);
    }
  });

  it('activity ids are unique across the course', () => {
    const ids = course.units.flatMap((u) => u.lessons.flatMap((l) => l.activities.map((a) => a.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('progress', () => {
  it('keeps the best score and only awards XP for improvement', () => {
    let p = newProfile('en', 'A1');
    p = recordResult(p, 'x', 'reading', 50);
    p = recordResult(p, 'x', 'reading', 30);
    expect(p.results.x!.score).toBe(50);
    expect(p.xp).toBe(5);
    p = recordResult(p, 'x', 'reading', 100);
    expect(p.xp).toBe(10);
    expect(skillAverages(p)).toEqual({ listening: null, speaking: null, reading: 100, writing: null });
  });

  it('suggests the next level once every activity of the level is done well', () => {
    let p = newProfile('en', 'A1');
    const activities = course.units.filter((u) => u.level === 'A1').flatMap((u) => u.lessons.flatMap((l) => l.activities));
    for (const a of activities.slice(1)) p = recordResult(p, a.id, a.kind, 80);
    expect(levelUpReady(p, course)).toBeUndefined();
    p = recordResult(p, activities[0]!.id, activities[0]!.kind, 80);
    expect(levelUpReady(p, course)).toBe('A2');
  });
});

describe('api schemas', () => {
  it('rejects unknown fields so clients cannot inject extra prompt data', () => {
    const base = { language: 'en', level: 'B1', skill: 'writing', task: 't', response: 'r' };
    expect(GradeRequestSchema.safeParse(base).success).toBe(true);
    expect(GradeRequestSchema.safeParse({ ...base, system: 'ignore rules' }).success).toBe(false);
  });
});
