import React, { useState, useEffect } from 'react';
import { familyDataService } from '../../data/familyDataService';
import ProgressRewardHeader from '../../shared/ProgressRewardHeader';
import DynamicHintDrawer from '../../shared/DynamicHintDrawer';
import TimelineTrack from './TimelineTrack';
import EventCard from './EventCard';

const LifeStoryTimelineGame = ({ onBackToMenu }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active game session
  const [unplacedEvents, setUnplacedEvents] = useState([]);
  const [timelineSlots, setTimelineSlots] = useState([]); // Array of Event | null
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Result & Review phase
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState({}); // { [index]: { isCorrect: boolean, trueEvent: Event } }
  const [feedbackMessage, setFeedbackMessage] = useState('Arrange your life moments in the order they happened');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const events = await familyDataService.getTimelineEvents();
      // Select 4-5 events for an elder-friendly pacing
      const chronological = [...events].sort((a, b) => parseInt(a.date) - parseInt(b.date));
      const chosen = chronological.slice(0, 5);

      setAllEvents(chosen);
      // Shuffle unplaced deck
      setUnplacedEvents([...chosen].sort(() => 0.5 - Math.random()));
      // Empty slots corresponding to the number of chosen events
      setTimelineSlots(new Array(chosen.length).fill(null));
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Total slots and filled count
  const totalSlotsCount = timelineSlots.length;
  const filledSlotsCount = timelineSlots.filter(Boolean).length;
  const isReadyToSubmit = filledSlotsCount === totalSlotsCount && totalSlotsCount > 0;

  // Handle selecting an unplaced event or a slot-placed event (for tap-to-place)
  const handleSelectEvent = (event) => {
    if (isSubmitted) return;
    if (selectedEventId === event.id) {
      setSelectedEventId(null);
    } else {
      setSelectedEventId(event.id);
      setFeedbackMessage(`Now tap an empty timeline slot to place "${event.title}"`);
    }
  };

  // Place event into slot (supports drag drop and tap)
  const handlePlaceEventIntoSlot = (eventIdFromDrag, targetSlotIndex) => {
    if (isSubmitted) return;
    const targetId = eventIdFromDrag || selectedEventId;
    if (!targetId) return;

    // Find the event either in unplaced deck or existing slots
    let eventObj = unplacedEvents.find((e) => e.id === targetId);
    let fromSlotIndex = -1;

    if (!eventObj) {
      fromSlotIndex = timelineSlots.findIndex((e) => e && e.id === targetId);
      if (fromSlotIndex !== -1) {
        eventObj = timelineSlots[fromSlotIndex];
      }
    }

    if (!eventObj) return;

    // Existing event in target slot
    const existingInTarget = timelineSlots[targetSlotIndex];

    const newSlots = [...timelineSlots];
    newSlots[targetSlotIndex] = eventObj;

    if (fromSlotIndex !== -1) {
      // Swapping between slots
      newSlots[fromSlotIndex] = existingInTarget;
    } else {
      // Coming from unplaced deck
      const newUnplaced = unplacedEvents.filter((e) => e.id !== targetId);
      if (existingInTarget) {
        newUnplaced.push(existingInTarget);
      }
      setUnplacedEvents(newUnplaced);
    }

    setTimelineSlots(newSlots);
    setSelectedEventId(null);
    setFeedbackMessage(`Placed into Chapter ${targetSlotIndex + 1}.`);
  };

  // Submit and check chronological order gently
  const handleSubmitTimeline = () => {
    const trueChronological = [...allEvents].sort((a, b) => parseInt(a.date) - parseInt(b.date));
    const res = {};
    let correctCount = 0;

    timelineSlots.forEach((slotEvent, idx) => {
      const correctEvent = trueChronological[idx];
      const isCorrect = slotEvent?.id === correctEvent?.id;
      if (isCorrect) correctCount++;
      res[idx] = {
        isCorrect,
        correctEvent,
      };
    });

    setResults(res);
    setIsSubmitted(true);
    setStreak(correctCount);

    if (correctCount === timelineSlots.length) {
      setFeedbackMessage('Marvelous! You remembered the exact sequence of your life journey! 🌟');
    } else {
      setFeedbackMessage('Wonderful reflections! Let’s view the years together.');
    }
  };

  const handleReset = () => {
    setUnplacedEvents([...allEvents].sort(() => 0.5 - Math.random()));
    setTimelineSlots(new Array(allEvents.length).fill(null));
    setSelectedEventId(null);
    setIsSubmitted(false);
    setResults({});
    setStreak(0);
    setFeedbackMessage('Arrange your life moments in chronological order');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient-accent mb-4"></div>
        <p className="text-xl font-medium text-patient-primary">Loading life chapters and memories...</p>
      </div>
    );
  }

  const hintContent = (
    <div>
      <h4 className="font-bold text-patient-primary mb-1">Story Clues:</h4>
      <p className="text-sm text-patient-secondary mb-2">
        Remember: Childhood and birth happen first, followed by school/first job, marriage, children, and grandchildren.
      </p>
      <p className="text-xs text-patient-accent font-semibold">
        Tap an event card below, then tap a timeline box to put it in sequence!
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        {onBackToMenu && (
          <button
            onClick={onBackToMenu}
            className="text-patient-secondary hover:text-patient-primary font-semibold text-sm py-2 px-3 rounded-lg hover:bg-patient-border-subtle"
          >
            ← Back to Game Hub
          </button>
        )}
        <span className="text-xs uppercase tracking-wider font-bold text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
          Game 4 • Life Story Timeline
        </span>
      </div>

      {/* Progress & Encouragement */}
      <ProgressRewardHeader
        currentStep={filledSlotsCount}
        totalSteps={totalSlotsCount}
        streak={streak}
        message={feedbackMessage}
      />

      {/* Interactive Timeline Track */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-patient-primary text-base">
            Your Life Story Track
          </h3>
          {isReadyToSubmit && !isSubmitted && (
            <button
              type="button"
              onClick={handleSubmitTimeline}
              className="px-5 py-2.5 bg-patient-accent hover:bg-patient-accent-hover text-white font-bold text-sm rounded-xl shadow-soft transition-all animate-bounce"
            >
              Reveal Timeline Dates ➔
            </button>
          )}
        </div>

        <TimelineTrack
          slots={timelineSlots}
          selectedCardId={selectedEventId}
          onDropEvent={(id, idx) => handlePlaceEventIntoSlot(id, idx)}
          onSlotClick={(idx) => handlePlaceEventIntoSlot(null, idx)}
          onSelectEvent={handleSelectEvent}
          isRevealed={isSubmitted}
          results={results}
        />
      </div>

      {/* Review Screen Summary if Submitted */}
      {isSubmitted ? (
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-accent/30 shadow-soft mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🕊️</span>
            <div>
              <h3 className="text-2xl font-bold text-patient-primary">
                A Beautiful Journey Through Time
              </h3>
              <p className="text-sm text-patient-secondary">
                Review your cherished milestones with dates revealed above.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3.5 bg-patient-accent text-white font-bold rounded-xl text-base hover:bg-patient-accent-hover active:scale-95 transition-all shadow-soft"
            >
              Play Again
            </button>
            {onBackToMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                className="flex-1 py-3.5 bg-patient-canvas border border-patient-border text-patient-primary font-bold rounded-xl text-base hover:bg-patient-border-subtle active:scale-95 transition-all"
              >
                Back to All Games
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Event Cards to place */
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-patient-primary text-base">
              Milestone Cards to Place ({unplacedEvents.length} remaining)
            </h4>
            <span className="text-xs text-patient-muted">
              Tap a card, then tap a chapter box above
            </span>
          </div>

          <div className="p-4 bg-patient-canvas rounded-3xl border-2 border-dashed border-patient-border flex flex-wrap gap-4 items-center justify-center min-h-[160px]">
            {unplacedEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                isSelected={selectedEventId === ev.id}
                onSelect={() => handleSelectEvent(ev)}
                isRevealed={false}
              />
            ))}
            {unplacedEvents.length === 0 && (
              <div className="text-center py-4 text-patient-accent font-bold">
                All events are placed on your timeline! Click "Reveal Timeline Dates" above to view your story.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Inactivity Hint */}
      <DynamicHintDrawer
        hintContent={hintContent}
        inactivitySeconds={14}
      />
    </div>
  );
};

export default LifeStoryTimelineGame;

