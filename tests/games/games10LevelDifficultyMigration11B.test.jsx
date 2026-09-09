import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { getDifficultyParams } from '../../src/engine/difficultyScaling.js';
import DayInMyVillage from '../../src/games/DayInMyVillage.jsx';
import PackVillageBasket from '../../src/games/PackVillageBasket.jsx';
import WhatBelongsHere from '../../src/games/WhatBelongsHere.jsx';
import FinishGrandmasWeave from '../../src/games/FinishGrandmasWeave.jsx';

describe('10-Level Difficulty System Migration — Batch 11B (4 Core Games)', () => {
  describe('Endpoint Calibration & Distinct Level Requirement (>= 7 Distinct Levels)', () => {
    it('DayInMyVillage generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('day-in-my-village', l);
        distinctKeys.add(`${p.itemCount}_${p.distractorCount}_${p.previewTimeMs}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(10);
      expect(getDifficultyParams('day-in-my-village', 1).itemCount).toBe(2);
      expect(getDifficultyParams('day-in-my-village', 10).itemCount).toBe(5);
    });

    it('PackVillageBasket generates >= 7 distinct difficulty parameter states', () => {
      const distinctKeys = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('pack-village-basket', l);
        distinctKeys.add(`${p.itemCount}_${p.distractorCount}`);
      }
      expect(distinctKeys.size).toBeGreaterThanOrEqual(7);
      expect(distinctKeys.size).toBe(10);
      expect(getDifficultyParams('pack-village-basket', 1).itemCount).toBe(2);
      expect(getDifficultyParams('pack-village-basket', 1).distractorCount).toBe(1);
      expect(getDifficultyParams('pack-village-basket', 10).itemCount).toBe(6);
      expect(getDifficultyParams('pack-village-basket', 10).distractorCount).toBe(6);
    });

    it('WhatBelongsHere generates >= 7 distinct difficulty parameter states', () => {
      const distinctCounts = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('what-belongs-here', l);
        distinctCounts.add(p.itemCount);
      }
      expect(distinctCounts.size).toBeGreaterThanOrEqual(7);
      expect(distinctCounts.size).toBe(10);
      expect(getDifficultyParams('what-belongs-here', 1).itemCount).toBe(3);
      expect(getDifficultyParams('what-belongs-here', 10).itemCount).toBe(12);
    });

    it('FinishGrandmasWeave generates >= 7 distinct difficulty parameter states', () => {
      const distinctProfiles = new Set();
      for (let l = 1; l <= 10; l++) {
        const p = getDifficultyParams('finish-grandmas-weave', l);
        distinctProfiles.add(`${p.itemCount}_${p.distractorCount}_${p.previewTimeMs}`);
      }
      expect(distinctProfiles.size).toBeGreaterThanOrEqual(7);
      expect(distinctProfiles.size).toBe(10);
      expect(getDifficultyParams('finish-grandmas-weave', 1).itemCount).toBe(1);
      expect(getDifficultyParams('finish-grandmas-weave', 1).distractorCount).toBe(1);
      expect(getDifficultyParams('finish-grandmas-weave', 10).itemCount).toBe(5);
      expect(getDifficultyParams('finish-grandmas-weave', 10).distractorCount).toBe(4);
    });
  });

  describe('Component Props & Render Adaptation', () => {
    it('DayInMyVillage adapts route stops and option counts based on level prop', () => {
      const { unmount } = render(<DayInMyVillage level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Stops/i)).toBeInTheDocument();
      expect(screen.getByText(/2 Options \/ Stop/i)).toBeInTheDocument();
      unmount();

      render(<DayInMyVillage level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Stops/i)).toBeInTheDocument();
      expect(screen.getByText(/4 Options \/ Stop/i)).toBeInTheDocument();
    });

    it('PackVillageBasket adapts target count and total grid items based on level prop', () => {
      const { unmount } = render(<PackVillageBasket level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Find 2 Items • 3 Choices/i)).toBeInTheDocument();
      expect(screen.getByText(/Tap only the 2 items/i)).toBeInTheDocument();
      unmount();

      render(<PackVillageBasket level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Find 6 Items • 12 Choices/i)).toBeInTheDocument();
      expect(screen.getByText(/Tap only the 6 items/i)).toBeInTheDocument();
    });

    it('WhatBelongsHere adapts item count across rooms based on level prop', () => {
      const { unmount } = render(<WhatBelongsHere level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Sort 3 Items Across 3 Rooms/i)).toBeInTheDocument();
      expect(screen.getByText(/0 of 3 placed/i)).toBeInTheDocument();
      unmount();

      render(<WhatBelongsHere level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Sort 12 Items Across 3 Rooms/i)).toBeInTheDocument();
      expect(screen.getByText(/0 of 12 placed/i)).toBeInTheDocument();
    });

    it('FinishGrandmasWeave adapts missing cells and yarn options based on level prop', () => {
      const { unmount } = render(<FinishGrandmasWeave level={1} />);
      expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Fill 1 Missing Cells • 2 Yarn Choices/i)).toBeInTheDocument();
      unmount();

      render(<FinishGrandmasWeave level={10} />);
      expect(screen.getByText(/Level 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Fill 5 Missing Cells • 5 Yarn Choices/i)).toBeInTheDocument();
    });
  });

  describe('Completion Scoring & Telemetry Contract', () => {
    it('PackVillageBasket completes and returns level & difficultyParams in payload', () => {
      const handleComplete = vi.fn();
      render(<PackVillageBasket level={1} onComplete={handleComplete} />);

      // Find item cards and click confirm
      const buttons = screen.getAllByRole('button');
      // Click first item to select
      const itemBtn = buttons.find(b => b.textContent && !b.textContent.includes('Confirm') && !b.textContent.includes('Exit'));
      if (itemBtn) fireEvent.click(itemBtn);

      const confirmBtn = screen.getByRole('button', { name: /Confirm Basket/i });
      fireEvent.click(confirmBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(2);
      expect(res.difficultyParams.distractorCount).toBe(1);
    });

    it('WhatBelongsHere completes and returns level & difficultyParams in payload', () => {
      const handleComplete = vi.fn();
      render(<WhatBelongsHere level={1} onComplete={handleComplete} />);

      // Click each of the 3 items (rendered as div with label text in DragDropZone unassigned pool)
      const kitchenZone = screen.getByText(/Traditional Kitchen/i);
      
      // Items at level 1: 3 items (1 per room zone: bell, kettle, broom)
      const unassignedItems = ['Prayer Bell', 'Tea Kettle', 'Grass Broom'];
      unassignedItems.forEach(name => {
        const itemEl = screen.getByText(new RegExp(name, 'i'));
        fireEvent.click(itemEl);
        fireEvent.click(kitchenZone);
      });

      const confirmBtn = screen.getByRole('button', { name: /Confirm Room Placement/i });
      fireEvent.click(confirmBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
      expect(res.difficultyParams.itemCount).toBe(3);
    });

    it('FinishGrandmasWeave completes and passes level in payload', () => {
      const handleComplete = vi.fn();
      render(<FinishGrandmasWeave level={1} onComplete={handleComplete} />);

      // Dismiss GameWrapper instructions modal if present
      const startBtn = screen.queryByRole('button', { name: /Start Playing/i });
      if (startBtn) {
        fireEvent.click(startBtn);
      }

      // Tap the '🟡' piece option button (the selectable option button is not disabled)
      const yarnBtns = screen.getAllByRole('button', { name: '🟡' });
      const pieceBtn = yarnBtns.find(b => !b.disabled);
      expect(pieceBtn).toBeDefined();
      fireEvent.click(pieceBtn);

      // Find the 1 missing cell (aria-label is '?' when empty)
      const missingCell = screen.getByRole('button', { name: '?' });
      fireEvent.click(missingCell);

      // Click check pattern
      const checkBtn = screen.getByRole('button', { name: /Check Pattern/i });
      fireEvent.click(checkBtn);

      expect(handleComplete).toHaveBeenCalledTimes(1);
      const res = handleComplete.mock.calls[0][0];
      expect(res.level).toBe(1);
      expect(res.difficultyParams).toBeDefined();
    });
  });
});
