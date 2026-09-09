import React, { useState, useEffect } from 'react';
import { familyDataService } from './data/familyDataService';
import CardContainer from './shared/CardContainer';
import ProgressRewardHeader from './shared/ProgressRewardHeader';
import DynamicHintDrawer from './shared/DynamicHintDrawer';

const Stage1Demo = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await familyDataService.getMembers();
      setMembers(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-patient-primary">Loading Family Data...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-patient-canvas min-h-screen">
      <h1 className="text-3xl font-bold text-patient-primary mb-6">Stage 1: Shared Components Demo</h1>
      
      <ProgressRewardHeader 
        currentStep={2} 
        totalSteps={5} 
        streak={3} 
        message="Great job so far!" 
      />

      <div className="mb-8">
        <h2 className="text-xl font-bold text-patient-primary mb-4">CardContainer Variations</h2>
        <div className="flex flex-wrap gap-4">
          <CardContainer 
            photoUrl={members[0]?.photoUrl} 
            name={members[0]?.name} 
            state="default" 
            size="md"
          />
          <CardContainer 
            photoUrl={members[1]?.photoUrl} 
            name={members[1]?.name} 
            state="selected" 
            size="md"
          />
          <CardContainer 
            photoUrl={members[2]?.photoUrl} 
            name={members[2]?.name} 
            state="correct" 
            size="md"
          />
          <CardContainer 
            name="No Photo" 
            state="incorrect" 
            size="md"
          />
          <CardContainer 
            photoUrl={members[3]?.photoUrl} 
            name={members[3]?.name} 
            state="default" 
            size="md"
            hintOverlay={true}
          />
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-soft">
        <h2 className="text-xl font-bold text-patient-primary mb-2">Dynamic Hint Drawer</h2>
        <p className="text-patient-secondary mb-4">
          Wait 5 seconds without moving your mouse/typing to see the hint button pulse, or click it manually.
        </p>
        <DynamicHintDrawer 
          hintContent={<p>This is a helpful hint fetched from the game logic. Maybe it's a first letter or a related fact!</p>}
          inactivitySeconds={5}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-patient-primary mb-4">Raw Data from familyDataService</h2>
        <pre className="bg-white p-4 rounded-xl shadow-soft text-sm overflow-auto max-h-96">
          {JSON.stringify(members, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Stage1Demo;

