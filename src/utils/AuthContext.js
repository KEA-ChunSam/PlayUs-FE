import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            res => res,
            async error => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        console.log("🔄 AccessToken 만료됨, 재발급 시도 중...");
                        const res = await axios.post(`${baseUrl}/user/auth/reissue`, {}, { withCredentials: true });
                        console.log("✅ AccessToken 재발급 성공:", res);
                        return axios(originalRequest);
                    } catch (e) {
                        console.warn("❌ AccessToken 재발급 실패:", e);
                        setUser(null);

                        navigate("/login");
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [baseUrl, navigate]);

    const fetchMyInfo = async () => {
        const res = await axios.get(`${baseUrl}/user/profile`, { withCredentials: true });
        return res.data;
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await fetchMyInfo();
                setUser(userData);
            } catch (err) {
                console.error("사용자 정보 불러오기 실패", err);
            }
        };
        loadUser();
    }, [baseUrl]);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);