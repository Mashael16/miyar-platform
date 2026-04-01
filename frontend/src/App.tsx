import React from 'react'; 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import Tasks from "./pages/TasksPage";
import MyEvaluations from "./pages/MyEvaluations";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Me from "./pages/Me";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={
           <ProtectedRoute> 
            <MainLayout/> 

            </ProtectedRoute> }
            >
        <Route path="/dashboard" element={<Dashboard /> }/>
        <Route path="/TasksPage" element={ <Tasks/> } />
        <Route path="/MyEvaluations" element={<MyEvaluations />} />
        <Route path="/me" element={<Me/> }/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;