import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import DebtPage from './pages/DebtPage.jsx';
import SavingPage from './pages/SavingPage.jsx'
import RecurringPayment from './pages/RecurringPayment.jsx';
import SearchedUserPage from './pages/SearchedUserPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/signup',
        element: <SignupPage />
      },
      {
        path: '/budget',
        element: <BudgetPage />
      },
      {
        path: '/debt',
        element: <DebtPage />
      },
      {
        path: '/saving',
        element: <SavingPage />
      },
      {
        path: '/recurringPayment',
        element: <RecurringPayment />
      },
      {
        path: '/searchedUsers',
        element: <SearchedUserPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/chat',
        element: <ChatPage />
      }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
