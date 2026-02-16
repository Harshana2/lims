import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowProvider } from './context/WorkflowContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RequestPage } from './pages/RequestPage';
import { QuotationPage } from './pages/QuotationPage';
import { CRFPage } from './pages/CRFPage';
import { ParameterAssignmentPage } from './pages/ParameterAssignmentPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { EnvironmentalSamplingPage } from './pages/EnvironmentalSamplingPage';
import { ReviewSignPage } from './pages/ReviewSignPage';
import { ReportGenerationPage } from './pages/ReportGenerationPage';

function App() {
  return (
    <WorkflowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<RequestPage />} />
            <Route path="/quotations" element={<QuotationPage />} />
            <Route path="/crf" element={<CRFPage />} />
            <Route path="/parameter-assignment" element={<ParameterAssignmentPage />} />
            <Route path="/data-entry" element={<DataEntryPage />} />
            <Route path="/environmental-sampling" element={<EnvironmentalSamplingPage />} />
            <Route path="/review-sign" element={<ReviewSignPage />} />
            <Route path="/report-generation" element={<ReportGenerationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WorkflowProvider>
  );
}

export default App;
