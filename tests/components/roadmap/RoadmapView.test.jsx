import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RoadmapView from '../../../src/components/roadmap/RoadmapView.jsx';
import RoadmapNode from '../../../src/components/roadmap/RoadmapNode.jsx';
import { PRESET_PATIENTS } from '../../../src/data/presetPatients.js';

describe('RoadmapView & RoadmapNode Component Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Daily Cap & Progression Node Rendering', () => {
    it('renders 5 sequential nodes for Mild stage patient (preset-1, dailyCap = 5)', () => {
      const patient = PRESET_PATIENTS[0]; // Ramesh Patel, Mild, dailyCap = 5
      render(<RoadmapView patientProfile={patient} />);

      expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      expect(screen.getByTestId('dementia-stage-badge')).toHaveTextContent('Mild / Early Stage');
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 5 Games Completed');

      // Check that exactly 5 game nodes are rendered
      const nodes = screen.getAllByRole('button', { name: /Step \d of 5/i });
      expect(nodes).toHaveLength(5);
    });

    it('renders 3 sequential nodes for Moderate stage patient (preset-2, dailyCap = 3)', () => {
      const patient = PRESET_PATIENTS[1]; // Savitri Devi, Moderate, dailyCap = 3
      render(<RoadmapView patientProfile={patient} />);

      expect(screen.getByText('Savitri Devi')).toBeInTheDocument();
      expect(screen.getByTestId('dementia-stage-badge')).toHaveTextContent('Moderate / Middle Stage');
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 3 Games Completed');

      const nodes = screen.getAllByRole('button', { name: /Step \d of 3/i });
      expect(nodes).toHaveLength(3);
    });

    it('renders 2 sequential nodes for Severe stage patient (preset-3, dailyCap = 2)', () => {
      const patient = PRESET_PATIENTS[2]; // Anil Kumar, Severe, dailyCap = 2
      render(<RoadmapView patientProfile={patient} />);

      expect(screen.getByText('Anil Kumar')).toBeInTheDocument();
      expect(screen.getByTestId('dementia-stage-badge')).toHaveTextContent('Severe / Late Stage');
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 2 Games Completed');

      const nodes = screen.getAllByRole('button', { name: /Step \d of 2/i });
      expect(nodes).toHaveLength(2);
    });
  });

  describe('2. Active Target Node Behavior & Game Selection', () => {
    it('marks the first uncompleted game as ACTIVE with callout badge and triggers onSelectGame when tapped', () => {
      const patient = PRESET_PATIENTS[1]; // Savitri Devi: 3 games
      const handleSelectGame = vi.fn();

      render(
        <RoadmapView
          patientProfile={patient}
          level={4}
          completedGameIds={[]}
          onSelectGame={handleSelectGame}
        />
      );

      // Node 0 should have "Play Today" callout badge
      expect(screen.getByTestId('active-callout-badge')).toBeInTheDocument();
      expect(screen.getByText('Play Today')).toBeInTheDocument();

      // First node should be active (aria-label contains ACTIVE) and clickable
      const allNodeBtns = screen.getAllByRole('button', { name: /Step \d of 3/i });
      const firstNodeBtn = allNodeBtns[0];
      expect(firstNodeBtn).not.toBeDisabled();
      expect(firstNodeBtn).toHaveAttribute('aria-label', expect.stringContaining('ACTIVE'));

      fireEvent.click(firstNodeBtn);

      expect(handleSelectGame).toHaveBeenCalledTimes(1);
      // Called with (gameId, level, difficultyParams)
      expect(handleSelectGame).toHaveBeenCalledWith(
        expect.any(String),
        4,
        expect.objectContaining({
          previewTimeMs: expect.any(Number)
        })
      );
    });

    it('does not trigger onSelectGame when a locked node is clicked', () => {
      const patient = PRESET_PATIENTS[1]; // Savitri Devi: 3 games
      const handleSelectGame = vi.fn();

      render(
        <RoadmapView
          patientProfile={patient}
          level={5}
          completedGameIds={[]}
          onSelectGame={handleSelectGame}
        />
      );

      // Node at index 1 should be locked (not the first uncompleted)
      const allNodeBtns = screen.getAllByRole('button', { name: /Step \d of 3/i });
      const secondNodeBtn = allNodeBtns[1];
      expect(secondNodeBtn).toBeDisabled();
      expect(secondNodeBtn).toHaveAttribute('aria-disabled', 'true');
      expect(secondNodeBtn).toHaveAttribute('title', 'Complete previous game to unlock');

      fireEvent.click(secondNodeBtn);
      expect(handleSelectGame).not.toHaveBeenCalled();

      // Verify lock icons exist for locked nodes
      const lockIcons = screen.getAllByTestId('locked-icon');
      expect(lockIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('3. In-Progress Node State (4th visual state)', () => {
    it('renders an in-progress node with teal styling and hourglass badge when activeGameId is set', () => {
      const patient = PRESET_PATIENTS[1]; // 3 games

      // Discovery render to get the first game ID
      const { container: dc, unmount: unmountDisc } = render(
        <RoadmapView patientProfile={patient} level={5} completedGameIds={[]} />
      );
      const firstNodeEl = dc.querySelector('[data-testid^="roadmap-node-"]:not([data-testid^="roadmap-node-container"])');
      const firstGameId = firstNodeEl?.getAttribute('data-testid')?.replace('roadmap-node-', '');
      unmountDisc(); // Clean up to avoid multiple-elements conflict

      // Render with that game as in-progress
      const { container } = render(
        <RoadmapView
          patientProfile={patient}
          level={5}
          completedGameIds={[]}
          activeGameId={firstGameId}
        />
      );

      // Should show in-progress callout badge (not "Play Today")
      expect(container.querySelector('[data-testid="in-progress-callout-badge"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="in-progress-callout-badge"]')).toHaveTextContent('⏳ In Progress');

      // The in-progress node should be clickable (not disabled)
      const inProgressNode = container.querySelector(`[data-testid="roadmap-node-${firstGameId}"]`);
      expect(inProgressNode).not.toBeDisabled();
      expect(inProgressNode).toHaveAttribute('aria-label', expect.stringContaining('IN-PROGRESS'));

      // Should show in-progress icon overlay
      expect(container.querySelector('[data-testid="in-progress-icon"]')).toBeInTheDocument();

      // Sub-label should say "Resume"
      expect(container).toHaveTextContent('Resume');
    });
  });

  describe('4. Progression Flow, Star Ratings & Daily Goal Celebration', () => {
    it('progresses to next node, displays checkmarks and stars, and updates progress bar', () => {
      const patient = PRESET_PATIENTS[1]; // Savitri Devi (3 games)

      // Render once to discover the three game IDs assigned today
      const { container: discoveryContainer, unmount: unmountDiscovery } = render(
        <RoadmapView patientProfile={patient} level={3} completedGameIds={[]} />
      );
      const nodeEls = discoveryContainer.querySelectorAll('[data-testid^="roadmap-node-"]:not([data-testid^="roadmap-node-container"])');
      const game0Id = nodeEls[0]?.getAttribute('data-testid')?.replace('roadmap-node-', '');
      const game1Id = nodeEls[1]?.getAttribute('data-testid')?.replace('roadmap-node-', '');
      const game2Id = nodeEls[2]?.getAttribute('data-testid')?.replace('roadmap-node-', '');
      unmountDiscovery(); // Clean up before next render to avoid multiple-elements errors

      // Render with game0 completed
      const { rerender, container } = render(
        <RoadmapView
          patientProfile={patient}
          level={3}
          completedGameIds={[game0Id]}
          gameScores={{ [game0Id]: { stars: 3, accuracy: 95 } }}
        />
      );

      const within_c = (testId) => container.querySelector(`[data-testid="${testId}"]`);

      // 1 / 3 completed
      expect(within_c('daily-progress-tracker')).toHaveTextContent('Daily Progress: 1 / 3 Games Completed');
      expect(container.querySelector('.font-black.text-teal-700')).toHaveTextContent('33%');

      // Node 0 should show completed checkmark and stars
      expect(container.querySelector('[data-testid="completed-check-icon"]')).toBeInTheDocument();
      expect(container.querySelector(`[data-testid="node-stars-${game0Id}"]`)).toBeInTheDocument();

      // Node 1 should now be the active node
      const secondNodeBtn = container.querySelector(`[data-testid="roadmap-node-${game1Id}"]`);
      expect(secondNodeBtn).not.toBeDisabled();
      expect(secondNodeBtn).toHaveAttribute('aria-label', expect.stringContaining('ACTIVE'));

      // Complete all 3 games
      rerender(
        <RoadmapView
          patientProfile={patient}
          level={3}
          completedGameIds={[game0Id, game1Id, game2Id]}
          gameScores={{
            [game0Id]: { stars: 3 },
            [game1Id]: { stars: 2 },
            [game2Id]: { stars: 3 }
          }}
        />
      );

      // 3 / 3 completed (100%)
      expect(within_c('daily-progress-tracker')).toHaveTextContent('Daily Progress: 3 / 3 Games Completed');
      expect(container.querySelector('.font-black.text-teal-700')).toHaveTextContent('100%');
      expect(within_c('goal-achieved-banner')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="goal-achieved-banner"]')).toHaveTextContent(
        /Outstanding! Today's recommended cognitive journey is complete/i
      );
    });
  });

  describe('5. Fallback & Local Storage Resolution', () => {
    it('falls back to Profile 1 (Ramesh Patel) when no props or stored session exist', () => {
      render(<RoadmapView />);

      expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      expect(screen.getByTestId('dementia-stage-badge')).toHaveTextContent('Mild / Early Stage');
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 5 Games Completed');
    });

    it('reads active patient profile from localStorage if present', () => {
      const customPatient = {
        id: 'custom-pat-1',
        name: 'Jyoti Sharma',
        stage: 'Mild / Early Stage',
        dailyCap: 4,
        masteryScore: 60
      };
      localStorage.setItem('neurosetu_active_patient', JSON.stringify(customPatient));

      render(<RoadmapView />);

      expect(screen.getByText('Jyoti Sharma')).toBeInTheDocument();
      expect(screen.getByTestId('daily-progress-tracker')).toHaveTextContent('Daily Progress: 0 / 4 Games Completed');
      expect(screen.getByTestId('active-level-indicator')).toHaveTextContent('Level 6 / 10');
    });

    it('calls onExit when exit button is clicked', () => {
      const handleExit = vi.fn();
      render(<RoadmapView onExit={handleExit} />);

      const exitBtn = screen.getByRole('button', { name: /Exit to Hub/i });
      fireEvent.click(exitBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('6. Individual RoadmapNode Unit Tests', () => {
    const mockGame = {
      id: 'grandmas-shopping-list',
      name: "Grandma's Shopping List",
      icon: '👵',
      category: 'Memory'
    };

    it('meets minimum 48px touch target accessibility standards', () => {
      render(
        <RoadmapNode
          game={mockGame}
          index={0}
          totalNodes={3}
          status="active"
        />
      );

      const button = screen.getByTestId('roadmap-node-grandmas-shopping-list');
      expect(button.className).toContain('min-h-[48px]');
      expect(button.className).toContain('min-w-[48px]');
      expect(button.className).toContain('w-20');
    });

    it('renders 1, 2, or 3 stars accurately in completed state', () => {
      const { rerender } = render(
        <RoadmapNode
          game={mockGame}
          index={0}
          totalNodes={3}
          status="completed"
          stars={2}
        />
      );

      const starsContainer = screen.getByTestId('node-stars-grandmas-shopping-list');
      expect(starsContainer).toHaveAttribute('aria-label', '2 of 3 stars earned');

      rerender(
        <RoadmapNode
          game={mockGame}
          index={0}
          totalNodes={3}
          status="completed"
          stars={3}
        />
      );

      expect(starsContainer).toHaveAttribute('aria-label', '3 of 3 stars earned');
    });

    it('renders in-progress state with teal styling and hourglass badge', () => {
      render(
        <RoadmapNode
          game={mockGame}
          index={0}
          totalNodes={3}
          status="in-progress"
        />
      );

      // Should not be disabled
      const btn = screen.getByTestId('roadmap-node-grandmas-shopping-list');
      expect(btn).not.toBeDisabled();
      expect(btn.className).toContain('teal');

      // Callout badge and overlay icon
      expect(screen.getByTestId('in-progress-callout-badge')).toBeInTheDocument();
      expect(screen.getByTestId('in-progress-icon')).toBeInTheDocument();

      // Sub-label text
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    it('in-progress node triggers onSelect callback', () => {
      const handleSelect = vi.fn();
      render(
        <RoadmapNode
          game={mockGame}
          index={0}
          totalNodes={3}
          status="in-progress"
          level={5}
          onSelect={handleSelect}
        />
      );

      fireEvent.click(screen.getByTestId('roadmap-node-grandmas-shopping-list'));
      expect(handleSelect).toHaveBeenCalledWith('grandmas-shopping-list', 5);
    });

    it('locked node does not trigger onSelect callback', () => {
      const handleSelect = vi.fn();
      render(
        <RoadmapNode
          game={mockGame}
          index={1}
          totalNodes={3}
          status="locked"
          onSelect={handleSelect}
        />
      );

      const btn = screen.getByTestId('roadmap-node-grandmas-shopping-list');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });
});
