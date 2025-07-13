import React from 'react';
import { useParams } from 'react-router-dom';
import EpicModal from '../../components/modals/EpicModal';
import './styles.scss';

const EpicDetailPage = () => {
  const { id } = useParams();

  return (
    <EpicModal 
      epicId={id} 
      isModal={false} 
      showHeader={true}
    />
  );
};

export default EpicDetailPage;
