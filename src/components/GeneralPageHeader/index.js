import React from 'react';

const GeneralPageHeader = React.memo(props => {
    const { title, children } = props;
    return (
        <div className="pjHeader">
            <span style={{ position: 'absolute', left: '24px' }}>{title}</span>
            {children}
        </div>
    );
});

export default GeneralPageHeader;
