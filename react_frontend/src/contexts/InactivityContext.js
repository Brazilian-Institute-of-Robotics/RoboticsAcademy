import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const InactivityContext = createContext();

//Default timeout 30 minutes
export const InactivityProvider = ({ children, timeout = 30 * 60 * 1000 }) => {
  const [lastActivity, setLastActivity] = useState(() => {
    const savedTime = localStorage.getItem('lastActivity');
    return savedTime ? Number(savedTime) : Date.now();
  });

  // Função de logout automático
  const sendLogout = useCallback(async () => {  // Adicionado async
    try {
      const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT
      const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

      window.RoboticsReactComponents.MessageSystem.Loading.showLoading(
        "Logout user..."
      );

      if (!csrfToken) {
        console.error("CSRF token não encontrado!");
        return;
      }
  
      // Requisição com await para garantir conclusão
      const response = await fetch(`${serverBase}/api/v1/logout/`, { 
        method: 'POST', 
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
  
      if (!response.ok) {
        window.RoboticsReactComponents.MessageSystem.Loading.hideLoading()
        alert("Error no logout por inatividade: problema na resposta da API")
      }else{
        window.RoboticsReactComponents.MessageSystem.Loading.hideLoading()
        localStorage.removeItem('lastActivity');
        window.location.reload();
      }
  
    } catch (error) {
      window.RoboticsReactComponents.MessageSystem.Loading.hideLoading()
      alert("Error no logout por inatividade: Problema no front")
      console.error("Erro no logout automático:", error);
    }
  }, []);

  // Reseta o timer a cada interação do usuário
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem('lastActivity', String(now));
  }, []);

  // Verifica inatividade
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    //Verifica a inatividade a cada 30s
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeout) {
        sendLogout();
      }
    }, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [lastActivity, timeout, resetTimer, sendLogout]);

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
    </InactivityContext.Provider>
  );
};

export const useInactivity = () => useContext(InactivityContext);