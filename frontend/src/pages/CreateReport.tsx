import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateReportForm from '../components/CreateReportForm';

const CreateReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestId = searchParams.get('requestId');
  
  const handleClose = () => {
    navigate(-1);
  };
  
  const handleReportCreated = () => {
    // After report is created, redirect back
    setTimeout(() => {
      navigate('/admin');
    }, 1500);
  };

  return (
    <CreateReportForm 
      onClose={handleClose}
      onReportCreated={handleReportCreated}
      requestId={requestId || undefined}
    />
  );
};

export default CreateReport;