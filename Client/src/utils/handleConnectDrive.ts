const API_URL = import.meta.env.VITE_API_URL;

const handleConnectDrive = (): void => {
  window.location.href = `${API_URL}/vip-list`;
  // window.location.href = "http://localhost:3000/auth/google";
};

export default handleConnectDrive;
