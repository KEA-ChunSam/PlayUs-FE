import styles from "./LoginComplete.module.css";
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import React from "react";
import {useNavigate} from "react-router-dom";

const LoginComplete = () => {
    const navigate = useNavigate();
    const navigateHome = (e) => {
        navigate("/home");
    }
    return(
        <div className={styles.container}>
            <LoginHeader/>
            <div className={styles.text}>
                <p className={styles.subtitle}>
                    가입이 완료되었어요!
                <br/>
                    PlayUs와 함께 즐거운 여행 되세요!
                </p>
                <button className={styles.button} onClick={navigateHome}>
                    시작하기
                </button>
            </div>
        </div>
    )
}
export default LoginComplete;