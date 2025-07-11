import { useEffect, useState } from 'react';
import axios from 'axios';
import { login, logout } from './store/authSlice.js'
import { Header, Loading } from './componenets/index.js';
import { Outlet, useLocation} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket } from './lib/socket.js';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const status = useSelector(state => state.auth.status);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/getCurrentUser`, { withCredentials: true })
      .then((userData) => {
        if (userData.data.message) {
          dispatch(login(userData.data.message));
          connectSocket(userData.data.message._id);
        }
        else {
          disconnectSocket();
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error("User not logged in");
      })
      .finally(() => setLoading(false));
  }, [dispatch, status]);

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      {status ? (<Header />) : <Outlet />}
    </div>
  );
}

export default App;
