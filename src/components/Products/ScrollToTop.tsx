
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop é um componente utilitário que rola a janela para o topo
 * sempre que a rota muda (quando o location.pathname muda).
 * 
 * Coloque este componente no topo da sua hierarquia de componentes,
 * logo após o Router, para garantir que nas trocas de página o scroll vai para o topo.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
