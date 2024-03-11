import React from 'react';
import {Button, confirmIfDirty, useGlobalDirtyState} from '@tryghost/admin-x-design-system';

const ExitSettingsButton: React.FC = () => {
    const {isDirty} = useGlobalDirtyState();

    const navigateAway = () => {
        window.location.hash = '/dashboard';
    };

    return (
        <Button data-testid="exit-settings" icon='close' id="done-button" label='' link={true} title='ESC' onClick={() => confirmIfDirty(isDirty, navigateAway)} />
    );
};

export default ExitSettingsButton;
