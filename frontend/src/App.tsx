import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layout";
import AppConfigPage from "./pages/AppConfigPage";
import FeedbackReviewPage from "./pages/FeedbackReviewPage";
import ChatPage from "./pages/ChatPage";
import "./App.css";

const APP = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/settings" element={<AppConfigPage />} />
          <Route path="/feedbacks" element={<FeedbackReviewPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default APP;
