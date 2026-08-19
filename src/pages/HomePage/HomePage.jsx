import {useEffect, useState} from "react";
import {api} from "../../services/api.js";
import styles from "./HomePage.module.css";


export default function HomePage() {
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        api.get("/")
            .then(response => console.log("API conectada:", response.data))
            .catch(error => console.error("Erro na API:", error));
    }, []);
  return (
    <div className={styles.homePage}>
      <h1>WM_Imports - Home</h1>
      <p>Bem-vindo à Página Inicial!</p>
    </div>
  );
}