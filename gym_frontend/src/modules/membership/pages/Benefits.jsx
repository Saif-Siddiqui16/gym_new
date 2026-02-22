import React from 'react';
import Card from '../../../components/ui/Card';
import BenefitsList from '../components/BenefitsList';
import { BENEFITS } from '../data/mockMemberships';

const Benefits = () => {
    // We can reuse BenefitsList component logic or just map BENEFITS directly for a more custom "Master" view.
    // Let's use BenefitsList for consistency but we need to pass all IDs.
    const allBenefitIds = BENEFITS.map(b => b.id);

    return (
        <div className="fade-in">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Membership Benefits</h2>
            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--muted)', maxWidth: '600px' }}>
                These are the standardized benefits available across various membership plans.
                Configure them when creating new plans or assigning memberships.
            </div>

            <Card>
                {/* Reusing the shared component in 'grid' layout */}
                <BenefitsList benefitIds={allBenefitIds} layout="grid" />
            </Card>
        </div>
    );
};

export default Benefits;
