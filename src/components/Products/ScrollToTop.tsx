import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop é um componente utilitário que rola a janela para o topo
 * sempre que a rota muda (quando o location.pathname muda).
 * 
 * Coloque este componente no topo da sua hierarquia de componentes,
 * logo após o Router.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo suavemente quando a rota muda
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Para uma rolagem suave
    });
  }, [pathname]);

  return null; // Este componente não renderiza nada
};

export default ScrollToTop;