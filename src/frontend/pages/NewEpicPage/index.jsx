import React from 'react';
import EpicModal from '../../components/modals/EpicModal';
import './styles.scss';

const NewEpicPage = () => {
  return (
    <div className="new-epic-page">
      <EpicModal isModal={false} showHeader={true} />
    </div>
  );
};

export default NewEpicPage;
