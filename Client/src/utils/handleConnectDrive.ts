// const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const handleConnectDrive = (): void => {
  // window.location.href = `${API_URL}/vip-list`;
  window.location.href = `${BACKEND_URL}/auth/google`;
};

export default handleConnectDrive;
