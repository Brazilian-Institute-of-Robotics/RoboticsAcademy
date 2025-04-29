import React, { createContext, useContext, useEffect, useState } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedConfig = localStorage.getItem('appConfig');

    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      setLoading(false);
    } else {
      fetch('/api/v1/config/')
        .then(res => {
          if (!res.ok) throw new Error('Erro ao buscar configuração');
          return res.json();
        })
        .then(data => {
          setConfig(data);
          localStorage.setItem('appConfig', JSON.stringify(data));
          setLoading(false);
        })
        .catch(err => {
          console.error('Erro ao buscar configuração:', err);
          setLoading(false);
        });
    }
  }, []);

  // Permite atualizar a configuração manualmente (ex: via outro endpoint)
  const updateConfig = (newConfig) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('appConfig', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
