// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;

    // ✅ 여기에 fetchMyInfo 함수 넣기
    const fetchMyInfo = async () => {
        const res = await axios.get(`${baseUrl}/user/profile`, { withCredentials: true });
        console.log(res.data);
        console.log(document.cookie);
        return res.data; // { id, nickname, ... }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await fetchMyInfo(); // 호출 위치
                setUser(userData);
            } catch (err) {
                console.error("사용자 정보 불러오기 실패", err);
            }
        };

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);