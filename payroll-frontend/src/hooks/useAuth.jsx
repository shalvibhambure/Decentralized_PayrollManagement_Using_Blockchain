const useAuth = () => {
    const data = JSON.parse(localStorage.getItem('PMS-login'));
    const logout = () => {
        localStorage.removeItem('PMS-login');
    }
    const login = (data) => {
        localStorage.setItem('PMS-login', data);
    }
    return {data, logout, login};
}

export default useAuth;