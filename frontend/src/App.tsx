import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppConfigPage from './pages/AppConfigPage'
import FeedbackReviewPage from './pages/FeedbackReviewPage'
import ChatPage from './pages/ChatPage'
import './App.css'

const APP = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/settings" element={<AppConfigPage />} />
        <Route path="/feedbacks" element={<FeedbackReviewPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default APP
